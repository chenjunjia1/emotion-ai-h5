import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";
import { HOME_INSPIRATION_TOP3, buildHomePickHref } from "@/lib/content/home-curated-picks";
import { coverPresetForTopic } from "@/lib/content/scene-cover-presets";
import { assignUniqueCoverPresets } from "@/lib/content/unique-topic-covers";
import { resolvePublicCoverUrl } from "@/lib/media/normalize-cover-url";
import { buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { pickHomeTop3Notes } from "@/lib/xhs/home-top3-picks";
import { formatXhsCount } from "@/lib/xhs/xhs-feed-filters";
import type { XhsHotNote } from "@/lib/xhs/types";

function mapXhsNoteToPick(note: XhsHotNote): HomeCuratedPick {
  const copy = buildXhsCardCopy(note);
  const viralScore = Math.min(98, Math.max(72, 68 + Math.round(note.hotScore / 12)));

  return {
    id: `xhs-${note.noteId}`,
    title: copy.headline,
    topic: copy.headline.slice(0, 32),
    accountType: note.category,
    style: "松弛",
    platform: "小红书",
    heatValue: formatXhsCount(note.likedCount),
    viralScore,
    coverPreset: coverPresetForTopic(copy.headline, note.noteId, [], note.category),
    coverImageUrl: resolvePublicCoverUrl(note.images[0]),
    xhsNoteId: note.noteId,
    xhsCategory: note.category,
    xhsAngle: copy.angle,
  };
}

function applyUniqueCovers(picks: HomeCuratedPick[]): HomeCuratedPick[] {
  const needPreset = picks.filter((p) => !p.coverImageUrl);
  if (!needPreset.length) return picks;

  const presets = assignUniqueCoverPresets(
    needPreset.map((p) => ({ id: p.id, title: p.title, category: p.accountType }))
  );
  return picks.map((p) => ({
    ...p,
    coverPreset: p.coverImageUrl ? p.coverPreset : presets.get(p.id) ?? p.coverPreset,
  }));
}

/** 首页 TOP3：今日爆款前 3（与热点页「今日爆款」Tab 同源） */
export async function fetchHomeTop3FromApi(): Promise<HomeCuratedPick[] | null> {
  const res = await fetch("/api/xhs/hot-notes", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { success?: boolean; data?: XhsHotNote[] };
  if (!data.success || !data.data || data.data.length < 3) return null;

  const top3 = pickHomeTop3Notes(data.data).map(mapXhsNoteToPick);
  return applyUniqueCovers(top3);
}

export function fallbackHomeTop3Picks(): HomeCuratedPick[] {
  return applyUniqueCovers(HOME_INSPIRATION_TOP3);
}

export function top3PickIds(picks: HomeCuratedPick[]): string {
  return picks.map((p) => p.id).join(",");
}

export function buildHomeTop3Href(pick: HomeCuratedPick): string {
  if (pick.xhsNoteId) {
    const q = new URLSearchParams({
      platform: "小红书",
      topic: pick.topic.slice(0, 32),
      inspiration_mode: "xhs",
      inspiration_id: pick.xhsNoteId,
      inspiration_category: pick.xhsCategory ?? pick.accountType,
    });
    if (pick.xhsAngle) {
      q.set("inspiration_hint", `${pick.xhsAngle}；请 AI 原创改写，禁止照搬原文与图片`);
    }
    return `/publish-pack?${q.toString()}`;
  }
  if (!pick.id.startsWith("insp-")) {
    return `/publish-pack?topic_id=${encodeURIComponent(pick.id)}&topic=${encodeURIComponent(pick.topic)}`;
  }
  return buildHomePickHref(pick);
}
