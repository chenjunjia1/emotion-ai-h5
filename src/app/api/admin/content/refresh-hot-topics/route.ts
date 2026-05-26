import { NextResponse } from "next/server";
import { runHotTopicsUpdatePipeline } from "@/lib/hot-topics/update-pipeline";
import { withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";

/** 管理员会话触发热点刷新（无需 CRON_SECRET） */
export async function POST(req: Request) {
  return withAdminRoute(
    req,
    "admin-content-refresh",
    async (admin) => {
      const url = new URL(req.url);
      const dateKey =
        url.searchParams.get("date")?.trim() || new Date().toISOString().slice(0, 10);

      const result = await runHotTopicsUpdatePipeline(dateKey);

      await logAdminAction(
        admin.id,
        "refresh_hot_topics",
        "hot_topics",
        dateKey,
        null,
        result,
        "admin_panel"
      );

      if (!result.ok && result.source !== "cached") {
        return NextResponse.json({ error: "update_failed", ...result }, { status: 500 });
      }

      return NextResponse.json({ ...result, ok: true });
    },
    { ipLimit: 5 }
  );
}
