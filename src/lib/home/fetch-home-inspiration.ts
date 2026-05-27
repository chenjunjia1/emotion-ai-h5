import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";
import { coverPresetForTopic } from "@/lib/content/scene-cover-presets";
import { apiGetHotTopics } from "@/lib/client/server-api";
import { platformLabelForItem } from "@/lib/hot-topics/hot-topics-page-utils";
import type { HotTopicItem } from "@/lib/hot-topics/types";
import { resolvePublicCoverUrl } from "@/lib/media/normalize-cover-url";
import { diversifyXhsNotes } from "@/lib/xhs/xhs-feed-filters";
import type { XhsHotNote } from "@/lib/xhs/types";
import {
  applyUniqueCovers,
  fallbackHomeTop3Picks,
  mapXhsNoteToPick,
} from "@/lib/home/fetch-home-top3";

function hotTopicToPick(item: HotTopicItem): HomeCuratedPick {
  return {
    id: `ht-${item.id}`,
    title: item.displayTitle ?? item.title,
    topic: (item.displayTitle ?? item.title).slice(0, 32),
    accountType: item.category ?? item.track ?? "生活",
    style: "松弛",
    platform: platformLabelForItem(item),
    heatValue: item.heatValue ?? item.heat ?? "热",
    viralScore: item.viralScore ?? 75,
    coverPreset: coverPresetForTopic(
      item.title,
      item.id,
      item.tags ?? [],
      item.category
    ),
    coverImageUrl: resolvePublicCoverUrl(item.coverImage),
  };
}

/** 首页灵感精选：小红书爆款 + 热点库（原「今日热点」数据） */
export async function fetchHomeInspirationPicks(): Promise<HomeCuratedPick[]> {
  const merged: HomeCuratedPick[] = [];

  try {
    const res = await fetch("/api/xhs/hot-notes", { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; data?: XhsHotNote[] };
      if (data.success && data.data?.length) {
        merged.push(...diversifyXhsNotes(data.data, 16).map(mapXhsNoteToPick));
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const r = await apiGetHotTopics({ platform: "all", category: "全部", batch: 0 });
    if (r.items?.length) {
      for (const item of r.items.slice(0, 24)) {
        merged.push(hotTopicToPick(item as HotTopicItem));
      }
    }
  } catch {
    /* ignore */
  }

  const seen = new Set<string>();
  const unique = merged.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });

  if (unique.length < 4) {
    return applyUniqueCovers([...unique, ...fallbackHomeTop3Picks()]);
  }

  return applyUniqueCovers(unique);
}
