# HUMANITY ONE CONNECT — Telegram bot foundation

This is the first, deliberately limited webhook version of the HUMANITY ONE CONNECT bot.

## What this version does

- Accepts Telegram webhook updates only when the `X-Telegram-Bot-Api-Secret-Token` matches the server-side secret.
- Handles `/start`, `/help`, `/about`, and `/join` in private chats.
- Sends fixed informational replies through the Telegram Bot API.
- Does not store Telegram chat IDs, messages, organization applications, beneficiary data, or documents.
- Does not approve organizations, create partnerships, promise aid, or create referrals.

## Required server environment variables

Set these only in the hosting provider's encrypted environment-variable settings:

- `TELEGRAM_BOT_TOKEN`: token issued by Telegram's official BotFather.
- `TELEGRAM_WEBHOOK_SECRET`: a random secret of 32+ characters using only letters, digits, underscores, and hyphens. This is separate from the bot token.
- `HUMANITY_ONE_PUBLIC_URL`: the canonical public platform URL, without a trailing slash.

Never commit real values, put them in client-side variables, or send them in chat.

## Configure the webhook after deployment

1. Create the bot with Telegram's official `@BotFather` and store its token as `TELEGRAM_BOT_TOKEN`.
2. Deploy this route only after code review and a successful build.
3. Store the webhook secret and public URL in server-side environment variables.
4. Register the webhook using Telegram's official Bot API `setWebhook` method. Set the URL to:
   `https://YOUR_PUBLIC_HOST/api/telegram/webhook`
5. Send the same secret as Telegram's `secret_token` value and restrict `allowed_updates` to `["message"]`.
6. Test `/start`, `/help`, `/about`, and `/join` from a private Telegram chat. Confirm that requests without the correct secret receive HTTP 401.

Do not paste the bot token or webhook secret into GitHub, source files, issues, or chat.

## Required next phase before collecting applications or coordinating referrals

The bot must not collect organization records or beneficiary details until the platform has a reviewed persistent data model and access policy. The next phase requires:

- Organization application records with a pending-by-default status.
- Authorized reviewer roles, evidence review, written consent, and an auditable approval/rejection history.
- Separate organization accounts and narrowly scoped permissions.
- Rate limiting and duplicate-update/idempotency handling backed by shared storage.
- Consent records and minimum-data referral workflows; no beneficiary information in Telegram messages.
- A retention/deletion policy and security review before API integrations are enabled.

That phase requires a reviewed database migration and human approval. This PR intentionally does not modify the Prisma schema, apply migrations, change production settings, register a live webhook, or create a deployment.
