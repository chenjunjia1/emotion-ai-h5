import { NextResponse } from "next/server";
import { guardApi } from "@/lib/security/api-guard";
import { requireAdmin } from "@/lib/server/auth-request";
import { isServerBackendEnabled } from "@/lib/server/config";
import type { User } from "@/lib/types/v1";

type AdminHandler = (admin: User, req: Request) => Promise<NextResponse>;

export async function withAdminRoute(
  req: Request,
  scope: string,
  handler: AdminHandler,
  opts?: { ipLimit?: number }
): Promise<NextResponse> {
  const guard = guardApi(req, {
    scope,
    ipLimit: opts?.ipLimit ?? 40,
    ipWindowMs: 60_000,
  });
  if (guard instanceof NextResponse) return guard;

  if (!isServerBackendEnabled()) {
    return NextResponse.json({ error: "server_backend_disabled" }, { status: 503 });
  }

  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  return handler(admin, req);
}

export function parsePageParams(url: URL, defaults?: { limit?: number }) {
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(
    50,
    Math.max(1, Number(url.searchParams.get("limit") || String(defaults?.limit ?? 20)))
  );
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  return { page, limit, from, to };
}
