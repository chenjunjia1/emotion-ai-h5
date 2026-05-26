import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { logAdminAction } from "@/lib/server/db/admin";
import { getXhsNotesForAdmin, saveXhsNotesForAdmin } from "@/lib/server/db/admin-xhs-notes";
import type { XhsHotNote } from "@/lib/xhs/types";

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-xhs-get", async () => {
    const url = new URL(req.url);
    const dateKey = url.searchParams.get("date")?.trim() || undefined;
    const data = await getXhsNotesForAdmin(dateKey);
    if (!data) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }
    return NextResponse.json(data);
  });
}

export async function PUT(req: Request) {
  return withAdminRoute(req, "admin-xhs-save", async (admin) => {
    let body: { dateKey?: string; notes?: XhsHotNote[] };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (!Array.isArray(body.notes)) {
      return NextResponse.json({ error: "notes_required" }, { status: 400 });
    }

    const before = await getXhsNotesForAdmin(body.dateKey);
    const result = await saveXhsNotesForAdmin(body.notes, body.dateKey);
    if (!result.ok) {
      return NextResponse.json({ error: result.error ?? "save_failed" }, { status: 400 });
    }

    await logAdminAction(
      admin.id,
      "save_xhs_notes",
      "xhs_hot_notes_daily",
      body.dateKey ?? "today",
      before,
      { count: body.notes.length },
      "admin_panel"
    );

    return NextResponse.json({ ok: true, count: body.notes.length });
  });
}
