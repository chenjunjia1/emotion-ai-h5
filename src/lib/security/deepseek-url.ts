const DEFAULT_BASE = "https://api.deepseek.com";

const ALLOWED_HOSTS = new Set([
  "api.deepseek.com",
  "api.deepseek.com.cn",
]);

/** 防止 DEEPSEEK_API_URL 被篡改导致 SSRF */
export function resolveDeepSeekBaseUrl(): string {
  const raw = (process.env.DEEPSEEK_API_URL || DEFAULT_BASE).trim().replace(/\/$/, "");
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return DEFAULT_BASE;
  }
  if (parsed.protocol !== "https:") return DEFAULT_BASE;
  if (!ALLOWED_HOSTS.has(parsed.hostname)) return DEFAULT_BASE;
  return `${parsed.origin}`;
}
