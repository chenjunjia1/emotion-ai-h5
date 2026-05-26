import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { updateFeedbackStatus } from "@/lib/server/db/admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdminRoute(req, "admin-feedback-update", async (admin) => {
    const { id } = await params;
    let body: { status?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    if (body.status !== "pending" && body.status !== "processed") {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }

    const ok = await updateFeedbackStatus(admin.id, id, body.status);
    if (!ok) {
      return NextResponse.json({ error: "update_failed" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  });
}
