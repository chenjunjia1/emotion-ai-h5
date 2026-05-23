import crypto from "crypto";

export function formatPrivateKey(raw: string): string {
  const key = raw.trim().replace(/\\n/g, "\n");
  if (key.includes("BEGIN")) return key;
  // 支付宝开放平台默认 PKCS8
  return `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;
}

export function formatPublicKey(raw: string): string {
  const key = raw.trim().replace(/\\n/g, "\n");
  if (key.includes("BEGIN")) return key;
  return `-----BEGIN PUBLIC KEY-----\n${key}\n-----END PUBLIC KEY-----`;
}

/** 支付宝异步通知验签用：参数按 key 排序拼接 */
export function buildSignContent(params: Record<string, string>): string {
  return Object.keys(params)
    .filter((k) => k !== "sign" && k !== "sign_type" && params[k] !== "")
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
}

export function signRSA2(content: string, privateKeyPem: string): string {
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(content, "utf8");
  return signer.sign(formatPrivateKey(privateKeyPem), "base64");
}

export function verifyRSA2(
  content: string,
  sign: string,
  alipayPublicKeyPem: string
): boolean {
  try {
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(content, "utf8");
    return verifier.verify(formatPublicKey(alipayPublicKeyPem), sign, "base64");
  } catch {
    return false;
  }
}

/** 支付宝网关请求时间（东八区） */
export function alipayTimestamp(): string {
  const parts = new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}
