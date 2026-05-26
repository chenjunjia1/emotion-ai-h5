import { NextResponse } from "next/server";
import { parsePageParams, withAdminRoute } from "@/lib/server/admin-route";
import { listOrdersForAdmin } from "@/lib/server/db/admin";

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-orders-list", async () => {
    const url = new URL(req.url);
    const { page, limit } = parsePageParams(url);
    const status = url.searchParams.get("status")?.trim() || undefined;

    const result = await listOrdersForAdmin({
      status,
      page,
      limit,
    });
    if (!result) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }

    return NextResponse.json({ items: result.items, total: result.total, page, limit });
  });
}
