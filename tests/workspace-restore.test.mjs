import test from "node:test";
import assert from "node:assert/strict";
import { restoreWorkspaceData, WorkspaceRestoreError } from "../src/lib/workspace-restore.mjs";

const keys = [
  "humanity-one-initiatives-v1",
  "humanity-one-tasks-v1",
  "humanity-one-approved-memory-v1",
  "humanity-one-approved-memory-v1:enabled",
  "humanity-one-chat-v2",
];

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    snapshot() { return Object.fromEntries(keys.map((key) => [key, values.has(key) ? values.get(key) : null])); },
  };
}

test("validates the entire cloud payload before writing and restores all allowed keys", () => {
  const storage = memoryStorage(Object.fromEntries(keys.map((key) => [key, `old:${key}`])));
  const incoming = Object.fromEntries(keys.map((key) => [key, "restored"]));
  restoreWorkspaceData(storage, keys, incoming);
  assert.deepEqual(storage.snapshot(), incoming);
});

test("rejects unknown keys and invalid values without changing local data", () => {
  const storage = memoryStorage({ [keys[0]]: "keep me", [keys[1]]: "keep tasks" });
  const before = storage.snapshot();
  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: "replace", injected: "not allowed" }),
    WorkspaceRestoreError,
  );
  assert.deepEqual(storage.snapshot(), before);
  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: 42 }),
    WorkspaceRestoreError,
  );
  assert.deepEqual(storage.snapshot(), before);
});

test("rolls back the complete previous snapshot after a mid-restore quota failure", () => {
  const storage = memoryStorage({ [keys[0]]: "old initiative", [keys[1]]: "old tasks" });
  const originalSetItem = storage.setItem.bind(storage);
  let failedOnce = false;
  storage.setItem = (key, value) => {
    if (key === keys[1] && !failedOnce) {
      failedOnce = true;
      throw new Error("simulated quota failure");
    }
    originalSetItem(key, value);
  };

  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: "new initiative", [keys[1]]: "new tasks" }),
    (error) => error instanceof WorkspaceRestoreError && error.rollbackComplete === true,
  );
  assert.deepEqual(storage.snapshot(), { [keys[0]]: "old initiative", [keys[1]]: "old tasks", [keys[2]]: null, [keys[3]]: null, [keys[4]]: null });
});

test("reports when rollback itself cannot be fully confirmed", () => {
  const storage = memoryStorage({ [keys[0]]: "old initiative", [keys[1]]: "old tasks" });
  const originalSetItem = storage.setItem.bind(storage);
  let applyFailed = false;
  storage.setItem = (key, value) => {
    if (key === keys[1] && value === "new tasks" && !applyFailed) {
      applyFailed = true;
      throw new Error("simulated apply failure");
    }
    if (key === keys[0] && value === "old initiative") {
      throw new Error("simulated rollback failure");
    }
    originalSetItem(key, value);
  };

  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: "new initiative", [keys[1]]: "new tasks" }),
    (error) => error instanceof WorkspaceRestoreError && error.rollbackComplete === false,
  );
});

test("aborts safely if the original local snapshot cannot be read", () => {
  let writes = 0;
  const storage = {
    getItem() { throw new Error("storage unavailable"); },
    setItem() { writes += 1; },
    removeItem() { writes += 1; },
  };
  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: "cloud value" }),
    (error) => error instanceof WorkspaceRestoreError && error.rollbackComplete === true,
  );
  assert.equal(writes, 0);
});

test("rejects each field above its documented size limit before changing local data", () => {
  const limits = [500_000, 500_000, 200_000, 20, 500_000];
  const storage = memoryStorage({ [keys[0]]: "keep initiative", [keys[1]]: "keep tasks" });
  const before = storage.snapshot();

  for (let index = 0; index < keys.length; index += 1) {
    const incoming = { [keys[index]]: "x".repeat(limits[index] + 1) };
    assert.throws(() => restoreWorkspaceData(storage, keys, incoming), WorkspaceRestoreError, keys[index]);
    assert.deepEqual(storage.snapshot(), before);
  }
});

test("rejects a payload above the one-megabyte total limit even when individual fields are valid", () => {
  const storage = memoryStorage({ [keys[0]]: "keep initiative", [keys[1]]: "keep tasks" });
  const before = storage.snapshot();
  const incoming = {
    [keys[0]]: "a".repeat(500_000),
    [keys[1]]: "b".repeat(500_000),
    [keys[2]]: "c".repeat(50_000),
  };
  assert.throws(() => restoreWorkspaceData(storage, keys, incoming), WorkspaceRestoreError);
  assert.deepEqual(storage.snapshot(), before);
});
