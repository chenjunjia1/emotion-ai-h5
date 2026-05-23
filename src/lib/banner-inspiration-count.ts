/** 今日灵感人数：当日 0 点起从 3 万基准，每 5 分钟 +1（全站社交证明数字共用） */
export const INSPIRATION_COUNT_BASE = 30_000;
export const INSPIRATION_TICK_MS = 5 * 60 * 1000;

export function getTodayInspirationCount(now = Date.now()): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = now - dayStart.getTime();
  const ticks = Math.floor(elapsed / INSPIRATION_TICK_MS);
  return INSPIRATION_COUNT_BASE + ticks;
}

/**
 * 展示用：「万」+ 三位小数，如 3.162万（31621 人）
 * 比 3.16万 更具体；文案连读：今日已有 3.162万 人生成灵感
 */
export function formatInspirationCount(n: number): string {
  if (n >= 10_000) {
    return `${(n / 10_000).toFixed(3)}万`;
  }
  return n.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

/** 距离下一次 +1 的毫秒数 */
export function msUntilNextInspirationTick(now = Date.now()): number {
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const elapsed = now - dayStart.getTime();
  const remainder = elapsed % INSPIRATION_TICK_MS;
  return remainder === 0 ? INSPIRATION_TICK_MS : INSPIRATION_TICK_MS - remainder;
}
