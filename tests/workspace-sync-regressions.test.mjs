import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const route = readFileSync("src/app/api/beneficiary/workspace/route.ts", "utf8");
const settings = readFileSync("src/app/settings/page.tsx", "utf8");
const portal = readFileSync("src/app/beneficiary/page.tsx", "utf8");
const schema = readFileSync("prisma/schema.prisma", "utf8");

test("workspace sync requires an authenticated beneficiary session", () => {
  assert.match(route, /getBeneficiarySession\(\)/);
  assert.match(route, /if \(!user\).*status: 401/s);
  assert.match(route, /where: \{ userId: user\.id \}/);
});

test("workspace sync validates bounded, allow-listed local data", () => {
  assert.match(route, /\.strict\(\)/);
  assert.match(route, /500_000/);
  assert.match(route, /1_000_000/);
  assert.match(route, /theme: z\.enum/);
});

test("workspace data is private and attached to one account", () => {
  assert.match(schema, /model UserWorkspace/);
  assert.match(schema, /userId\s+String\s+@unique/);
  assert.match(schema, /onDelete: Cascade/);
  assert.match(route, /Cache-Control.*no-store, private/);
});

test("restoring cloud data creates a local backup and requires confirmation", () => {
  assert.match(settings, /before-cloud-restore\.json/);
  assert.match(settings, /window\.confirm/);
  assert.match(settings, /استعادة النسخة السحابية/);
});

test("beneficiary notifications refresh periodically only for signed-in users", () => {
  assert.match(portal, /if\(!user\)return/);
  assert.match(portal, /setInterval\(\(\)=>\{void refreshNotifications\(\)\},30000\)/);
});
