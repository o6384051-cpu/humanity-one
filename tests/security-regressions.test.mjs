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


test("beneficiary sessions are revalidated against the database and restricted to USER", async () => {
  const auth = await source("src/lib/beneficiary-auth.ts");
  assert.match(auth, /jwt\.verify\(token,secret\)/);
  assert.match(auth, /prisma\.user\.findUnique/);
  assert.match(auth, /user\.role!==\"USER\"/);
  assert.match(auth, /expiresIn:\"14d\"/);
});

test("rate limiting fails closed and stores keyed digests rather than raw identifiers", async () => {
  const limiter = await source("src/lib/rate-limit.ts");
  assert.match(limiter, /createHmac\(\"sha256\", secret\)/);
  assert.match(limiter, /return \{ allowed: false, retryAfter: 60, unavailable: true \}/);
  assert.match(limiter, /Fail closed/);
  assert.match(limiter, /ON CONFLICT \(\"key\"\) DO UPDATE/);
});

test("admin beneficiary endpoints require a freshly validated admin session", async () => {
  const routes = [
    "src/app/api/admin/assistance/route.ts",
    "src/app/api/admin/beneficiaries/route.ts",
    "src/app/api/admin/overview/route.ts",
    "src/app/api/admin/assistance/files/[id]/route.ts",
  ];
  for (const path of routes) {
    const code = await source(path);
    assert.match(code, /getAdminSession\(\)/, path);
    assert.match(code, /!admin|!actor/, path);
    assert.match(code, /403/, path);
  }
});

test("admin assistance and beneficiary listings do not cache sensitive responses", async () => {
  const assistance = await source("src/app/api/admin/assistance/route.ts");
  const beneficiaries = await source("src/app/api/admin/beneficiaries/route.ts");
  const overview = await source("src/app/api/admin/overview/route.ts");
  assert.match(assistance, /Cache-Control.*no-store, private/);
  assert.match(beneficiaries, /Cache-Control.*no-store, private/);
  assert.match(overview, /Cache-Control.*no-store, private/);
  assert.doesNotMatch(beneficiaries, /passwordHash/);
  assert.doesNotMatch(assistance, /passwordHash/);
});

test("founder bootstrap is rate-limited, compares its secret in constant time, and refuses repeat setup", async () => {
  const bootstrap = await source("src/app/api/admin/bootstrap/route.ts");
  assert.match(bootstrap, /rateLimit\(req, \"founder-bootstrap\", 5/);
  assert.match(bootstrap, /timingSafeEqual\(/);
  assert.match(bootstrap, /findFirst\(\{ where: \{ role: \"SUPER_ADMIN\" \}/);
  assert.match(bootstrap, /status: 409/);
  assert.match(bootstrap, /password\.length < 12/);
});

test("admin file downloads require an admin session and prevent browser caching and MIME sniffing", async () => {
  const route = await source("src/app/api/admin/assistance/files/[id]/route.ts");
  assert.match(route, /getAdminSession\(\)/);
  assert.match(route, /Cache-Control.*private, no-store/);
  assert.match(route, /X-Content-Type-Options.*nosniff/);
});


test("public mail intake validates bounded fields and applies an hourly rate limit", async () => {
  const route = await source("src/app/api/mail/route.ts");
  assert.ok(route.includes('rateLimit(req, "mail-contact", 5, 60 * 60 * 1000)'));
  assert.ok(route.includes("senderName: z.string().trim().min(2).max(100)"));
  assert.ok(route.includes("body: z.string().trim().min(10).max(5000)"));
  assert.ok(route.includes("senderUserId: user?.id ?? null"));
  assert.ok(route.includes('"Cache-Control": "no-store"'));
});

test("every internal mail administration operation requires an admin session", async () => {
  const route = await source("src/app/api/admin/mail/route.ts");
  const checks = route.split("const admin = await getAdminSession();").length - 1;
  assert.equal(checks, 3);
  const permissionChecks = route.match(/hasAdminPermission\(admin,\s*["']MANAGE_MAIL["']\)/g) || [];
  assert.equal(permissionChecks.length, 3, "GET, POST, and PATCH must each require MANAGE_MAIL");
  assert.match(route, /if \(!admin \|\| !hasAdminPermission\(admin, ["']MANAGE_MAIL["']\)\)/);
  assert.ok(route.includes("if (!parent || parent.parentId)"));
  assert.ok(route.includes("parentId: null"));
  assert.ok(route.includes('"Cache-Control": "no-store, private"'));
});

test("task and initiative drafts are preserved when local storage is unreadable", async () => {
  const tasks = await source("src/app/tasks/page.tsx");
  const initiatives = await source("src/app/projects/page.tsx");

  for (const [name, code, filename] of [
    ["tasks", tasks, "humanity-one-tasks-recovery.json"],
    ["initiatives", initiatives, "humanity-one-initiatives-recovery.json"],
  ]) {
    assert.ok(code.includes("const saved = localStorage.getItem(STORAGE_KEY)"), name);
    assert.ok(code.includes("setRecoveryData(saved)"), name);
    assert.ok(code.includes("if (!ready || storageIssue) return"), name);
    assert.ok(code.includes(filename), name);
    assert.ok(code.includes("window.setTimeout(() => URL.revokeObjectURL(url), 1000)"), name);
  }
});

test("Gemini endpoint never falls back to an OpenAI key", async () => {
  const route = await source("src/app/api/ai/chat/route.ts");
  assert.match(route, /const key = isGeminiOpenAIEndpoint\s*\?\s*process\.env\.AI_API_KEY/);
  assert.match(route, /process\.env\.AI_API_KEY\s*\|\|\s*process\.env\.OPENAI_API_KEY/);
  assert.match(route, /خدمة Gemini غير مهيأة/);
});

test("radar source URLs accept only HTTP and HTTPS and reject escaped newline syntax regressions", async () => {
  const route = await source("src/app/api/radar/records/route.ts");
  assert.match(route, /protocol === ["']https:|protocol === ["']http:/);
  assert.match(route, /sourceUrl: z\.string\(\)\.url\(\)/);
  assert.doesNotMatch(route, new RegExp(String.raw`\\n\s+try \\{`));
});

test("assistance can be approved directly by every authorized administration role", async () => {
  const route = await source("src/app/api/admin/assistance/route.ts");
  const permissionChecks = route.match(/hasAdminPermission\(admin, ["']MANAGE_ASSISTANCE["']\)/g) || [];
  assert.equal(permissionChecks.length, 2, "GET and PATCH must require MANAGE_ASSISTANCE");
  assert.match(route, /z\.enum\(\["IN_REVIEW",\s*"APPROVED",\s*"REJECTED",\s*"CLOSED"\]\)/);
  assert.doesNotMatch(route, /status !== ["']IN_REVIEW["']/);
});


test("desktop navigation shows every destination while mobile keeps the expandable services control", async () => {
  const page = await source("src/app/page.tsx");
  const styles = await source("src/app/globals.css");
  const destinations = [
    "/", "/ai-core", "/radar", "/beneficiary", "/opportunities", "/agents",
    "/memory", "/admin", "/mail", "/verified-sources", "/organizations",
    "/fees", "/jobs", "/personal-plan", "/resume", "/small-business",
    "/projects", "/tasks", "/knowledge", "/analytics",
  ];
  for (const href of destinations) {
    assert.ok(page.includes('href="' + href + '"'), "missing navigation destination: " + href);
  }
  assert.match(page, /className="ho-nav-group-toggle"/);
  assert.match(page, /aria-expanded={servicesOpen}/);
  assert.match(page, /<div className={`ho-nav-sub\$\{servicesOpen \? " is-open" : ""\}`}/);
  assert.match(page, /setServicesOpen\(\(open\) => !open\)/);
  assert.match(page, /closest\("a"\)/);
  assert.match(styles, /@media \(min-width: 761px\)[\s\S]*?\.ho-nav-sub \{ display: grid !important; \}/);\n  assert.match(styles, /@media \(max-width: 760px\)[\s\S]*?\.ho-nav-sub\.is-open \{ display: grid; \}/);\n  assert.match(styles, /\.ho-sidebar\{overflow-y:auto/);
  assert.match(styles, /@media\(max-height:760px\)/);
});
