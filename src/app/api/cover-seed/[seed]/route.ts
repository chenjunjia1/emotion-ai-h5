import { NextResponse } from "next/server";
import type { SceneCategory } from "@/lib/content/scene-cover-presets";
import { resolveSceneCategory } from "@/lib/content/scene-cover-presets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SCENE_PROMPT: Record<SceneCategory, string> = {
  emotional: "soft moody portrait emotional aesthetic",
  worklife: "urban commute city lifestyle photo",
  pet: "cute cat pet cozy home photo",
  food: "food photography restaurant dish aesthetic",
  lifestyle: "lifestyle aesthetic cozy room photo",
  study: "desk workspace minimal aesthetic photo",
  fashion: "fashion outfit ootd street style photo",
  family: "warm family cozy home photo",
};

async function fetchImageBuffer(url: string, timeoutMs = 10_000): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: "image/*" },
      signal: AbortSignal.timeout(timeoutMs),
      redirect: "follow",
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (ct.includes("svg")) return null;
    const body = await res.arrayBuffer();
    return body.byteLength > 800 ? body : null;
  } catch {
    return null;
  }
}

/**
 * 列表封面：picsum → pollinations 实景；仅返回 JPEG/PNG，不返回 SVG
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
  const wNum = parseInt(w, 10) || 400;
  const isRailThumb = wNum <= 220;
  const category = resolveSceneCategory(seed, "");
  const prompt = SCENE_PROMPT[category] ?? SCENE_PROMPT.lifestyle;

  const picsum = await fetchImageBuffer(
    `https://picsum.photos/seed/${seed}/${w}/${h}`,
    isRailThumb ? 5_000 : 8_000
  );
  if (picsum) {
    return new NextResponse(picsum, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Cover-Source": "picsum",
      },
    });
  }

  if (!isRailThumb) {
  const pollinations = await fetchImageBuffer(
    `https://image.pollinations.ai/prompt/${encodeURIComponent(`${prompt}, variation ${seed}`)}?width=${w}&height=${h}&seed=${seed}&nologo=true`,
    10_000
  );
  if (pollinations) {
    return new NextResponse(pollinations, {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
        "X-Cover-Source": "pollinations",
      },
    });
  }
  }

  return NextResponse.json({ error: "cover_seed_unavailable" }, { status: 502 });
}
