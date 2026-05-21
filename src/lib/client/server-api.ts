import type { Order, ProductDef, RiskResult, User } from "@/lib/types/v1";

export function isClientServerMode(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_MODE === "server";
}

export async function apiSendCode(mobile: string): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch("/api/auth/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "send_failed" };
  return { ok: true };
}

export async function apiLogin(
  mobile: string,
  code: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobile, code }),
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error || "login_failed" };
  return { ok: true, user: data.user as User };
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function apiMe(): Promise<User | null> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.user as User) || null;
}

export async function apiConfirmMockPay(
  orderId: string
): Promise<{ ok: boolean; user?: User; error?: string }> {
  const res = await fetch("/api/pay/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderId }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: data.error };
  return { ok: true, user: data.user as User };
}

export async function apiCreatePayOrder(
  product: ProductDef
): Promise<{ order?: Order; payUrl?: string; mock?: boolean; error?: string }> {
  const res = await fetch("/api/pay/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productName: product.productName }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error || "pay_create_failed" };
  return { order: data.order, payUrl: data.payUrl, mock: data.mock };
}

export async function apiGenerateAccount(input: Record<string, string>): Promise<{
  result?: Record<string, unknown>;
  risk?: RiskResult;
  user?: User;
  error?: string;
}> {
  const res = await fetch("/api/v1/generate/account", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return { result: data.result, risk: data.risk, user: data.user };
}

export async function apiGenerateDaily(topic: string) {
  const res = await fetch("/api/v1/generate/daily", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ topic }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return { result: data.result, risk: data.risk, user: data.user };
}

export async function apiGenerateViral(title: string, copy: string) {
  const res = await fetch("/api/v1/generate/viral", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ title, copy }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { error: data.error, risk: data.risk };
  return { result: data.result, risk: data.risk, user: data.user };
}
