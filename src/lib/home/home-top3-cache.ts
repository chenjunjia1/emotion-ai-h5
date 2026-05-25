import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";



/** 同一会话内缓存首页 TOP3，避免底部 Tab 切回首页时重新闪动 */

const TTL_MS = 30 * 60 * 1000;

const STORAGE_KEY = "emotion_home_top3_v2";



let cachedPicks: HomeCuratedPick[] | null = null;

let cachedAt = 0;

let inflight: Promise<HomeCuratedPick[] | null> | null = null;

let hasShownEnterAnim = false;



function readSessionCache(): HomeCuratedPick[] | null {

  if (typeof window === "undefined") return null;

  try {

    const raw = sessionStorage.getItem(STORAGE_KEY);

    if (!raw) return null;

    const parsed = JSON.parse(raw) as { at: number; picks: HomeCuratedPick[] };

    if (!parsed.picks?.length || Date.now() - parsed.at > TTL_MS) {

      sessionStorage.removeItem(STORAGE_KEY);

      return null;

    }

    return parsed.picks;

  } catch {

    return null;

  }

}



function writeSessionCache(picks: HomeCuratedPick[]): void {

  if (typeof window === "undefined") return;

  try {

    sessionStorage.setItem(

      STORAGE_KEY,

      JSON.stringify({ at: Date.now(), picks })

    );

  } catch {

    /* quota */

  }

}



export function getCachedHomeTop3(): HomeCuratedPick[] | null {

  if (cachedPicks && cachedPicks.length >= 3 && Date.now() - cachedAt <= TTL_MS) {

    return cachedPicks;

  }



  const fromSession = readSessionCache();

  if (fromSession && fromSession.length >= 3) {

    cachedPicks = fromSession;

    cachedAt = Date.now();

    return fromSession;

  }



  if (cachedPicks && Date.now() - cachedAt > TTL_MS) {

    cachedPicks = null;

  }

  return null;

}



export function setCachedHomeTop3(picks: HomeCuratedPick[]): void {

  if (picks.length < 3) return;

  cachedPicks = picks;

  cachedAt = Date.now();

  writeSessionCache(picks);

}



export function shouldPlayTop3EnterAnim(): boolean {

  if (hasShownEnterAnim) return false;

  hasShownEnterAnim = true;

  return true;

}



/** 合并并发请求：多处同时 mount 只打一次 API */

export function loadHomeTop3(

  fetcher: () => Promise<HomeCuratedPick[] | null>

): Promise<HomeCuratedPick[] | null> {

  const hit = getCachedHomeTop3();

  if (hit) return Promise.resolve(hit);



  if (inflight) return inflight;



  inflight = fetcher()

    .then((picks) => {

      if (picks && picks.length >= 3) setCachedHomeTop3(picks);

      return picks;

    })

    .finally(() => {

      inflight = null;

    });



  return inflight;

}



/** 仅用于开发自测 */

export function resetHomeTop3CacheForTest(): void {

  cachedPicks = null;

  cachedAt = 0;

  inflight = null;

  hasShownEnterAnim = false;

  if (typeof window !== "undefined") {

    sessionStorage.removeItem(STORAGE_KEY);

  }

}

