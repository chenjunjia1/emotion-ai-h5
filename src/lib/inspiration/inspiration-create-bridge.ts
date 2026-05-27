import { buildPublishPackAdvancedHref } from "@/lib/publish-pack/publish-pack-links";
import { buildMomentsCardCopy, buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import {
  buildMomentsInspirationHref,
  buildXhsInspirationHref,
} from "@/lib/xhs/xhs-inspiration-href";
import { baseXhsNoteId } from "@/lib/xhs/inspiration-pool";
import type { InspirationPlatformFilter } from "@/lib/xhs/xhs-feed-filters";
import type { XhsHotNote } from "@/lib/xhs/types";

export type InspirationCreateTool = "pack" | "moments" | "video" | "image";

export type InspirationPick = {
  noteId: string;
  headline: string;
  platform: "xhs" | "moments";
  category?: string;
  targetHref: string;
  pickedAt: number;
};

const LAST_PICK_KEY = "inspiration_last_pick_v1";

export function resolveInspirationPlatform(
  platform: InspirationPlatformFilter,
  note?: XhsHotNote
): "xhs" | "moments" {
  if (platform === "moments") return "moments";
  return "xhs";
}

export function buildInspirationTargetHref(
  note: XhsHotNote,
  platform: InspirationPlatformFilter
): string {
  const resolved = resolveInspirationPlatform(platform, note);
  return resolved === "moments"
    ? buildMomentsInspirationHref(note)
    : buildXhsInspirationHref(note);
}

export function saveInspirationPick(
  note: XhsHotNote,
  platform: InspirationPlatformFilter
): InspirationPick {
  const resolved = resolveInspirationPlatform(platform, note);
  const copy =
    resolved === "moments" ? buildMomentsCardCopy(note) : buildXhsCardCopy(note);
  const pick: InspirationPick = {
    noteId: baseXhsNoteId(note.noteId),
    headline: copy.headline.slice(0, 64),
    platform: resolved,
    category: note.category,
    targetHref: buildInspirationTargetHref(note, platform),
    pickedAt: Date.now(),
  };
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(LAST_PICK_KEY, JSON.stringify(pick));
    } catch {
      /* quota */
    }
  }
  return pick;
}

export function readInspirationPick(maxAgeMs = 24 * 60 * 60 * 1000): InspirationPick | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(LAST_PICK_KEY);
    if (!raw) return null;
    const pick = JSON.parse(raw) as InspirationPick;
    if (!pick?.targetHref || !pick.headline) return null;
    if (maxAgeMs > 0 && Date.now() - (pick.pickedAt ?? 0) > maxAgeMs) return null;
    return pick;
  } catch {
    return null;
  }
}

export function buildCreateHubHref(opts?: {
  tool?: InspirationCreateTool;
  topic?: string;
  from?: "inspiration";
}): string {
  const q = new URLSearchParams();
  if (opts?.tool) q.set("tool", opts.tool);
  if (opts?.topic?.trim()) q.set("topic", opts.topic.trim().slice(0, 80));
  if (opts?.from) q.set("from", opts.from);
  const s = q.toString();
  return s ? `/create?${s}` : "/create";
}

/** 创作中心 → 带选题进入对应工具 */
export function buildCreateToolHref(
  tool: InspirationCreateTool,
  topic?: string
): string {
  switch (tool) {
    case "pack":
    case "video": {
      const href = buildPublishPackAdvancedHref(topic, 4);
      const url = new URL(href, "http://local");
      url.searchParams.set("from", "create");
      return `${url.pathname}${url.search}`;
    }
    case "moments": {
      const q = new URLSearchParams({ from: "create" });
      if (topic?.trim()) q.set("topic", topic.trim().slice(0, 80));
      return `/expression/moments?${q.toString()}`;
    }
    case "image":
      return "/expression/image-caption?from=create";
    default:
      return "/create";
  }
}

export const CREATE_TOOL_ENTRY_IDS: Record<InspirationCreateTool, string> = {
  pack: "pack",
  video: "pack",
  moments: "moments",
  image: "image",
};
