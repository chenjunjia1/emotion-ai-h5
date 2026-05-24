import { NextResponse } from "next/server";
import { requireUser } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import { getGrowthProfile } from "@/lib/server/db/growth";
import { getUserDailyUsageCounts } from "@/lib/server/db/product-v1";

export async function GET() {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const [usage, growth] = await Promise.all([
    getUserDailyUsageCounts(user.id),
    getGrowthProfile(user.id),
  ]);

  return NextResponse.json({
    dailyUsage: usage,
    growth: growth ?? { xp: 0, streakDays: 0, tasksDone: [], lastCheckinDate: null },
  });
}
