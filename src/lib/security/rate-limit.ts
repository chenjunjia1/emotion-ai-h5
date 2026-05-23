/**
 * 进程内滑动窗口限流（单实例有效）。
 * 多实例/100+ 并发生产环境请配合 Nginx limit_req 或 Redis 全局限流。
 */

type Window = { count: number; resetAt: number };

const store = new Map<string, Window>();

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, w] of store) {
    if (w.resetAt <= now) store.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  cleanup(now);

  let entry = store.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfterSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - entry.count),
    retryAfterSec: 0,
  };
}

/** AI 生成全局并发（防止打爆 DeepSeek / 内存） */
let aiInFlight = 0;
const AI_MAX_CONCURRENT = Number(process.env.AI_MAX_CONCURRENT || "20");

export function acquireAiSlot(): boolean {
  if (aiInFlight >= AI_MAX_CONCURRENT) return false;
  aiInFlight += 1;
  return true;
}

export function releaseAiSlot() {
  aiInFlight = Math.max(0, aiInFlight - 1);
}
