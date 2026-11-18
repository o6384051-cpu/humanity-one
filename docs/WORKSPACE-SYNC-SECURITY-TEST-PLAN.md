# HUMANITY ONE — Workspace Sync & Restore Security Test Plan

**Status:** Test plan only. No production database, deployment, or migration is authorized by this document.  
**Applies to:** The proposed account workspace sync and restore changes in PR #53.

## Safety boundary

- Use a disposable test database with synthetic accounts and synthetic data only.
- Confirm the preview environment points to that isolated database before running any integration test.
- Never run destructive tests against production or a database whose identity is uncertain.
- Do not put real beneficiary data, credentials, session cookies, or secrets in fixtures, logs, screenshots, or test reports.
- A successful build or source-pattern test is not evidence that account isolation or recovery works.

## Required test fixtures

Create two independent authenticated beneficiary sessions, Account A and Account B, with distinct marker values in every supported workspace key. Keep a third unauthenticated client. Use a disposable database that can be reset between runs.

## API authentication and isolation

1. Unauthenticated GET returns 401 and does not disclose whether another account has a workspace.
2. Unauthenticated PUT returns 401 and writes nothing.
3. Account A GET returns only A's workspace and metadata.
4. Account B GET returns only B's workspace and metadata.
5. Account A PUT changes only A's workspace; verify B's record is byte-for-byte unchanged.
6. Account B PUT changes only B's workspace; verify A's record is byte-for-byte unchanged.
7. Attempt to submit another user's identifier or unexpected properties; strict validation must reject the request and no other account may be affected.
8. Verify responses use private, no-store caching and that error messages do not expose SQL, stack traces, session values, or personal data.

## Input validation and resource limits

1. Reject unknown workspace keys and invalid language/theme values.
2. Reject wrong value types, malformed JSON, and invalid nested data.
3. Reject payloads above the documented request and stored-data limits.
4. Test a streamed request that exceeds the limit even when Content-Length is missing or inaccurate.
5. Verify rate limits are applied per authenticated account and that a rate-limit backend outage fails safely rather than silently allowing unlimited writes.
6. Confirm no request body or workspace contents are written to application logs.

## Restore safety on the browser

1. Test a valid cloud workspace containing every allowed key and verify exact restoration.
2. Test missing keys, null values, empty strings, invalid types, unknown keys, and malformed workspace objects.
3. Validate the entire cloud payload before the first localStorage mutation.
4. Simulate localStorage quota failure on the first, middle, and final write. The restore operation must attempt to restore the complete pre-restore snapshot.
5. Simulate removeItem failure and rollback failure. The UI must not report success; it must clearly disclose that automatic rollback could not be fully confirmed and direct the user to their independently saved backup.
6. Verify the user is asked to export and confirm that the local backup file was actually saved before replacement begins. Do not treat calling the browser download click handler as proof that a download completed.
7. Verify cancellation leaves every local key unchanged.
8. Verify successful restore refreshes the displayed storage size and language without losing unrelated application state.

## Migration and preview isolation

1. Record the preview database host and database name without exposing credentials.
2. Confirm the preview database is not production and contains no real beneficiary records.
3. Apply the migration only to a disposable preview database using the project's reviewed migration process.
4. Verify unique user ownership, foreign-key behavior, and deletion behavior with synthetic accounts.
5. Test migration failure and recovery on a disposable copy.
6. Do not apply, roll back, or reset a production migration as part of this test plan.

## Evidence required before PR #53 can be considered ready

- Automated integration test output for two separate authenticated users.
- Automated restore tests covering successful restore, malformed payload, quota failure, and rollback failure.
- Migration test output from an isolated disposable database.
- Confirmation of the preview database target and the test environment's isolation.
- A reviewer-readable summary of test scope, results, failures, and limitations.
- Separate confirmation that production migration and production deployment were not performed.

## Current known limitation

The existing tests/workspace-sync-regressions.test.mjs checks source-code patterns. It is useful as a lightweight regression guard, but it does not itself create two authenticated sessions, execute the API against a database, simulate browser storage failures, or prove rollback. Passing those source-pattern tests must not be described as passing the integration tests above.
