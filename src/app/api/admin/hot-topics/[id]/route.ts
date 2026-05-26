import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";
import {
  getHotTopicForAdmin,
  updateHotTopicForAdmin,
  type HotTopicAdminPatch,
} from "@/lib/server/db/admin-hot-topics";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminRoute(req, "admin-hot-topic-get", async () => {
    const { id } = await params;
    const item = await getHotTopicForAdmin(id);
    if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ item });
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminRoute(req, "admin-hot-topic-patch", async (admin) => {
    const { id } = await params;
    const before = await getHotTopicForAdmin(id);
    if (!before) return NextResponse.json({ error: "not_found" }, { status: 404 });

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const patch: HotTopicAdminPatch = {};
    if (body.displayTitle !== undefined) patch.displayTitle = String(body.displayTitle);
    if (body.rawTitle !== undefined) patch.rawTitle = String(body.rawTitle);
    if (body.summary !== undefined) patch.summary = String(body.summary);
    if (body.category !== undefined) patch.category = String(body.category);
    if (body.platform !== undefined) patch.platform = String(body.platform);
    if (body.heatValue !== undefined) patch.heatValue = String(body.heatValue);
    if (body.heatScore !== undefined) patch.heatScore = Number(body.heatScore);
    if (body.coverImage !== undefined) patch.coverImage = String(body.coverImage);
    if (body.viralScore !== undefined) patch.viralScore = Number(body.viralScore);
    if (body.tags !== undefined)
      patch.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    if (body.targetUsers !== undefined)
      patch.targetUsers = Array.isArray(body.targetUsers)
        ? body.targetUsers.map(String)
        : [];
    if (body.recommendAngles !== undefined)
      patch.recommendAngles = Array.isArray(body.recommendAngles)
        ? body.recommendAngles.map(String)
        : [];
    if (body.status !== undefined) patch.status = body.status as HotTopicAdminPatch["status"];
    if (body.isNew !== undefined) patch.isNew = Boolean(body.isNew);
    if (body.badgeLabel !== undefined)
      patch.badgeLabel = body.badgeLabel ? String(body.badgeLabel) : null;
    if (body.likesLabel !== undefined)
      patch.likesLabel = body.likesLabel ? String(body.likesLabel) : null;
    if (body.savesLabel !== undefined)
      patch.savesLabel = body.savesLabel ? String(body.savesLabel) : null;
    if (body.commentsLabel !== undefined)
      patch.commentsLabel = body.commentsLabel ? String(body.commentsLabel) : null;
    if (body.displayOrder !== undefined) patch.displayOrder = Number(body.displayOrder);
    if (body.safeScore !== undefined) patch.safeScore = Number(body.safeScore);
    if (body.contentValueScore !== undefined)
      patch.contentValueScore = Number(body.contentValueScore);

    const after = await updateHotTopicForAdmin(id, patch);
    if (!after) return NextResponse.json({ error: "update_failed" }, { status: 400 });

    await logAdminAction(
      admin.id,
      "update_hot_topic",
      "hot_topic",
      id,
      before,
      after,
      "admin_panel"
    );

    return NextResponse.json({ item: after });
  });
}
