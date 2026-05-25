import { NextResponse } from "next/server";
import { searchPexelsPhoto, searchPexelsPhotos } from "@/services/pexelsService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query")?.trim() ?? "";
  const index = Math.max(0, Number(searchParams.get("index") ?? "0") || 0);

  if (!query) {
    return NextResponse.json(
      { success: false, message: "缺少 query 参数" },
      { status: 400 }
    );
  }

  if (!process.env.PEXELS_API_KEY?.trim()) {
    return NextResponse.json(
      { success: false, message: "未配置 PEXELS_API_KEY" },
      { status: 503 }
    );
  }

  if (searchParams.get("all") === "1") {
    const photos = await searchPexelsPhotos(query);
    if (!photos.length) {
      return NextResponse.json({ success: false, message: "获取图片失败" });
    }
    return NextResponse.json({ success: true, data: photos });
  }

  const data = await searchPexelsPhoto(query, index);
  if (!data) {
    return NextResponse.json({ success: false, message: "获取图片失败" });
  }

  return NextResponse.json({ success: true, data });
}
