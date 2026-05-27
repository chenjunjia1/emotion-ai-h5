/** 树洞入口 · 在线人数（本地持久化，每 5 分钟随机加减） */

export const TREEHOLE_ONLINE_BASE = 7236;
export const TREEHOLE_ONLINE_MIN = 6800;
export const TREEHOLE_ONLINE_MAX = 9280;
export const TREEHOLE_ONLINE_TICK_MS = 5 * 60 * 1000;

const STORAGE_KEY = "treehole_online_count_v1";

type Stored = { count: number; updatedAt: number };

function randomDelta(): number {
  const magnitude = Math.floor(Math.random() * 36) + 3;
  return Math.random() < 0.5 ? -magnitude : magnitude;
}

export function clampTreeholeOnlineCount(count: number): number {
  return Math.min(TREEHOLE_ONLINE_MAX, Math.max(TREEHOLE_ONLINE_MIN, count));
}

/** 执行一次随机波动 */
export function tickTreeholeOnlineCount(count: number): number {
  return clampTreeholeOnlineCount(count + randomDelta());
}

export function formatTreeholeOnlineCount(count: number): string {
  return `${count.toLocaleString("zh-CN")} 人在线`;
}

export function readTreeholeOnlineCount(): Stored {
  if (typeof window === "undefined") {
    return { count: TREEHOLE_ONLINE_BASE, updatedAt: Date.now() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { count: TREEHOLE_ONLINE_BASE, updatedAt: Date.now() };
    }
    const parsed = JSON.parse(raw) as Stored;
    if (!Number.isFinite(parsed.count) || !Number.isFinite(parsed.updatedAt)) {
      return { count: TREEHOLE_ONLINE_BASE, updatedAt: Date.now() };
    }
    const elapsed = Date.now() - parsed.updatedAt;
    const ticks = Math.floor(elapsed / TREEHOLE_ONLINE_TICK_MS);
    if (ticks <= 0) {
      return {
        count: clampTreeholeOnlineCount(parsed.count),
        updatedAt: parsed.updatedAt,
      };
    }
    let count = clampTreeholeOnlineCount(parsed.count);
    for (let i = 0; i < ticks; i++) {
      count = tickTreeholeOnlineCount(count);
    }
    return {
      count,
      updatedAt: parsed.updatedAt + ticks * TREEHOLE_ONLINE_TICK_MS,
    };
  } catch {
    return { count: TREEHOLE_ONLINE_BASE, updatedAt: Date.now() };
  }
}

export function writeTreeholeOnlineCount(count: number, updatedAt: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ count: clampTreeholeOnlineCount(count), updatedAt })
    );
  } catch {
    /* ignore quota */
  }
}
