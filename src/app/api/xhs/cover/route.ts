import { NextResponse } from "next/server";
import { isXhsRemoteCoverUrl } from "@/lib/xhs/xhs-cover-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const REFERER = "https://www.xiaohongshu.com/";

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("url");
  if (!raw || !isXhsRemoteCoverUrl(raw)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const upstream = await fetch(raw, {
      headers: {
        Accept: "image/*",
        Referer: REFERER,
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.42",
      },
      signal: AbortSignal.timeout(12_000),
      redirect: "follow",
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "upstream_failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "image/jpeg";
    const body = await upstream.arrayBuffer();
    if (body.byteLength < 200) {
      return NextResponse.json({ error: "empty_image" }, { status: 502 });
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 502 });
  }
}
