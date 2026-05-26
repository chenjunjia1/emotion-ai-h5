import { NextResponse } from "next/server";
import { parsePageParams, withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";
import {
  countHotTopicsBySource,
  createHotTopicForAdmin,
  listHotTopicBatchDates,
  listHotTopicCategoryStats,
  listHotTopicsForAdmin,
} from "@/lib/server/db/admin-hot-topics";

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-hot-topics-list", async () => {
    const url = new URL(req.url);
    const { page, limit } = parsePageParams(url);
    const batchDate = url.searchParams.get("batch")?.trim() || undefined;
    const status = url.searchParams.get("status")?.trim() || "all";
    const category = url.searchParams.get("category")?.trim() || undefined;
    const q = url.searchParams.get("q")?.trim() || undefined;
    const platformFilterParam = url.searchParams.get("platformFilter")?.trim();
    const platformFilter =
      platformFilterParam === "cron" || platformFilterParam === "xhs"
        ? platformFilterParam
        : platformFilterParam === "all"
          ? "all"
          : "xhs";

    const [result, batches, categoryStats, sourceCounts] = await Promise.all([
      listHotTopicsForAdmin({
        batchDate,
        status,
        category,
        platformFilter,
        q,
        page,
        limit,
      }),
      listHotTopicBatchDates(),
      listHotTopicCategoryStats(batchDate, status, platformFilter),
      countHotTopicsBySource(batchDate),
    ]);

    if (!result) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    if (result.error) {
      return NextResponse.json(
        {
          error: "query_failed",
          message: result.error,
          items: result.items,
          total: result.total,
          batches,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: result.items,
      total: result.total,
      page,
      limit,
      batches,
      categoryStats,
      sourceCounts,
      platformFilter,
      resolvedBatch: result.resolvedBatch,
    });
  });
}

export async function POST(req: Request) {
  return withAdminRoute(req, "admin-hot-topics-create", async (admin) => {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const displayTitle = String(body.displayTitle ?? "").trim();
    if (!displayTitle) {
      return NextResponse.json({ error: "title_required" }, { status: 400 });
    }

    const created = await createHotTopicForAdmin({
      displayTitle,
      rawTitle: body.rawTitle ? String(body.rawTitle) : undefined,
      summary: body.summary ? String(body.summary) : undefined,
      category: body.category ? String(body.category) : undefined,
      platform: body.platform ? String(body.platform) : undefined,
      heatValue: body.heatValue ? String(body.heatValue) : undefined,
      coverImage: body.coverImage ? String(body.coverImage) : undefined,
      viralScore: body.viralScore !== undefined ? Number(body.viralScore) : undefined,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : undefined,
      badgeLabel: body.badgeLabel ? String(body.badgeLabel) : undefined,
      likesLabel: body.likesLabel ? String(body.likesLabel) : undefined,
      savesLabel: body.savesLabel ? String(body.savesLabel) : undefined,
      commentsLabel: body.commentsLabel ? String(body.commentsLabel) : undefined,
      displayOrder: body.displayOrder !== undefined ? Number(body.displayOrder) : undefined,
    });

    if (!created) {
      return NextResponse.json({ error: "create_failed" }, { status: 400 });
    }

    await logAdminAction(
      admin.id,
      "create_hot_topic",
      "hot_topic",
      created.id,
      null,
      created,
      "admin_panel"
    );

    return NextResponse.json({ item: created });
  });
}
