# HUMANITY ONE — Backup and Recovery Hardening

## Scope per run

The backup helper must state clearly that one run covers one Git repository, one PostgreSQL database, one Vercel project, and at most one S3-compatible bucket. Repeat exports for every additional database, bucket, or Vercel project. Do not describe a run as a complete infrastructure backup until the inventory has been reconciled.

## Required safety controls

- Use `umask 077` and a private staging directory (`chmod 700`).
- Check free space on both the output filesystem and the temporary filesystem before exporting.
- Keep database connection strings and encryption passphrases out of terminal output, logs, Git, and chat.
- Save `pg_dump` output to a private log; print that log only when the command fails.
- Require both `pg_dump` and `pg_restore`; run `pg_restore --list` against the resulting dump.
- Require an authenticated Vercel CLI and verify that the checkout is linked to the intended project. Production environment export is mandatory; optional environment failures must be recorded rather than silently ignored.
- Check for AWS CLI only after the operator chooses S3 export. Record the bucket and endpoint, and retain a remote object inventory for reconciliation.
- Remove plaintext archives, temporary decrypted archives, and incomplete encrypted outputs on every failure path.
- Verify decryption, test the tar archive, extract to a private temporary directory, and run `sha256sum -c checksums.txt` before reporting success.
- Generate a checksum for the final encrypted archive and keep the run log free of secret values.

## Restore acceptance

A successful `pg_restore --list` is only a structural check. Before calling the backup recoverable, restore it into a separate disposable PostgreSQL database, run application-level smoke checks, and compare the restored object-storage inventory. Never test restore against the live production database.

## Operational policy

Keep at least two encrypted copies in separate locations. Store the passphrase separately from the archives. Repeat the backup for every production database, object-storage bucket, and Vercel project. Review repository history and environment-variable names without printing secret values.

## Vercel secret limitation

Vercel's `vercel env pull` does not return values for Secret-type environment variables. The pulled `.env` files are therefore not a complete backup of Vercel credentials. Keep a separate approved secret escrow/inventory, or plan to rotate and re-enter secrets during recovery. Never claim that the Vercel environment export is complete solely because `env pull` succeeded. See the official [Vercel environment-variable CLI documentation](https://vercel.com/docs/cli/env).

## Disposable restore test

After creating and decrypting a backup on the operator's machine, run:

```bash
bash scripts/backup/verify-restore-to-disposable-db.sh /path/to/humanity-one-production.dump
```

Create a separate empty PostgreSQL database whose database name contains `test`, `restore`, `sandbox`, `recovery`, or `staging`. The script requires an explicit confirmation, refuses a non-empty target, restores without dropping existing objects, and leaves the disposable database available for application smoke tests. It does not prove the application is fully recovered until those smoke tests and storage reconciliation also pass.

## S3 export limitation

The optional `aws s3 sync` copies current object contents only. It does not preserve bucket policies, IAM permissions, lifecycle/CORS/encryption configuration, object versions, or delete markers. Record and restore those provider settings separately, and reconcile the remote object inventory after export.
