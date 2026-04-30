// src/lib/refreshLock.ts
/**
 * Single‑flight lock for async operations.
 * Used to ensure that only ONE token‑refresh request is in flight at a time.
 * Subsequent callers will await the same promise.
 */
let _lock: Promise<void> | null = null;

export const withRefreshLock = async (fn: () => Promise<void>) => {
  if (_lock) return _lock; // already running – return the same promise
  _lock = (async () => {
    try {
      await fn();
    } finally {
      _lock = null; // reset after completion (success or error)
    }
  })();
  return _lock;
};
