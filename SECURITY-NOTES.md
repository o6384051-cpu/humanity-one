# HUMANITY ONE security hardening

Changes applied:
- Added a correctly named `.gitignore` so local environment files are excluded from future commits.
- Added baseline browser security headers in `next.config.js`.
- Added best-effort per-instance request throttling to AI chat (20/minute/IP), admin login (8/15 minutes/IP), and founder bootstrap (5/hour/IP).
- Kept provider credentials and admin secrets in deployment environment variables; never place their values in this repository.
- Removed the TypeScript build-error bypass so production builds fail rather than silently ignore type errors.

Important deployment limitation:
The included in-memory limiter is per serverless instance and can reset or differ across instances. Before broad public traffic, connect a shared rate-limit store (such as Upstash Redis) and configure its credentials only in Vercel environment variables. This is a first hardening pass, not a complete penetration test.

Operational checks still required:
- Review GitHub and Vercel collaborator/team access in their dashboards.
- Confirm the production database connection and backup/restore plan.
- Review repository history for previously committed secrets; rotating any exposed credential is required.


Latest source hardening also corrected URL normalization in the AI proxy and email validation in the founder bootstrap route.
