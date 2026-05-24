import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";
import {
  advanceMockVideoTasks,
  findUserById,
  listVideoTasksForUser,
} from "@/lib/server/db/v1";

export async function GET(req: Request) {
  const guard = guardApi(req, {
    scope: "v1-video-tasks",
    ipLimit: 60,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await advanceMockVideoTasks(user.id);
  const tasks = await listVideoTasksForUser(user.id);
  const refreshedUser = await findUserById(user.id);

  return NextResponse.json({ tasks, user: refreshedUser });
}
