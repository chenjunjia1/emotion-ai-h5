import type { StorageUploadResult } from "@/services/storageService";

/** 假 CDN：把对象路径拼到 H5 主站域名（文件并不在该域名下） */
export function isFakeSiteCdnCoverUrl(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return /^\/hot-topics\/covers\//.test(pathname);
  } catch {
    return false;
  }
}

/** 管理后台封面：只允许 Supabase 公网 URL 或本地 /generated */
export function pickAdminCoverPersistUrl(result: StorageUploadResult): string {
  for (const raw of [result.storageUrl, result.cdnUrl]) {
    const u = raw?.trim();
    if (!u) continue;
    if (u.includes(".supabase.co/storage/")) return u;
    if (u.startsWith("/generated/")) return u;
  }
  throw new Error("invalid_cover_url");
}
