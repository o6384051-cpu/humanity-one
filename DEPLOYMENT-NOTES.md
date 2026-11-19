# HUMANITY ONE deployment notes

## AI chat

The AI chat API reads provider configuration from these Vercel environment variables:

- `AI_API_KEY` — provider API key (secret; never store it in this repository)
- `AI_BASE_URL` — OpenAI-compatible API base URL
- `AI_MODEL` — model identifier

For Gemini OpenAI-compatible API, configure the values in Vercel Production environment variables. A new deployment is required after changing environment variables.

## Email verification (Gmail SMTP)

The account verification flow sends a six-digit code to every account type (founder/admin and beneficiary). Codes are hashed in the database, expire after 10 minutes, and allow at most five attempts.

Configure these **server-only Secret** environment variables in the Vercel project `humanity-one-wc35`:

- `GMAIL_SMTP_USER` = `humanityone.contact@gmail.com`
- `GMAIL_SMTP_APP_PASSWORD` = the 16-character Google App Password for that Gmail account (remove spaces or let the app strip them)

Do not use the Gmail account's normal password. Google App Passwords require 2-Step Verification to be enabled on the Google account. Create one from the Google Account Security page under App passwords. Never put the app password in GitHub, source code, a public variable, or a chat message.

Add both variables to **Preview** first so the pull-request preview can be tested. After a successful test, add them to **Production** when the change is approved for release. Redeploy after adding or changing environment variables.

Gmail SMTP uses `smtp.gmail.com` over TLS on port 465. The sender address is the configured `GMAIL_SMTP_USER`. Gmail has sending limits and is suitable for low-volume verification, not bulk mail.

Resend remains as a fallback only if its existing `RESEND_API_KEY` and `RESEND_FROM_EMAIL` variables are configured. Gmail SMTP is tried first.

Before merging or deploying, test code delivery and successful verification for founder/admin and beneficiary accounts. The migration must also be safely reconciled with the production Prisma migration history before any production migration command.
