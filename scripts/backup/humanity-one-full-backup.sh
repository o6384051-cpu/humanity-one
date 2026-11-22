#!/usr/bin/env bash
# HUMANITY ONE encrypted backup helper. One database, one Vercel project and optional one S3 bucket per run.
set -Eeuo pipefail
umask 077
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_URL="$(printenv HUMANITY_ONE_REPO_URL || printf %s https://github.com/o6384051-cpu/humanity-one.git)"
OUT_DIR="$(printenv BACKUP_OUTPUT_DIR || printf %s "$PWD")"
WORK_ROOT="$(printenv TMPDIR || printf %s /tmp)"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
STAGE="" ARCHIVE="" ENCRYPTED="" VERIFY="" VERIFY_DIR="" CHECKSUM=""
PASS1="" DB_URL="" SUCCESS=0

mkdir -p "$OUT_DIR" "$WORK_ROOT"
OUT_DIR="$(cd "$OUT_DIR" && pwd)"
LOG="$OUT_DIR/backup-run-$STAMP.log"
exec > >(tee -a "$LOG") 2>&1

cleanup() {
  local status=$?
  trap - EXIT
  if [[ -n "$STAGE" && -d "$STAGE" ]]; then rm -rf -- "$STAGE"; fi
  if [[ -n "$VERIFY" && -f "$VERIFY" ]]; then rm -f -- "$VERIFY"; fi
  if [[ -n "$VERIFY_DIR" && -d "$VERIFY_DIR" ]]; then rm -rf -- "$VERIFY_DIR"; fi
  if [[ "$SUCCESS" != "1" ]]; then
    if [[ -n "$ARCHIVE" && -f "$ARCHIVE" ]]; then rm -f -- "$ARCHIVE"; fi
    if [[ -n "$ENCRYPTED" && -f "$ENCRYPTED" ]]; then rm -f -- "$ENCRYPTED"; fi
    if [[ -n "$CHECKSUM" && -f "$CHECKSUM" ]]; then rm -f -- "$CHECKSUM"; fi
  fi
  unset PASS1 DB_URL
  return "$status"
}
trap cleanup EXIT
trap 'echo "ERROR: backup stopped at line $LINENO; success is not claimed." >&2' ERR

need() {
  command -v "$1" >/dev/null 2>&1 || { echo "ERROR: missing tool: $1" >&2; exit 1; }
}
ask_secret() {
  local prompt="$1" var="$2" value=""
  IFS= read -r -s -p "$prompt" value
  printf '\n' >&2
  printf -v "$var" '%s' "$value"
  unset value
}
check_space() {
  local target="$1" available
  available="$(df -Pk "$target" | awk 'END {print $4}')"
  if [[ ! "$available" =~ ^[0-9]+$ ]] || (( available < 2000000 )); then
    echo "ERROR: less than 2GB free or unable to check disk space at $target." >&2
    exit 1
  fi
}

for tool in git tar gzip pg_dump pg_restore vercel sha256sum df awk find sort xargs tee wc tr python3; do need "$tool"; done
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  git config --global credential.helper '!f() { printf "%s\n" "username=x-access-token"; printf "%s\n" "password=$GITHUB_TOKEN"; }; f'
fi
python3 -c "import cryptography" >/dev/null 2>&1 || { echo "ERROR: Python package cryptography is required." >&2; exit 1; }
check_space "$OUT_DIR"
check_space "$WORK_ROOT"
STAGE="$(mktemp -d "$WORK_ROOT/humanity-one-backup.XXXXXX")"
chmod 700 "$STAGE"
mkdir -p "$STAGE/source" "$STAGE/database" "$STAGE/vercel" "$STAGE/storage" "$STAGE/metadata" "$STAGE/logs"

echo "[1/7] Git source and history"
git clone --mirror "$REPO_URL" "$STAGE/source/humanity-one.git"
git clone "$REPO_URL" "$STAGE/source/humanity-one"
(
  cd "$STAGE/source/humanity-one"
  git submodule update --init --recursive
  git remote -v > "$STAGE/metadata/git-remotes.txt"
  git branch -a > "$STAGE/metadata/git-branches.txt"
  git tag -l > "$STAGE/metadata/git-tags.txt"
  git log --all --oneline --decorate -n 1000 > "$STAGE/metadata/git-history.txt"
)
if git -C "$STAGE/source/humanity-one" lfs version >/dev/null 2>&1; then git -C "$STAGE/source/humanity-one" lfs fetch --all && git -C "$STAGE/source/humanity-one" lfs pull; else echo "Git LFS is unavailable; verify whether the repository uses LFS." > "$STAGE/metadata/git-lfs-warning.txt"; fi

echo "[2/7] PostgreSQL export"
DB_URL="${DATABASE_URL:-}"
if [[ -z "$DB_URL" ]]; then ask_secret "Production DATABASE_URL (hidden): " DB_URL; fi
if [[ -z "$DB_URL" ]]; then echo "ERROR: DATABASE_URL is required." >&2; unset DB_URL; exit 1; fi

# Parse the URL locally and put the password in a private .pgpass file.
# pg_dump receives only a service name, so the full credential URL is not in its argv.
HUMANITY_ONE_DB_URL="$DB_URL" python3 - "$STAGE/database/pg_service.conf" "$STAGE/database/pgpass" <<'PY'
import os, sys
from urllib.parse import parse_qs, unquote, urlsplit

raw = os.environ.pop("HUMANITY_ONE_DB_URL")
url = urlsplit(raw)
if url.scheme not in ("postgres", "postgresql"):
    raise SystemExit("DATABASE_URL must use postgres:// or postgresql://")
host = url.hostname or ""
if not host or "," in host:
    raise SystemExit("A single database hostname is required for this backup helper.")
port = str(url.port or 5432)
dbname = unquote(url.path.lstrip("/"))
user = unquote(url.username or "")
password = unquote(url.password or "")
if not dbname or not user or not password:
    raise SystemExit("DATABASE_URL must include database name, username, and password.")
if any("\n" in value or "\r" in value for value in (host, dbname, user, password)):
    raise SystemExit("DATABASE_URL contains unsupported newline characters.")

query = parse_qs(url.query)
service_values = {
    "host": host,
    "port": port,
    "dbname": dbname,
    "user": user,
}
for key in ("sslmode", "sslrootcert", "sslcert", "sslkey", "application_name", "channel_binding", "target_session_attrs"):
    if query.get(key):
        service_values[key] = query[key][0]

def pgpass_escape(value):
    return value.replace("\\", "\\\\").replace(":", "\\:")

with open(sys.argv[1], "w", encoding="utf-8") as service:
    service.write("[humanity_one_backup]\n")
    for key, value in service_values.items():
        service.write(f"{key}={value}\n")
os.chmod(sys.argv[1], 0o600)

with open(sys.argv[2], "w", encoding="utf-8") as pgpass:
    pgpass.write(":".join(pgpass_escape(value) for value in ("*", port, dbname, user, password)) + "\n")
os.chmod(sys.argv[2], 0o600)
PY
unset DB_URL
if ! PGSERVICEFILE="$STAGE/database/pg_service.conf" PGPASSFILE="$STAGE/database/pgpass" PGCONNECT_TIMEOUT=20 pg_dump --dbname="service=humanity_one_backup" --format=custom --no-owner --no-acl --verbose --file="$STAGE/database/humanity-one-production.dump" > "$STAGE/logs/pg_dump.log" 2>&1; then
  echo "ERROR: pg_dump failed; details follow:" >&2
  cat "$STAGE/logs/pg_dump.log" >&2
  exit 1
fi
rm -f "$STAGE/database/pg_service.conf" "$STAGE/database/pgpass"
pg_restore --list "$STAGE/database/humanity-one-production.dump" > "$STAGE/metadata/database-contents.txt"

echo "[3/7] Vercel export"
cat > "$STAGE/vercel/ENV-EXPORT-LIMITATIONS.txt" <<'LIMITS'
IMPORTANT: Vercel does not return the values of Secret-type environment variables.
The .env files produced by "vercel env pull" are therefore NOT a complete backup
of all Vercel secrets. The env list files record names/types where available.
Maintain a separate secure secret inventory and rotate/re-enter unrecoverable
secrets during disaster recovery. Never put secret values in this archive manually
unless you have an approved encrypted secret escrow process.
LIMITS
echo "WARNING: Vercel Secret-type values are not exportable through env pull; see the archive limitation notice."
vercel whoami > "$STAGE/metadata/vercel-account.txt" 2>&1
(
  cd "$STAGE/source/humanity-one"
  # The fresh clone has no local .vercel link; explicitly link the known production project.
  vercel link --yes --project humanity-one-wc35 --scope o6384051-cpuosama > "$STAGE/metadata/vercel-link.txt" 2>&1 || { echo "ERROR: could not link the intended HUMANITY ONE Vercel project." >&2; exit 1; }
  vercel project inspect > "$STAGE/metadata/vercel-project-inspect.txt" 2>&1 || { echo "ERROR: could not inspect the linked Vercel project." >&2; exit 1; }
  grep -Fq 'prj_dtSn09jDtrhDN9CQcSqtIXg1LA8q' "$STAGE/metadata/vercel-project-inspect.txt" || { echo "ERROR: linked Vercel project ID does not match HUMANITY ONE; refusing environment export." >&2; exit 1; }
  vercel env ls production > "$STAGE/metadata/vercel-env-list-production.txt" 2>&1 || echo "Could not list production variables." > "$STAGE/metadata/vercel-env-list-production.warning"
  vercel env ls preview > "$STAGE/metadata/vercel-env-list-preview.txt" 2>&1 || echo "Could not list preview variables." > "$STAGE/metadata/vercel-env-list-preview.warning"
  vercel env ls development > "$STAGE/metadata/vercel-env-list-development.txt" 2>&1 || echo "Could not list development variables." > "$STAGE/metadata/vercel-env-list-development.warning"
  vercel env pull "$STAGE/vercel/production.env" --environment=production --yes
  if ! vercel env pull "$STAGE/vercel/preview.env" --environment=preview --yes; then echo "Preview export skipped." > "$STAGE/metadata/vercel-preview-warning.txt"; rm -f "$STAGE/vercel/preview.env"; fi
  if ! vercel env pull "$STAGE/vercel/development.env" --environment=development --yes; then echo "Development export skipped." > "$STAGE/metadata/vercel-development-warning.txt"; rm -f "$STAGE/vercel/development.env"; fi
)

echo "[4/7] Optional S3 export"
cat > "$STAGE/storage/EXPORT-LIMITATIONS.txt" <<'LIMITS'
The S3 sync exports current object contents only. It does not export bucket policies,
IAM permissions, lifecycle rules, CORS settings, encryption configuration, object
versions, delete markers, or provider-side retention settings. Reconcile these
settings separately and enable provider versioning/retention where appropriate.
LIMITS
echo "WARNING: S3 sync copies current objects only, not bucket configuration or object-version history."
S3_BUCKET=""
if [[ "${BACKUP_SKIP_S3:-0}" != "1" && -t 0 ]]; then
  read -r -p "S3 bucket (blank = skip): " S3_BUCKET
fi
if [[ -n "$S3_BUCKET" ]]; then
  need aws
  read -r -p "S3 endpoint URL: " S3_ENDPOINT
  read -r -p "AWS region: " S3_REGION
  read -r -p "AWS profile (blank = default): " S3_PROFILE
  [[ -n "$S3_ENDPOINT" ]] || { echo "ERROR: S3 endpoint required." >&2; exit 1; }
  AWS_ARGS=(--endpoint-url "$S3_ENDPOINT")
  [[ -n "$S3_REGION" ]] && AWS_ARGS+=(--region "$S3_REGION")
  [[ -n "$S3_PROFILE" ]] && AWS_ARGS+=(--profile "$S3_PROFILE")
  mkdir -p "$STAGE/storage/objects"
  aws "${AWS_ARGS[@]}" s3 sync "s3://$S3_BUCKET" "$STAGE/storage/objects" --only-show-errors
  aws "${AWS_ARGS[@]}" s3 ls "s3://$S3_BUCKET" --recursive > "$STAGE/metadata/storage-remote-inventory.txt"
fi

echo "[5/7] Restore guide and checksums"
printf '%s\n' 'Restore only into a separate test database first.' 'Verify files with: sha256sum -c checksums.txt' 'Restore DB with: pg_restore --clean --if-exists --no-owner --no-acl --dbname="$NEW_DATABASE_URL" database/humanity-one-production.dump' 'Vercel env files contain secrets; never commit or share them.' > "$STAGE/RESTORE-AR.txt"
(cd "$STAGE" && find . -type f ! -name checksums.txt -print0 | sort -z | xargs -0 sha256sum > checksums.txt)

echo "[6/7] Encrypt archive"
ARCHIVE="$OUT_DIR/humanity-one-backup-$STAMP.tar.gz"
ENCRYPTED="$ARCHIVE.enc"
CHECKSUM="$ENCRYPTED.sha256"
tar -czf "$ARCHIVE" -C "$STAGE" .
PASS1="${BACKUP_ENCRYPTION_PIN:-}"
if [[ -z "$PASS1" ]]; then ask_secret "Encryption PIN (at least 12 digits): " PASS1; fi
if [[ ! "$PASS1" =~ ^[0-9]{12,}$ ]]; then echo "ERROR: encryption PIN must contain at least 12 digits." >&2; exit 1; fi
BACKUP_ENCRYPTION_PIN="$PASS1" python3 "$SCRIPT_DIR/backup-crypto.py" encrypt "$ARCHIVE" "$ENCRYPTED"
rm -f -- "$ARCHIVE"
ARCHIVE=""

echo "[7/7] Verify encrypted archive and checksums"
VERIFY="$(mktemp "$WORK_ROOT/humanity-one-verify.XXXXXX")"
chmod 600 "$VERIFY"
if ! BACKUP_ENCRYPTION_PIN="$PASS1" python3 "$PWD/scripts/backup/backup-crypto.py" decrypt "$ENCRYPTED" "$VERIFY"; then
  echo "ERROR: authenticated decryption failed; wrong PIN or damaged archive." >&2
  exit 1
fi
unset PASS1 BACKUP_ENCRYPTION_PIN
tar -tzf "$VERIFY" >/dev/null
VERIFY_DIR="$(mktemp -d "$WORK_ROOT/humanity-one-restore-check.XXXXXX")"
chmod 700 "$VERIFY_DIR"
tar -xzf "$VERIFY" -C "$VERIFY_DIR"
(cd "$VERIFY_DIR" && sha256sum -c checksums.txt)
rm -f -- "$VERIFY"
VERIFY=""
rm -rf -- "$VERIFY_DIR"
VERIFY_DIR=""
(cd "$OUT_DIR" && sha256sum "$(basename "$ENCRYPTED")" > "$(basename "$CHECKSUM")")
SUCCESS=1
echo "BACKUP CREATED AND VERIFIED:"
echo "$ENCRYPTED"
echo "$CHECKSUM"
echo "Run log: $LOG"
echo "Perform a test restore before relying on this backup."
