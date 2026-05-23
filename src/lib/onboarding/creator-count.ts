/** 登录页底部「已有 N 位创作者」：基准 3 万，每 5 分钟 +1 */

export const CREATOR_COUNT_BASE = 30_000;
export const CREATOR_COUNT_INTERVAL_MS = 5 * 60 * 1000;
const STORAGE_KEY = "sv-creator-count-anchor";

type Anchor = { base: number; startedAt: number };

function readAnchor(): Anchor {
  if (typeof window === "undefined") {
    return { base: CREATOR_COUNT_BASE, startedAt: Date.now() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Anchor;
  } catch {
    /* ignore */
  }
  const anchor = { base: CREATOR_COUNT_BASE, startedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anchor));
  return anchor;
}

export function getCreatorCount(now = Date.now()): number {
  const { base, startedAt } = readAnchor();
  const increments = Math.floor(Math.max(0, now - startedAt) / CREATOR_COUNT_INTERVAL_MS);
  return base + increments;
}

export function formatCreatorCount(n: number): string {
  return n.toLocaleString("zh-CN");
}

export function msUntilNextCreatorTick(now = Date.now()): number {
  const { startedAt } = readAnchor();
  const elapsed = Math.max(0, now - startedAt);
  const rem = CREATOR_COUNT_INTERVAL_MS - (elapsed % CREATOR_COUNT_INTERVAL_MS);
  return rem || CREATOR_COUNT_INTERVAL_MS;
}
