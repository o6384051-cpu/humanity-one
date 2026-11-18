import test from "node:test";
import assert from "node:assert/strict";
import { restoreWorkspaceData, WorkspaceRestoreError } from "../src/lib/workspace-restore.mjs";

const keys = ["humanity-one-initiatives-v1", "humanity-one-tasks-v1"];

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
  const storage = memoryStorage({ [keys[0]]: "old initiative", [keys[1]]: "old tasks" });
  restoreWorkspaceData(storage, keys, { [keys[0]]: "new initiative", [keys[1]]: null });
  assert.deepEqual(storage.snapshot(), { [keys[0]]: "new initiative", [keys[1]]: null });
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
  assert.deepEqual(storage.snapshot(), { [keys[0]]: "old initiative", [keys[1]]: "old tasks" });
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

test("rejects oversized cloud values before changing local data", () => {
  const storage = memoryStorage({ [keys[0]]: "keep initiative", [keys[1]]: "keep tasks" });
  const before = storage.snapshot();
  assert.throws(
    () => restoreWorkspaceData(storage, keys, { [keys[0]]: "x".repeat(500_001) }),
    WorkspaceRestoreError,
  );
  assert.deepEqual(storage.snapshot(), before);
});
