import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { bundledCoverAtIndex } from "@/lib/content/bundled-cover-assets";
import { buildTopicPhotoLocalFallback } from "@/lib/content/topic-cover-match";
import { SCENE_IMAGE_POOLS, type SceneCategory } from "@/lib/content/scene-cover-pools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOST = "images.unsplash.com";

/** Unsplash photo id → 本地实景 JPG（热点二级场景池 + 旧场景池） */
const PHOTO_LOCAL_FALLBACK: Record<string, string> = (() => {
  const map: Record<string, string> = { ...buildTopicPhotoLocalFallback() };
  for (const [cat, pool] of Object.entries(SCENE_IMAGE_POOLS)) {
    const category = cat as SceneCategory;
    pool.forEach((entry, i) => {
      if (!map[entry.id]) {
        map[entry.id] = `public${bundledCoverAtIndex(category, i)}`;
      }
    });
  }
  return map;
})();

function hashPhotoId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

async function serveLocalFallback(photoId: string): Promise<NextResponse | null> {
  const rel =
    PHOTO_LOCAL_FALLBACK[photoId] ??
    `public${bundledCoverAtIndex("lifestyle", hashPhotoId(photoId))}`;
  try {
    const filePath = path.join(process.cwd(), rel);
    const buf = await readFile(filePath);
    const isSvg = rel.endsWith(".svg");
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": isSvg ? "image/svg+xml" : "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Cover-Source": "local-fallback",
      },
    });
  } catch {
    return null;
  }
}

/**
 * 同源图片代理：优先拉 Unsplash；失败则返回本地分类 SVG（保证封面必有图）
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await ctx.params;
  if (!segments?.length) {
    return NextResponse.json({ error: "missing path" }, { status: 400 });
  }

  const photoPath = segments.join("/");
  const photoId = photoPath.split("/")[0] ?? photoPath;
  if (!/^photo-[a-zA-Z0-9-]+$/i.test(photoId)) {
    return NextResponse.json({ error: "invalid photo id" }, { status: 400 });
  }

  const incoming = new URL(req.url);
  const upstream = new URL(`https://${ALLOWED_HOST}/${photoPath}`);
  incoming.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") ?? "image/jpeg";
      const body = await res.arrayBuffer();
      if (body.byteLength > 500) {
        return new NextResponse(body, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
            "X-Cover-Source": "unsplash",
          },
        });
      }
    }
  } catch {
    /* 走本地兜底 */
  }

  const local = await serveLocalFallback(photoId);
  if (local) return local;

  return NextResponse.json({ error: "cover_unavailable" }, { status: 502 });
}
