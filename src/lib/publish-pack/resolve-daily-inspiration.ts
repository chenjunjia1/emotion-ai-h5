import {
  INSPIRATION_TITLE_POOL,
  INSPIRATION_TITLE_POOL_SIZE,
} from "@/lib/publish-pack/inspiration-pool";

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

export function shuffleTitlesByBatch(titles: string[], dateKey: string, batch: number): string[] {
  return shuffleSeeded(titles, `${dateKey}-insp-b${batch}`);
}

export function getDailyInspirationTitles(dateKey: string, batch = 0, take = 30): string[] {
  const ordered = shuffleSeeded([...INSPIRATION_TITLE_POOL], `${dateKey}-insp-b${batch}`);
  return ordered.slice(0, Math.min(take, ordered.length));
}

export function getInspirationMeta(dateKey: string, count: number) {
  return {
    date: dateKey,
    total: count,
    updatedAt: `${dateKey} 08:00`,
    note: "每日 8 点更新，点选即可当今日主题",
  };
}

export function inspirationPoolSize() {
  return INSPIRATION_TITLE_POOL_SIZE;
}
