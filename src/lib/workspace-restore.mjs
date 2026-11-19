const VALUE_LIMITS = {
  "humanity-one-initiatives-v1": 500_000,
  "humanity-one-tasks-v1": 500_000,
  "humanity-one-approved-memory-v1": 200_000,
  "humanity-one-approved-memory-v1:enabled": 20,
  "humanity-one-chat-v2": 500_000,
};

export class WorkspaceRestoreError extends Error {
  constructor(message, rollbackComplete = true) {
    super(message);
    this.name = "WorkspaceRestoreError";
    this.rollbackComplete = rollbackComplete;
  }
}

/**
 * Validate the complete cloud payload before touching browser storage.
 * Missing allow-listed keys mean that the corresponding local key is cleared.
 */
export function validateWorkspaceData(keys, incoming) {
  if (!incoming || typeof incoming !== "object" || Array.isArray(incoming)) {
    throw new WorkspaceRestoreError("Cloud workspace data must be an object.");
  }

  const allowed = new Set(keys);
  for (const key of Object.keys(incoming)) {
    if (!allowed.has(key)) {
      throw new WorkspaceRestoreError("Cloud workspace contains an unsupported key.");
    }
  }

  const normalized = {};
  for (const key of keys) {
    const value = Object.prototype.hasOwnProperty.call(incoming, key) ? incoming[key] : null;
    if (value !== null && typeof value !== "string") {
      throw new WorkspaceRestoreError("Cloud workspace contains an invalid value.");
    }
    if (typeof value === "string") {
      const limit = VALUE_LIMITS[key];
      if (typeof limit !== "number" || value.length > limit) {
        throw new WorkspaceRestoreError("Cloud workspace value exceeds its allowed size.");
      }
    }
    normalized[key] = value;
  }

  const serialized = JSON.stringify(normalized);
  if (new TextEncoder().encode(serialized).byteLength > 1_000_000) {
    throw new WorkspaceRestoreError("Cloud workspace exceeds the total size limit.");
  }
  return normalized;
}

/**
 * Apply the validated workspace as a best-effort transaction.
 * localStorage has no native transaction API, so on a write failure we clear
 * the partially-applied keys and restore the exact pre-restore snapshot.
 */
export function restoreWorkspaceData(storage, keys, incoming) {
  const next = validateWorkspaceData(keys, incoming);
  let previous;
  try {
    previous = Object.fromEntries(keys.map((key) => [key, storage.getItem(key)]));
  } catch {
    // No writes have happened, so the original local workspace remains intact.
    throw new WorkspaceRestoreError("Could not read the current local workspace snapshot.");
  }

  try {
    for (const key of keys) {
      const value = next[key];
      if (value === null) storage.removeItem(key);
      else storage.setItem(key, value);
    }
  } catch (cause) {
    let rollbackComplete = true;

    // Free any space consumed by partially-written cloud values first.
    for (const key of keys) {
      try {
        storage.removeItem(key);
      } catch {
        rollbackComplete = false;
      }
    }

    // Restore every previous value independently, even if one operation fails.
    for (const key of keys) {
      const value = previous[key];
      if (value === null) continue;
      try {
        storage.setItem(key, value);
      } catch {
        rollbackComplete = false;
      }
    }

    const error = new WorkspaceRestoreError(
      cause instanceof Error ? cause.message : "Local storage write failed.",
      rollbackComplete,
    );
    throw error;
  }
}
