/**
 * 封面 URL 规范化 — 避免把 localhost 绝对地址写入生产库
 */

import { isFakeSiteCdnCoverUrl } from "@/lib/media/pick-cover-persist-url";

const DEV_HOST = /^(localhost|127\.0\.0\.1)$/i;

/** 本地开发环境写入的地址，生产/用户端不可访问 */
export function isDevOnlyCoverUrl(url: string | undefined): boolean {
  if (!url?.trim()) return false;
  const u = url.trim();
  if (u.startsWith("/")) return false;
  try {
    const { hostname, protocol } = new URL(u);
    if (protocol !== "http:" && protocol !== "https:") return false;
    return DEV_HOST.test(hostname);
  } catch {
    return false;
  }
}

/**
 * 统一为可持久化形式：优先相对路径 `/generated/...`
 * localhost 绝对地址 → 仅保留 path（若 path 在 prod 无文件，由前端 fallback）
 */
export function normalizeStoredCoverUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  let u = url.trim();

  if (u.startsWith("/")) return u;

  try {
    const parsed = new URL(u);
    if (DEV_HOST.test(parsed.hostname)) {
      return parsed.pathname.startsWith("/") ? parsed.pathname : undefined;
    }
    return u;
  } catch {
    return u;
  }
}

const EPHEMERAL_ADMIN_COVER = /^\/generated\/hot-topics-covers-/i;
const SUPABASE_STORAGE_HOST = /\.supabase\.co$/i;

function isLocalDevOrigin(): boolean {
  if (typeof window === "undefined") return false;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(window.location.origin);
}

/** 用户端展示用：dev-only 或无效则返回 undefined，触发 Pexels / 预设兜底 */
export function resolvePublicCoverUrl(url: string | undefined): string | undefined {
  if (!url?.trim()) return undefined;
  if (isDevOnlyCoverUrl(url)) return undefined;
  if (isFakeSiteCdnCoverUrl(url)) return undefined;
  const normalized = normalizeStoredCoverUrl(url);
  if (
    normalized &&
    EPHEMERAL_ADMIN_COVER.test(normalized) &&
    typeof window !== "undefined" &&
    !isLocalDevOrigin()
  ) {
    return undefined;
  }
  if (normalized?.startsWith("http")) {
    try {
      if (SUPABASE_STORAGE_HOST.test(new URL(normalized).hostname)) {
        return normalized;
      }
    } catch {
      /* ignore */
    }
  }
  return normalized;
}

/** 保存 / 读取 xhs 笔记时清洗 images */
export function normalizeXhsNoteImages<T extends { images: string[] }>(notes: T[]): T[] {
  return notes.map((n) => ({
    ...n,
    images: n.images
      .map((img) => normalizeStoredCoverUrl(img))
      .filter((img): img is string => Boolean(img)),
  }));
}
