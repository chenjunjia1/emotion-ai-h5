import { NextResponse } from "next/server";
import { bundledCoverUrl } from "@/lib/content/bundled-cover-assets";
import { resolveSceneCategory } from "@/lib/content/scene-cover-presets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 列表封面：按 seed 拉 picsum 实景；失败则回退打包 JPG（保证每条可不同）
 */
export async function GET(
  req: Request,
  ctx: { params: Promise<{ seed: string }> }
) {
  const { seed: rawSeed } = await ctx.params;
  const seed = decodeURIComponent(rawSeed).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "cover";
  const { searchParams } = new URL(req.url);
  const w = searchParams.get("w") ?? "400";
  const h = searchParams.get("h") ?? "500";

  try {
    const res = await fetch(`https://picsum.photos/seed/${seed}/${w}/${h}`, {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (res.ok) {
      const body = await res.arrayBuffer();
      if (body.byteLength > 400) {
        return new NextResponse(body, {
          status: 200,
          headers: {
            "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
            "Cache-Control": "public, max-age=86400, s-maxage=604800",
            "X-Cover-Source": "picsum",
          },
        });
      }
    }
  } catch {
    /* 走本地 JPG */
  }

  const category = resolveSceneCategory(seed, "");
  const bundled = bundledCoverUrl(category, seed);
  try {
    const { readFile } = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(process.cwd(), "public", bundled.replace(/^\//, ""));
    const buf = await readFile(filePath);
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Cover-Source": "bundled-fallback",
      },
    });
  } catch {
    return NextResponse.json({ error: "cover_seed_unavailable" }, { status: 502 });
  }
}
