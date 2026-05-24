import {
  INSPIRATION_TITLE_POOL,
  INSPIRATION_TITLE_POOL_SIZE,
  INSPIRATION_HEAT_OVERRIDES,
} from "@/lib/publish-pack/inspiration-pool";
import {
  deriveHeatFromTitle,
  sortByHeat,
  type HeatLevel,
} from "@/lib/content/heat-level";

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shuffleSeeded<T>(arr: T[], seedKey: string): T[] {
  const out = [...arr];
  let seed = hashSeed(seedKey);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export interface InspirationTitleItem {
  title: string;
  heat: HeatLevel;
}

export function getInspirationHeat(title: string, dateKey: string): HeatLevel {
  const override = INSPIRATION_HEAT_OVERRIDES[title as (typeof INSPIRATION_TITLE_POOL)[number]];
  return override ?? deriveHeatFromTitle(title, dateKey);
}

export function toInspirationItems(titles: string[], dateKey: string): InspirationTitleItem[] {
  return sortByHeat(
    titles.map((title) => ({
      title,
      heat: getInspirationHeat(title, dateKey),
    }))
  );
}

export function shuffleTitlesByBatch(titles: string[], dateKey: string, batch: number): string[] {
  return shuffleSeeded(titles, `${dateKey}-insp-b${batch}`);
}

export function getDailyInspirationTitles(dateKey: string, batch = 0, take = 30): string[] {
  const ordered = shuffleSeeded([...INSPIRATION_TITLE_POOL], `${dateKey}-insp-b${batch}`);
  return ordered.slice(0, Math.min(take, ordered.length));
}

export function getDailyInspirationItems(
  dateKey: string,
  batch = 0,
  take = 30
): InspirationTitleItem[] {
  const titles = getDailyInspirationTitles(dateKey, batch, take);
  return toInspirationItems(titles, dateKey);
}

export function getInspirationMeta(dateKey: string, count: number) {
  return {
    date: dateKey,
    total: count,
    updatedAt: `${dateKey} 08:00`,
    note: "每日 8 点更新 · 爆/高/中 标注热度，点选即可当今日主题",
  };
}

export function inspirationPoolSize() {
  return INSPIRATION_TITLE_POOL_SIZE;
}
