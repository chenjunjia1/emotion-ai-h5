import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "@/lib/security/rate-limit";
import { getClientIp } from "@/lib/security/validate";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.supabase.co https://api.deepseek.com",
        "frame-ancestors 'none'",
      ].join("; ")
    );
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const global = rateLimit(
      `global:api:${ip}`,
      Number(process.env.API_RATE_LIMIT_PER_IP || "120"),
      60_000
    );
    if (!global.allowed) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试" },
        {
          status: 429,
          headers: { "Retry-After": String(global.retryAfterSec) },
        }
      );
    }
    response.headers.set(
      "X-RateLimit-Remaining",
      String(global.remaining)
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
