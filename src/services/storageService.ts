/**
 * 图片存储 — 腾讯云 COS / 阿里云 OSS（配置后）或本地 public/generated（开发）
 * 前端只展示 CDN / 自有域名地址
 */

import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  isSupportedAdminImageMime,
  sniffImageMime,
} from "@/lib/media/sniff-image-mime";

export type StorageUploadResult = {
  storageUrl: string;
  cdnUrl: string;
  key: string;
};

function getCdnBase(): string {
  return (
    process.env.CDN_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_CDN_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    ""
  );
}

function localFallback(buffer: Buffer, storageKey: string): StorageUploadResult {
  const dir = join(process.cwd(), "public", "generated");
  mkdirSync(dir, { recursive: true });
  const filename = storageKey.replace(/\//g, "-");
  const filePath = join(dir, filename);
  if (!existsSync(filePath)) writeFileSync(filePath, buffer);
  const path = `/generated/${filename}`;
  const base = getCdnBase().replace(/\/$/, "");
  return {
    key: storageKey,
    storageUrl: path,
    cdnUrl: base ? `${base}${path}` : path,
  };
}

/** 通过预签名 URL 上传（配置 COS_UPLOAD_URL 模板，{key} 占位） */
async function uploadToCosPresigned(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<StorageUploadResult> {
  const template = process.env.COS_UPLOAD_URL_TEMPLATE?.trim();
  const cdnBase = getCdnBase();
  if (!template?.includes("{key}")) {
    throw new Error("COS_UPLOAD_URL_TEMPLATE 未配置");
  }
  const objectKey = key.startsWith("/") ? key.slice(1) : key;
  const uploadUrl = template.replace("{key}", encodeURIComponent(objectKey));
  const res = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": contentType },
    body: new Uint8Array(buffer),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) {
    throw new Error(`COS 上传失败 ${res.status}`);
  }
  const cdnUrl = cdnBase ? `${cdnBase.replace(/\/$/, "")}/${objectKey}` : uploadUrl.split("?")[0]!;
  return { key: objectKey, storageUrl: uploadUrl, cdnUrl };
}

export function isCosConfigured(): boolean {
  return Boolean(process.env.COS_UPLOAD_URL_TEMPLATE?.trim()?.includes("{key}"));
}

export async function uploadImageBuffer(
  buffer: Buffer,
  opts: { keyPrefix?: string; ext?: string; contentType?: string }
): Promise<StorageUploadResult> {
  const ext = opts.ext ?? "jpg";
  const contentType = opts.contentType ?? (ext === "png" ? "image/png" : "image/jpeg");
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const key = `${opts.keyPrefix ?? "publish-pack"}/${Date.now()}-${hash}.${ext}`;

  if (isCosConfigured()) {
    try {
      return await uploadToCosPresigned(buffer, key, contentType);
    } catch (e) {
      console.warn("[storageService] COS upload failed, fallback local:", e);
    }
  }

  return localFallback(buffer, key);
}

const ADMIN_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/** 管理后台相册上传（热点封面等） */
export async function uploadAdminImageFile(
  buffer: Buffer,
  mime: string,
  opts?: { keyPrefix?: string }
): Promise<StorageUploadResult> {
  const sniffed = sniffImageMime(buffer);
  let normalized = mime.toLowerCase().split(";")[0]!;
  if (!isSupportedAdminImageMime(normalized) && sniffed) {
    normalized = sniffed;
  }
  if (normalized === "image/heic") {
    throw new Error("unsupported_type");
  }
  if (!ADMIN_IMAGE_TYPES.has(normalized)) {
    throw new Error("unsupported_type");
  }
  const ext = extFromMime(normalized);
  return uploadImageBuffer(buffer, {
    keyPrefix: opts?.keyPrefix ?? "admin/covers",
    ext,
    contentType: normalized,
  });
}

export async function uploadFromUrl(
  imageUrl: string,
  opts?: { keyPrefix?: string }
): Promise<StorageUploadResult> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(60_000) });
  if (!res.ok) throw new Error(`下载图片失败 ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = imageUrl.includes(".png") ? "png" : "jpg";
  return uploadImageBuffer(buf, { ...opts, ext });
}

export async function uploadFromBase64(
  b64: string,
  opts?: { keyPrefix?: string; ext?: string }
): Promise<StorageUploadResult> {
  const raw = b64.replace(/^data:image\/\w+;base64,/, "");
  const buf = Buffer.from(raw, "base64");
  return uploadImageBuffer(buf, opts ?? {});
}
