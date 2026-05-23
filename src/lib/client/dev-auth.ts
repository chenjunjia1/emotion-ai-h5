/** 客户端登录框是否预填测试验证码 */
export function isLoginCodePrefillAllowedClient(): boolean {
  const serverMode = process.env.NEXT_PUBLIC_BACKEND_MODE === "server";
  if (!serverMode) return true;
  return process.env.NODE_ENV === "development";
}
