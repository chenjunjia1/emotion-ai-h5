import { NextResponse } from "next/server";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import { listGenerationsForUser, listOrdersForUser } from "@/lib/server/db/v1";
import { findUserById } from "@/lib/server/db/v1";

export async function GET(req: Request) {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ user: null, mode: "local" });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ user: null, mode: "server" }, { status: 401 });
  }

  const sync = new URL(req.url).searchParams.get("sync") === "1";
  if (!sync) {
    return NextResponse.json({ user, mode: "server" });
  }

  const refreshedUser = (await findUserById(user.id)) ?? user;
  const [orders, histories] = await Promise.all([
    listOrdersForUser(user.id),
    listGenerationsForUser(user.id),
  ]);

  return NextResponse.json({
    user: refreshedUser,
    mode: "server",
    orders,
    tasks: [],
    histories,
  });
}
