import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/lib/server/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(clearSessionCookieOptions());
  return res;
}
