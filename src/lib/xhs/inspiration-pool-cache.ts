import type { XhsHotNote } from "@/lib/xhs/types";
import { buildInspirationFeedPool } from "@/lib/xhs/inspiration-pool";

type PoolCache = {
  revision: string | null;
  notes: XhsHotNote[];
  builtAt: number;
  schema: number;
};

let serverPool: PoolCache | null = null;

const TTL_MS = 10 * 60 * 1000;
/** 展示策略变更时递增，使旧内存池失效 */
const POOL_SCHEMA = 6;

/** 服务端灵感池内存缓存，避免每次请求都重建 300 条 */
export function getCachedInspirationPool(
  raw: XhsHotNote[],
  revision?: string | null
): XhsHotNote[] {
  const rev = revision ?? null;
  const now = Date.now();
  if (
    serverPool &&
    serverPool.schema === POOL_SCHEMA &&
    serverPool.revision === rev &&
    now - serverPool.builtAt < TTL_MS &&
    serverPool.notes.length > 0
  ) {
    return serverPool.notes;
  }
  const notes = buildInspirationFeedPool(raw);
  serverPool = { revision: rev, notes, builtAt: now, schema: POOL_SCHEMA };
  return notes;
}

export function invalidateInspirationPoolCache(): void {
  serverPool = null;
}

/** 部署后强制重建灵感池（标题/封面策略变更时调用） */
export function bumpInspirationPoolCache(): void {
  serverPool = null;
}
