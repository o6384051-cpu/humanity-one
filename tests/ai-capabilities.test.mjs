import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path) => readFile(resolve(process.cwd(), path), "utf8");

test("all agent-team stages receive the approved HUMANITY ONE identity", async () => {
  const route = await source("src/app/api/agents/run/route.ts");
  assert.match(route, /import \{ HUMANITY_ONE_IDENTITY \} from ["']@\/lib\/ai\/identity["']/);
  assert.match(route, /HUMANITY_ONE_IDENTITY \+ ["']\\n\\n["'] \+ system/);
  assert.match(route, /await complete\([\s\S]*?plannerModel/);
  assert.match(route, /await complete\([\s\S]*?specialistModel/);
  assert.match(route, /await complete\([\s\S]*?reviewerModel/);
});

test("agent-team endpoint is bounded, rate-limited, and transparent about unavailable external actions", async () => {
  const route = await source("src/app/api/agents/run/route.ts");
  assert.match(route, /rateLimit\(req, ["']agent-team["'], 6, 60_000\)/);
  assert.match(route, /maxDuration = 60/);
  assert.match(route, /لم تُنفذ إجراءات خارجية أو بحث مباشر على الإنترنت/);
  assert.match(route, /ولا تُحفظ على الخادم/);
  assert.match(route, /signal: AbortSignal\.timeout\(16_000\)/);
});

test("institutional memory retrieval is read-only and includes source and date", async () => {
  const memory = await source("src/lib/ai/memory.ts");
  assert.match(memory, /knowledgeDocument\.findMany/);
  assert.match(memory, /source: true/);
  assert.match(memory, /createdAt: true/);
  assert.doesNotMatch(memory, /knowledgeDocument\.(create|update|delete)\(/);
});

test("institutional memory corrections preserve the original record", async () => {
  const route = await source("src/app/api/admin/knowledge/route.ts");
  const patch = route.slice(route.indexOf("export async function PATCH"));
  assert.match(patch, /findUnique\([\s\S]*?where: \{ id: parsed\.data\.id \}/);
  assert.match(patch, /knowledgeDocument\.create\(/);
  assert.match(patch, /السجل الأصلي محفوظ دون تعديل/);
  assert.doesNotMatch(patch, /knowledgeDocument\.update\(/);
  assert.doesNotMatch(patch, /knowledgeDocument\.delete\(/);
});

test("deep reasoning and specialist council are wired into the main chat endpoint", async () => {
  const route = await source("src/app/api/ai/chat/route.ts");
  assert.match(route, /DEEP_REASONING_POLICY/);
  assert.match(route, /buildCouncilPanelPrompt/);
  assert.match(route, /buildCouncilReviewPrompt/);
  assert.match(route, /prepareAgentRun/);
  assert.match(route, /externalExecutionAvailable: false/);
});
