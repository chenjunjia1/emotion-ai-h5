import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { queryTodayHotTopicsForAdmin } from "@/lib/server/db/admin-xhs-notes";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";

/** 今日热点内容查询（与用户端 /hot-topics 同源、同 Tab 筛选） */
export async function GET(req: Request) {
  return withAdminRoute(req, "admin-today-hot-query", async () => {
    const url = new URL(req.url);
    const dateKey = url.searchParams.get("date")?.trim() || undefined;
    const tab = url.searchParams.get("tab")?.trim() as XhsFeedTab | undefined;
    const category = url.searchParams.get("category")?.trim() || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;

    const result = await queryTodayHotTopicsForAdmin({ dateKey, tab, category, q });
    if (!result) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    return NextResponse.json(result);
  });
}
