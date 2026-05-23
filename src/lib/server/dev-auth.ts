import { getSmsProvider } from "@/lib/server/config";

/** 生产环境禁止万能验证码与 dev 短信通道 */
export function isDevSmsBypassAllowed(): boolean {
  return process.env.NODE_ENV !== "production" && getSmsProvider() === "dev";
}
