import {
  getWechatMiniCredentials,
  isWechatMiniConfigured,
} from "@/lib/server/wechat/config";

let cached: { token: string; exp: number } | null = null;

/** 小程序 access_token（内存缓存，约 2h 有效） */
export async function getMiniProgramAccessToken(): Promise<string | null> {
  if (!isWechatMiniConfigured()) return null;
  const now = Math.floor(Date.now() / 1000);
  if (cached && cached.exp > now + 60) return cached.token;

  const { appId, appSecret } = getWechatMiniCredentials();
  const url = new URL("https://api.weixin.qq.com/cgi-bin/token");
  url.searchParams.set("grant_type", "client_credential");
  url.searchParams.set("appid", appId);
  url.searchParams.set("secret", appSecret);

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  const token = String(data.access_token ?? "");
  const expiresIn = Number(data.expires_in ?? 7200);
  if (!token) {
    console.error("[wechat] access_token failed", data);
    return null;
  }
  cached = { token, exp: now + expiresIn };
  return token;
}
