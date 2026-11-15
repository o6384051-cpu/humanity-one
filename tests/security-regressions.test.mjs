import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const source = async (path) => readFile(resolve(process.cwd(), path), "utf8");

test("beneficiary login keeps both network and account-level throttles", async () => {
  const code = await source("src/app/api/beneficiary/auth/login/route.ts");
  assert.match(code, /beneficiary-login-network["'],\s*30,\s*900000/);
  assert.match(code, /beneficiary-login-account["'],\s*8,\s*900000/);
  assert.match(code, /parsed\.data\.email\.toLowerCase\(\)/);
});

test("password reset stores only a token digest and consumes a live token once", async () => {
  const request = await source("src/app/api/beneficiary/auth/password-reset/request/route.ts");
  const confirm = await source("src/app/api/beneficiary/auth/password-reset/confirm/route.ts");
  assert.match(request, /createHash\(["']sha256["']\)/);
  assert.match(request, /randomBytes\(32\)/);
  assert.match(request, /30 \* 60 \* 1000/);
  assert.doesNotMatch(request, /passwordResetTokenHash:\s*token\s*[,}]/);
  assert.match(confirm, /passwordResetExpiresAt:\s*\{\s*gt:\s*new Date\(\)/);
  assert.match(confirm, /updateMany\(/);
  assert.match(confirm, /passwordResetTokenHash:\s*null/);
  assert.match(confirm, /role:\s*["']USER["']/);
});

test("beneficiary request reads and file access are owner-scoped", async () => {
  const requests = await source("src/app/api/beneficiary/requests/route.ts");
  const upload = await source("src/app/api/beneficiary/files/route.ts");
  const download = await source("src/app/api/beneficiary/files/[id]/route.ts");
  assert.match(requests, /where:\s*\{\s*userId:\s*user\.id\s*\}/);
  assert.match(upload, /where:\s*\{\s*id:\s*requestId,\s*userId:\s*user\.id\s*\}/);
  assert.match(download, /where:\s*\{\s*id:\s*context\.params\.id,\s*userId:\s*user\.id\s*\}/);
  assert.match(download, /Cache-Control["']:\s*["']private, no-store/);
});

test("beneficiary profile and notifications are scoped to the active account", async () => {
  const profile = await source("src/app/api/beneficiary/profile/route.ts");
  const notifications = await source("src/app/api/beneficiary/notifications/route.ts");
  assert.match(profile, /where:\s*\{userId:u\.id\}/);
  assert.match(profile, /upsert\(\{where:\{userId:u\.id\}/);
  assert.match(notifications, /where:\s*\{ userId: user\.id \}/);
  assert.match(notifications, /id: parsed\.data\.id!, userId: user\.id/);
});

test("admin sessions re-check the current database role and privileged user changes require founder", async () => {
  const auth = await source("src/lib/admin-auth.ts");
  const users = await source("src/app/api/admin/users/route.ts");
  assert.match(auth, /user\.role !== payload\.role/);
  assert.match(users, /actor\.role !== ["']SUPER_ADMIN["']/);
  assert.match(users, /target\.role === ["']SUPER_ADMIN["']/);
});
