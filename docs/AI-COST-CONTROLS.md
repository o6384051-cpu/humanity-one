# HUMANITY ONE AI cost policy

This policy keeps the assistant low-cost by default and avoids enabling paid providers automatically.

## Runtime behavior

- The configured primary provider is the only provider used by default.
- A fallback provider is contacted only when all three fallback variables are explicitly configured. Fallback requests are sequential, never parallel.
- Routine answers, learning, and humanitarian support use the economical model.
- Planning, research, and sensitive-action review may use `AI_ADVANCED_MODEL`, but only when that variable is explicitly configured. Otherwise they continue using the primary economical model.
- Requests are limited to 20 per minute and, by default, 100 per IP per day. The daily ceiling can be changed with `AI_DAILY_REQUEST_LIMIT` (accepted range: 1–1000).
- Daily limiting uses the existing persistent rate-limit store. If that store is unavailable, the endpoint fails closed rather than bypassing the limit.

## Optional environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `AI_ECONOMY_MODEL` | Model for routine work | `AI_MODEL` / existing primary model |
| `AI_ADVANCED_MODEL` | Explicitly selected model for complex work | Not enabled |
| `AI_DAILY_REQUEST_LIMIT` | Daily requests per IP | `100` |
| `AI_FALLBACK_API_KEY`, `AI_FALLBACK_BASE_URL`, `AI_FALLBACK_MODEL` | Explicit opt-in fallback provider | Not enabled |

Do not add paid credentials or enable a paid model without reviewing its provider pricing first. This request cap is a usage guardrail, not a guaranteed monetary spending cap: provider pricing and token-level usage must still be monitored separately.
