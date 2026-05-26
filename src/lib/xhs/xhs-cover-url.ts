import { resolvePublicCoverUrl } from "@/lib/media/normalize-cover-url";

const XHS_IMAGE_HOST =
  /(^|\.)xhscdn\.com$|(^|\.)xiaohongshu\.com$|(^|\.)xhslink\.com$/i;

export function isXhsRemoteCoverUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return XHS_IMAGE_HOST.test(host);
  } catch {
    return false;
  }
}

/** 同源代理小红书 CDN，避免浏览器防盗链导致裂图 */
export function xhsCoverDisplayUrl(url: string | undefined): string | undefined {
  const u = resolvePublicCoverUrl(url);
  if (!u) return undefined;
  if (u.startsWith("/") || u.startsWith("data:")) return u;
  if (isXhsRemoteCoverUrl(u)) {
    return `/api/xhs/cover?url=${encodeURIComponent(u)}`;
  }
  return u;
}
