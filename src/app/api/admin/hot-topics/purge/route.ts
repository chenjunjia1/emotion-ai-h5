import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";
import {
  countHotTopicsBySource,
  purgeCronHotTopics,
} from "@/lib/server/db/admin-hot-topics";

/** 清理 hot_topics 中非 TikHub 的 Cron 数据（抖音/微博等） */
export async function POST(req: Request) {
  return withAdminRoute(req, "admin-hot-topics-purge", async (admin) => {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      /* empty body ok */
    }

    const batchDate = body.batchDate ? String(body.batchDate).trim() : undefined;
    const scope = body.scope === "all" ? "all" : "cron";
    const confirm = body.confirm === true;

    if (!confirm) {
      const counts = await countHotTopicsBySource(batchDate);
      return NextResponse.json({
        error: "confirm_required",
        message: "请传 confirm: true 执行删除",
        counts,
        scope,
      });
    }

    const before = await countHotTopicsBySource(batchDate);
    const result = await purgeCronHotTopics({ batchDate, scope });
    if (!result) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    const after = await countHotTopicsBySource(batchDate);

    await logAdminAction(
      admin.id,
      "purge_hot_topics",
      "hot_topics",
      batchDate ?? "all",
      before,
      { ...result, after },
      "admin_panel"
    );

    return NextResponse.json({
      ok: true,
      deleted: result.deleted,
      scope: result.scope,
      before,
      after,
    });
  });
}

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-hot-topics-purge-preview", async () => {
    const url = new URL(req.url);
    const batchDate = url.searchParams.get("batch")?.trim() || undefined;
    const counts = await countHotTopicsBySource(batchDate);
    if (!counts) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ counts });
  });
}
