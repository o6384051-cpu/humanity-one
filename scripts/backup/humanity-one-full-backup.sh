#!/usr/bin/env bash
# HUMANITY ONE encrypted backup helper. One database, one Vercel project and optional one S3 bucket per run.
set -Eeuo pipefail
umask 077

REPO_URL="$HUMANITY_ONE_REPO_URL"
if [[ -z "$REPO_URL" ]]; then REPO_URL="https://github.com/o6384051-cpu/humanity-one.git"; fi
OUT_DIR="$BACKUP_OUTPUT_DIR"
if [[ -z "$OUT_DIR" ]]; then OUT_DIR="$PWD"; fi
WORK_ROOT="$TMPDIR"
if [[ -z "$WORK_ROOT" ]]; then WORK_ROOT="/tmp"; fi
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
STAGE="" ARCHIVE="" ENCRYPTED="" VERIFY="" VERIFY_DIR="" CHECKSUM=""
PASS1="" PASS2="" DB_URL="" SUCCESS=0

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
  unset PASS1 PASS2 DB_URL
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

for tool in git tar gzip openssl pg_dump pg_restore vercel sha256sum df awk find sort xargs tee wc tr; do need "$tool"; done
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
if git -C "$STAGE/source/humanity-one" lfs version >/dev/null 2>&1; then git -C "$STAGE/source/humanity-one" lfs fetch --all && git -C "$STAGE/source/humanity-one" lfs pull; fi

echo "[2/7] PostgreSQL export"
ask_secret "Production DATABASE_URL (hidden): " DB_URL
if [[ -z "$DB_URL" ]]; then echo "ERROR: DATABASE_URL is required." >&2; unset DB_URL; exit 1; fi
if ! PGCONNECT_TIMEOUT=20 pg_dump --dbname="$DB_URL" --format=custom --no-owner --no-acl --verbose --file="$STAGE/database/humanity-one-production.dump" > "$STAGE/logs/pg_dump.log" 2>&1; then
  echo "ERROR: pg_dump failed; details follow:" >&2
  cat "$STAGE/logs/pg_dump.log" >&2
  unset DB_URL
  exit 1
fi
unset DB_URL
pg_restore --list "$STAGE/database/humanity-one-production.dump" > "$STAGE/metadata/database-contents.txt"

echo "[3/7] Vercel export"
vercel whoami > "$STAGE/metadata/vercel-account.txt" 2>&1
(
  cd "$STAGE/source/humanity-one"
  vercel project inspect > "$STAGE/metadata/vercel-project-inspect.txt" 2>&1 || { echo "ERROR: run vercel link and select the intended HUMANITY ONE project." >&2; exit 1; }
  vercel env ls production > "$STAGE/metadata/vercel-env-list-production.txt" 2>&1 || true
  vercel env ls preview > "$STAGE/metadata/vercel-env-list-preview.txt" 2>&1 || true
  vercel env ls development > "$STAGE/metadata/vercel-env-list-development.txt" 2>&1 || true
  vercel env pull "$STAGE/vercel/production.env" --environment=production --yes
  if ! vercel env pull "$STAGE/vercel/preview.env" --environment=preview --yes; then echo "Preview export skipped." > "$STAGE/metadata/vercel-preview-warning.txt"; rm -f "$STAGE/vercel/preview.env"; fi
  if ! vercel env pull "$STAGE/vercel/development.env" --environment=development --yes; then echo "Development export skipped." > "$STAGE/metadata/vercel-development-warning.txt"; rm -f "$STAGE/vercel/development.env"; fi
)

echo "[4/7] Optional S3 export"
read -r -p "S3 bucket (blank = skip): " S3_BUCKET
if [[ -n "$S3_BUCKET" ]]; then
  need aws
  read -r -p "S3 endpoint URL: " S3_ENDPOINT
  read -r -p "AWS region: " S3_REGION
  read -r -p "AWS profile (blank = default): " S3_PROFILE
  [[ -n "$S3_ENDPOINT" ]] || { echo "ERROR: S3 endpoint required." >&2; exit 1; }
  AWS_ARGS=(--endpoint-url "$S3_ENDPOINT")
  [[ -n "$S3_REGION" ]] && AWS_ARGS+=(--region "$S3_REGION")
  [[ -n "$S3_PROFILE" ]] && AWS_ARGS+=(--profile "$S3_PROFILE")
  mkdir -p "$STAGE/storage/$S3_BUCKET"
  aws "\${AWS_ARGS[@]}" s3 sync "s3://$S3_BUCKET" "$STAGE/storage/$S3_BUCKET" --only-show-errors
  aws "\${AWS_ARGS[@]}" s3 ls "s3://$S3_BUCKET" --recursive > "$STAGE/metadata/storage-remote-inventory.txt"
fi

echo "[5/7] Restore guide and checksums"
printf '%s\n' 'Restore only into a separate test database first.' 'Verify files with: sha256sum -c checksums.txt' 'Restore DB with: pg_restore --clean --if-exists --no-owner --no-acl --dbname="$NEW_DATABASE_URL" database/humanity-one-production.dump' 'Vercel env files contain secrets; never commit or share them.' > "$STAGE/RESTORE-AR.txt"
(cd "$STAGE" && find . -type f ! -name checksums.txt -print0 | sort -z | xargs -0 sha256sum > checksums.txt)

echo "[6/7] Encrypt archive"
ARCHIVE="$OUT_DIR/humanity-one-backup-$STAMP.tar.gz"
ENCRYPTED="$ARCHIVE.enc"
CHECKSUM="$ENCRYPTED.sha256"
tar -czf "$ARCHIVE" -C "$STAGE" .
ask_secret "Encryption passphrase (20+ characters): " PASS1
ask_secret "Repeat passphrase: " PASS2
PASS1_LEN="$(printf '%s' "$PASS1" | wc -c | tr -d ' ')"
if (( PASS1_LEN < 20 )) || [[ "$PASS1" != "$PASS2" ]]; then echo "ERROR: passphrases mismatch or too short." >&2; exit 1; fi
printf '%s' "$PASS1" | openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 -md sha256 -pass stdin -in "$ARCHIVE" -out "$ENCRYPTED"
rm -f -- "$ARCHIVE"
ARCHIVE=""

echo "[7/7] Verify encrypted archive and checksums"
VERIFY="$(mktemp "$WORK_ROOT/humanity-one-verify.XXXXXX")"
chmod 600 "$VERIFY"
if ! printf '%s' "$PASS1" | openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -md sha256 -pass stdin -in "$ENCRYPTED" -out "$VERIFY" 2> "$STAGE/logs/openssl-verify.log"; then
  echo "ERROR: wrong passphrase or damaged archive." >&2
  cat "$STAGE/logs/openssl-verify.log" >&2
  exit 1
fi
unset PASS1 PASS2
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
