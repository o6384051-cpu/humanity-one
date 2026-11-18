# Workspace Sync Security Review

Status: pre-release review. This document records code-level observations and remaining verification gates; it is not a certification or penetration-test report.

## Controls observed in the current implementation

- Workspace API access requires a verified beneficiary session.
- The API derives the workspace owner from the authenticated session and scopes database reads and writes by that user's ID. The request body does not select a target account.
- The database schema enforces a unique workspace row per user and cascades deletion with the owning user.
- The API validates a strict allow-list, field types, individual field sizes, and an overall payload limit.
- Read and write endpoints apply per-user rate limits.
- Workspace responses use `Cache-Control: no-store, private`.
- Restore validates the incoming workspace before writing and snapshots local values so a partial local restore can be rolled back.

## Required before production release

1. **Account isolation:** Run authenticated integration tests against an isolated disposable Preview database with two synthetic beneficiary accounts. Prove account A cannot read, update, or overwrite account B's workspace. Include unauthenticated, expired-token, wrong-role, and deleted-user cases.
2. **Cookie and CSRF review:** Verify the session cookie is `HttpOnly`, `Secure` in production, and has an appropriate `SameSite` policy. Test cross-site requests against the cookie-authenticated write endpoint; add an explicit CSRF defense if the threat model requires it.
3. **Data-at-rest protection:** Workspace JSON is stored as JSONB and is not application-level encrypted in this implementation. Confirm the database provider's encryption-at-rest, backup encryption, operator access controls, retention, and deletion behavior. Decide whether chat and approved-memory fields require application-level envelope encryption. Do not claim application-level encryption unless implemented and key-managed.
4. **Preview isolation:** Verify Preview uses a dedicated disposable database and credentials, never the production `DATABASE_URL`.
5. **Recovery:** Confirm a restorable database backup before migration, document restore steps and rollback limitations, and test them without production data.
6. **Operational privacy:** Ensure logs, analytics, error reports, and support tooling do not capture workspace payloads, chat text, memory content, session tokens, or secrets.

## Release decision

Do not merge the cloud-sync change into the production branch, apply its migration to production, or enable production cloud backup/restore until the above gates have been reviewed and the required tests have recorded results. Preview build success and unit tests do not establish browser behavior, account isolation, or database recovery.

## Current verification evidence

- GitHub Actions run #413 for restore commit `f8eb6f31b0b608d14046fc6b05bf221434943b77` passed dependency installation, regression tests (including the workspace restore test file), Prisma client generation, and application build.
- Vercel Preview for that commit reached `READY`.
- Real-browser restore/download tests, two-account authorization tests, and database recovery drills remain outstanding.
