#!/usr/bin/env bash
# Restore acceptance test. NEVER point this at production.
set -Eeuo pipefail
umask 077

need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required tool: $1" >&2; exit 1; }; }
ask_secret() {
  local prompt="$1" var="$2" value=""
  IFS= read -r -s -p "$prompt" value
  printf '\n' >&2
  printf -v "$var" '%s' "$value"
  unset value
}
for tool in pg_restore psql python3 mktemp rm chmod; do need "$tool"; done

DUMP="\${1:-}"
if [[ -z "$DUMP" || ! -f "$DUMP" ]]; then
  echo "Usage: $0 /path/to/humanity-one-production.dump" >&2
  exit 2
fi
pg_restore --list "$DUMP" >/dev/null
echo "This test restores into a SEPARATE, EMPTY, DISPOSABLE PostgreSQL database."
echo "It does not create or delete databases. Create a throwaway restore/test database first."
read -r -p "Type RESTORE-TO-DISPOSABLE-DB to continue: " ACK
[[ "$ACK" == "RESTORE-TO-DISPOSABLE-DB" ]] || { echo "Cancelled."; exit 1; }

DB_URL=""
ask_secret "Disposable test DATABASE_URL (hidden): " DB_URL
[[ -n "$DB_URL" ]] || { echo "DATABASE_URL is required." >&2; unset DB_URL; exit 1; }

WORK="$(mktemp -d "\${TMPDIR:-/tmp}/humanity-one-restore-test.XXXXXX")"
chmod 700 "$WORK"
cleanup() {
  local status=$?
  rm -rf -- "$WORK"
  unset DB_URL
  return "$status"
}
trap cleanup EXIT

HUMANITY_ONE_DB_URL="$DB_URL" python3 - "$WORK/pg_service.conf" "$WORK/pgpass" <<'PY'
import os, sys
from urllib.parse import parse_qs, unquote, urlsplit
raw = os.environ.pop("HUMANITY_ONE_DB_URL")
url = urlsplit(raw)
if url.scheme not in ("postgres", "postgresql"):
    raise SystemExit("DATABASE_URL must use postgres:// or postgresql://")
host = url.hostname or ""
port = str(url.port or 5432)
dbname = unquote(url.path.lstrip("/"))
user = unquote(url.username or "")
password = unquote(url.password or "")
if not host or not dbname or not user or not password:
    raise SystemExit("DATABASE_URL must include host, database, username and password.")
if not any(word in dbname.lower() for word in ("test", "restore", "sandbox", "recovery", "staging")):
    raise SystemExit("Refusing database name without test/restore/sandbox/recovery/staging marker.")
values = {"host": host, "port": port, "dbname": dbname, "user": user}
query = parse_qs(url.query)
for key in ("sslmode", "sslrootcert", "sslcert", "sslkey", "application_name", "channel_binding", "target_session_attrs"):
    if query.get(key): values[key] = query[key][0]
def esc(s): return s.replace("\\", "\\\\").replace(":", "\\:")
with open(sys.argv[1], "w", encoding="utf-8") as f:
    f.write("[humanity_one_restore_test]\n")
    for k, v in values.items(): f.write(f"{k}={v}\n")
os.chmod(sys.argv[1], 0o600)
with open(sys.argv[2], "w", encoding="utf-8") as f:
    f.write(":".join(esc(x) for x in ("*", port, dbname, user, password)) + "\n")
os.chmod(sys.argv[2], 0o600)
PY
unset DB_URL

export PGSERVICEFILE="$WORK/pg_service.conf" PGPASSFILE="$WORK/pgpass" PGCONNECT_TIMEOUT=20
EXISTING="$(psql "service=humanity_one_restore_test" -X -v ON_ERROR_STOP=1 -Atc "SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')")"
if [[ "$EXISTING" != "0" ]]; then
  echo "Refusing restore: target database is not empty (user tables: $EXISTING)." >&2
  exit 1
fi

echo "Restoring dump into disposable database..."
pg_restore --exit-on-error --no-owner --no-acl --dbname="service=humanity_one_restore_test" "$DUMP"
TABLES="$(psql "service=humanity_one_restore_test" -X -v ON_ERROR_STOP=1 -Atc "SELECT count(*) FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')")"
if [[ ! "$TABLES" =~ ^[0-9]+$ ]] || (( TABLES < 1 )); then
  echo "Restore completed but no application tables were found." >&2
  exit 1
fi
echo "RESTORE TEST PASSED: $TABLES user tables are present."
echo "The disposable database was left intact for application smoke tests; remove it manually when finished."
