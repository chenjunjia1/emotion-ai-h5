import { NextResponse } from "next/server";
import { isServerBackendEnabled } from "@/lib/server/config";
import { requireUser } from "@/lib/server/auth-request";

export async function GET() {
  if (!isServerBackendEnabled()) {
    return NextResponse.json({ user: null, mode: "local" });
  }

  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ user: null, mode: "server" }, { status: 401 });
  }
  return NextResponse.json({ user, mode: "server" });
}
