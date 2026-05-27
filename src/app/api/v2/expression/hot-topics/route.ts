import { NextResponse } from "next/server";
import { INSPIRATION_HOT_RANK } from "@/lib/mock/expression-assistant";

/** GET /api/v2/expression/hot-topics — 多平台热点（预留 TikHub 等） */
export async function GET() {
  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    items: INSPIRATION_HOT_RANK.map((h, i) => ({
      id: `hot-${i}`,
      title: h.title,
      heat: h.heat,
      platform: h.platform,
    })),
  });
}
