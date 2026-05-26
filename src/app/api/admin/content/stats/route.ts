import { NextResponse } from "next/server";
import { withAdminRoute } from "@/lib/server/admin-route";
import { getAdminContentStats } from "@/lib/server/db/admin";

export async function GET(req: Request) {
  return withAdminRoute(req, "admin-content-stats", async () => {
    const stats = await getAdminContentStats();
    if (!stats) {
      return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ stats });
  });
}
