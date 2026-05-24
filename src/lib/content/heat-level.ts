export type HeatLevel = "爆" | "高" | "中";

const HEAT_SORT_ORDER: Record<HeatLevel, number> = {
  爆: 0,
  高: 1,
  中: 2,
};

export function normalizeHeat(heat: string): HeatLevel {
  if (heat === "爆" || heat === "高") return heat;
  return "中";
}

/** 爆 → 高 → 中 */
export function sortByHeat<T extends { heat: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      HEAT_SORT_ORDER[normalizeHeat(a.heat)] - HEAT_SORT_ORDER[normalizeHeat(b.heat)]
  );
}

export function heatBadgeClass(heat: string): string {
  const h = normalizeHeat(heat);
  if (h === "爆") return "bg-gradient-to-r from-rose-500 to-orange-500 text-white";
  if (h === "高") return "bg-rose-50 text-rose-600";
  return "bg-orange-50 text-orange-600";
}

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 无显式标注时按标题稳定分配热度 */
export function deriveHeatFromTitle(title: string, dateKey: string): HeatLevel {
  const n = hashSeed(`${dateKey}-${title}`) % 10;
  if (n < 2) return "爆";
  if (n < 5) return "高";
  return "中";
}
