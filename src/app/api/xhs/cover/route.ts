import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { isXhsRemoteCoverUrl } from "@/lib/xhs/xhs-cover-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFERER = "https://www.xiaohongshu.com/";

function coverSeedFallback(req: Request, rawUrl: string, w: string, h: string) {
  const seed = createHash("sha256").update(rawUrl).digest("hex").slice(0, 20);
  const target = new URL(`/api/cover-seed/${seed}?w=${w}&h=${h}`, req.url);
  return NextResponse.redirect(target, 307);
}

async function fetchUpstream(raw: string): Promise<Response | null> {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }

  const attempts: RequestInit[] = [
    {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        Referer: REFERER,
        Origin: "https://www.xiaohongshu.com",
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    },
    {
      headers: {
        Accept: "*/*",
        Referer: REFERER,
        Host: parsed.hostname,
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    },
  ];

  for (const init of attempts) {
    try {
      const res = await fetch(raw, init);
      if (res.ok) return res;
    } catch {
      /* next */
    }
  }
  return null;
}

/** 同源代理小红书 CDN；失败时 307 到 cover-seed，避免前端 502 */
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  const w = new URL(req.url).searchParams.get("w") ?? "400";
  const h = new URL(req.url).searchParams.get("h") ?? "400";

  if (!raw || !isXhsRemoteCoverUrl(raw)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  const upstream = await fetchUpstream(raw);

  if (!upstream) {
    return coverSeedFallback(req, raw, w, h);
  }

  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("text") || contentType.includes("json")) {
    return coverSeedFallback(req, raw, w, h);
  }

  const body = await upstream.arrayBuffer();
  if (body.byteLength < 200) {
    return coverSeedFallback(req, raw, w, h);
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": contentType || "image/jpeg",
      "Cache-Control": "public, max-age=604800, immutable, stale-while-revalidate=86400",
    },
  });
}
