import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";

/** gpt-image-1 常返回 b64，转存为静态路径避免 JSON 过大 */
export function persistOpenAIImageUrl(urlOrB64: string): string {
  if (urlOrB64.startsWith("http://") || urlOrB64.startsWith("https://")) {
    return urlOrB64;
  }
  if (urlOrB64.startsWith("data:image")) {
    const b64 = urlOrB64.split(",")[1] ?? "";
    return persistB64(b64);
  }
  return persistB64(urlOrB64);
}

function persistB64(b64: string): string {
  const hash = createHash("sha256").update(b64.slice(0, 8000)).digest("hex").slice(0, 20);
  const dir = join(process.cwd(), "public", "generated");
  mkdirSync(dir, { recursive: true });
  const filename = `oai-${hash}.png`;
  const filePath = join(dir, filename);
  if (!existsSync(filePath)) {
    writeFileSync(filePath, Buffer.from(b64, "base64"));
  }
  return `/generated/${filename}`;
}
