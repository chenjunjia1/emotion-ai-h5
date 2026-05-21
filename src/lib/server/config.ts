/** 服务端能力开关（勿在客户端引用 service_role） */

export function isSupabaseReady(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getSessionSecret(): string | null {
  const s = process.env.SESSION_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

/** 登录/订单/额度走服务端 + 数据库 */
export function isServerBackendEnabled(): boolean {
  return isSupabaseReady() && Boolean(getSessionSecret());
}

export function getSmsProvider(): "dev" | "aliyun" {
  const p = (process.env.SMS_PROVIDER || "dev").toLowerCase();
  return p === "aliyun" ? "aliyun" : "dev";
}

export function getPayProvider(): "mock" | "alipay" {
  const p = (process.env.PAY_PROVIDER || "mock").toLowerCase();
  return p === "alipay" ? "alipay" : "mock";
}

export function getVideoProvider(): "mock" | "kling" | "custom" {
  const p = (process.env.VIDEO_PROVIDER || "mock").toLowerCase();
  if (p === "kling" || p === "custom") return p;
  return "mock";
}

export function isClientServerMode(): boolean {
  return process.env.NEXT_PUBLIC_BACKEND_MODE === "server";
}
