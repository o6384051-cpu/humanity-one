# HUMANITY ONE — Intelligent Core Phase 1

## Scope
This phase adds an initial, testable foundation for six connected capabilities without replacing the existing application or changing the production branch.

## Delivered in this phase
- A three-stage agent workflow: coordinator, domain specialist, and safety reviewer.
- Domain routing for general help, education, health awareness, agriculture, humanitarian support, careers, science, and research.
- Request validation, input-size limits, rate limiting, request timeouts, no-store responses, and provider-neutral AI configuration.
- A local, user-managed memory prototype with explicit opt-in, edit-by-delete, export, and clear-all controls.
- Explicit limitation disclosures: no live web search, no external action execution, no cloud synchronization, and no separate independent models.

## Architecture decisions
- Keep provider credentials server-side in AI_API_KEY; OPENAI_API_KEY is a backward-compatible fallback.
- AI_BASE_URL and AI_MODEL remain configurable for OpenAI-compatible providers.
- Never claim that a web search, file operation, deployment, booking, diagnosis, or other external action occurred unless a corresponding integration actually performed it.
- Health functionality is general education only, not diagnosis or treatment.
- User memory in this phase is browser-local only. It is not sent automatically by the agent workflow and is not stored in the server database.
- Agent workflow is sequential orchestration using the configured model, not a set of independent autonomous agents.

## Required environment
- AI_API_KEY (or legacy OPENAI_API_KEY)
- Optional AI_BASE_URL (defaults to https://api.openai.com/v1)
- Optional AI_MODEL (defaults to gpt-4o-mini)

## Validation still required before merge/deployment
1. Install dependencies and run Prisma generation.
2. Run TypeScript and Next.js production build.
3. Verify the provider-compatible API response shape.
4. Test rate limits, oversized payloads, provider timeout and error paths.
5. Test the memory page in private browsing, browser restart, export and deletion.
6. Verify no secrets or personal data are committed.
7. Connect a real authenticated end-user identity before adding server-side memory sync.
8. Add a real search connector and source-verification layer before describing research as live or cited.
9. Add scoped tool adapters and human approval before enabling external execution.

## Deferred
- Cloud-synced cross-device memory.
- Vector database / embeddings and document RAG.
- Live web search and source citations.
- Autonomous external tool execution.
- Voice, offline inference, mobile packaging, and specialized clinical decisions.
