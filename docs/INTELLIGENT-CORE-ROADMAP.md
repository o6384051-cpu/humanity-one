# HUMANITY ONE — Intelligent Core Phase 1

## Scope
This phase adds an initial, testable foundation for connected AI assistance without replacing the existing application or changing the production branch.

## Delivered in this phase
- A three-stage agent workflow: coordinator, domain specialist, and safety reviewer.
- Domain routing for general help, education, health awareness, agriculture, humanitarian support, careers, science, and research.
- Request validation, payload-size limits, per-instance rate limiting, bounded provider timeouts, no-store responses, and provider-neutral AI configuration.
- A local, user-managed memory prototype with explicit opt-in, export, and deletion controls.
- Explicit limitation disclosures: no live web search, no external action execution, no cloud synchronization, and no separate independent models.
- A bounded 60-second agent endpoint budget with a 16-second timeout for each sequential provider call, suitable for Vercel Hobby's non-Fluid 60-second ceiling.

## Architecture decisions
- Keep provider credentials server-side in AI_API_KEY; OPENAI_API_KEY is a backward-compatible fallback.
- AI_BASE_URL and AI_MODEL remain configurable for OpenAI-compatible providers.
- Treat task text and user-supplied memory as untrusted data; do not allow embedded instructions to override safety rules.
- Never claim that a web search, file operation, deployment, booking, diagnosis, or other external action occurred unless a corresponding integration actually performed it.
- Health functionality is general education only, not diagnosis or treatment.
- User memory in this phase is browser-local only. It is not sent automatically and is not stored in the server database.
- Agent workflow is sequential orchestration using the configured model, not a set of independent autonomous agents.
- Rate limiting is best-effort per serverless instance; it is not a global quota or a substitute for authenticated user limits.

## Required environment
- AI_API_KEY (or legacy OPENAI_API_KEY)
- Optional AI_BASE_URL (defaults to https://api.openai.com/v1)
- Optional AI_MODEL (defaults to gpt-4o-mini)

## Validation still required before merge/deployment
1. Run TypeScript and Next.js production build after each change.
2. Verify the provider-compatible API response shape using a real test key without exposing it.
3. Test rate limits, oversized payloads, malformed JSON, provider timeout and error paths.
4. Test the memory page in private browsing, browser restart, export and deletion.
5. Verify no secrets or personal data are committed.
6. Add authenticated end-user identity, global rate limits and usage quotas before public high-traffic access.
7. Add a real search connector and source-verification layer before describing research as live or cited.
8. Add scoped tool adapters and human approval before enabling external execution.

## Deferred
- Cloud-synced cross-device memory.
- Vector database / embeddings and document RAG.
- Live web search and source citations.
- Autonomous external tool execution.
- Voice, offline inference, mobile packaging, and specialized clinical decisions.
