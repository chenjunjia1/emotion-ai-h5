/** 玩法动效最短时长，避免 API 太快显得生硬 */
export function minDelay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function withMinDuration<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  const [result] = await Promise.all([fn(), minDelay(ms)]);
  return result;
}

/** 盲盒摇动：最长等待时间（到点必须进入揭晓，不继续晃） */
export const BLIND_BOX_SHAKE_MAX_MS = 1100;
/** 盲盒摇动：最短时长（API 再快也略晃一下） */
export const BLIND_BOX_SHAKE_MIN_MS = 120;
/** 开盖倒计时 */
export const BLIND_BOX_OPENING_MS = 160;
