import { NextResponse } from "next/server";
import { parsePageParams, withAdminRoute } from "@/lib/server/admin-route";
import { listAdminAuditLogs } from "@/lib/server/db/admin";

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-audit-list", async () => {
    const url = new URL(req.url);
    const { page, limit } = parsePageParams(url);

    const result = await listAdminAuditLogs({
      page,
      limit,
    });
    if (!result) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    return NextResponse.json({ items: result.items, total: result.total, page, limit });
  });
}
