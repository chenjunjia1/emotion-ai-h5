import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";
import {
  applyUniqueCovers,
  mapXhsNoteToPick,
} from "@/lib/home/fetch-home-top3";
import { getCachedInspirationPool } from "@/lib/xhs/inspiration-pool-cache";
import { pickHomeTop3Notes } from "@/lib/xhs/home-top3-picks";
import { inspirationFeedHeadNotes } from "@/lib/xhs/xhs-feed-filters";
import type { XhsHotNote } from "@/lib/xhs/types";

/** 从灵感池原始列表解析首页 TOP3（服务端 / 客户端共用） */
export function resolveHomeTop3FromNotes(
  raw: XhsHotNote[],
  dataRevision?: string | null
): HomeCuratedPick[] | null {
  if (!raw.length) return null;

  const pool = getCachedInspirationPool(raw, dataRevision ?? null);
  const hotTop3 = inspirationFeedHeadNotes(pool, "hot", 3);
  const notes =
    hotTop3.length >= 3 ? hotTop3 : pickHomeTop3Notes(pool).slice(0, 3);
  if (notes.length < 3) return null;

  return applyUniqueCovers(notes.map(mapXhsNoteToPick));
}
