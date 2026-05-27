import type { XhsHotNote } from "@/lib/xhs/types";
import {
  primaryInspirationCover,
  railInspirationCoverUrl,
} from "@/lib/xhs/inspiration-cover-candidates";

const warmed = new Set<string>();

function coverKey(src: string): string {
  return src.split("?")[0] ?? src;
}

/** 浏览器内存预热封面（仅成功加载后计入 warmed） */
export function prefetchXhsCovers(notes: XhsHotNote[], start = 0, count = 16): void {
  if (typeof window === "undefined") return;

  const slice = notes.slice(start, start + count);
  for (const note of slice) {
    const src = primaryInspirationCover(note);
    if (!src?.trim()) continue;
    const key = coverKey(src);
    if (warmed.has(key)) continue;

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      warmed.add(key);
    };
    img.onerror = () => {
      /* 不写入 warmed，避免误判为已加载 */
    };
    img.src = src;
  }
}

export function markCoverWarmed(src: string): void {
  warmed.add(coverKey(src));
}

export function isCoverWarmed(src: string): boolean {
  return warmed.has(coverKey(src));
}

/** 首页横滑预热：仅同源 cover-seed，不走小红书代理 */
export function prefetchRailInspirationCovers(notes: XhsHotNote[], count = 8): void {
  if (typeof window === "undefined") return;
  for (const note of notes.slice(0, count)) {
    const src = railInspirationCoverUrl(note);
    const key = coverKey(src);
    if (warmed.has(key)) continue;
    const img = new Image();
    img.decoding = "async";
    img.onload = () => warmed.add(key);
    img.src = src;
  }
}
