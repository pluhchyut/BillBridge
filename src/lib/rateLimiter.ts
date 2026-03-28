/**
 * rateLimiter.ts
 *
 * Simple in-memory sliding-window rate limiter.
 * Good enough for a public MVP on a single Vercel serverless instance.
 *
 * Production upgrade path: replace the Map with an Upstash Redis client
 * (e.g., @upstash/ratelimit) for multi-instance correctness.
 */

interface WindowRecord {
  count: number;
  windowStart: number;
}

const WINDOW_MS = 60_000;  // 1-minute window
const MAX_REQUESTS = 5;    // 5 requests per IP per minute — generous for students, safe for costs

// Module-level store (persists across requests on warm lambdas)
const store = new Map<string, WindowRecord>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
}

export function checkRateLimit(identifier: string): RateLimitResult {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now - record.windowStart >= WINDOW_MS) {
    // New window
    store.set(identifier, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetInSeconds: 60 };
  }

  if (record.count >= MAX_REQUESTS) {
    const resetInSeconds = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetInSeconds: Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000),
  };
}

/** Periodically prune stale entries to prevent unbounded memory growth. */
export function pruneRateLimitStore(): void {
  const now = Date.now();
  for (const [key, record] of store.entries()) {
    if (now - record.windowStart >= WINDOW_MS * 2) {
      store.delete(key);
    }
  }
}
