/**
 * 把「支付宝公钥」写入 .env.local（你从网页复制后粘贴到 .alipay-keys/支付宝公钥-从网页复制.txt）
 * 运行: node scripts/apply-alipay-public-key.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = resolve(root, ".alipay-keys", "支付宝公钥-从网页复制.txt");

if (!existsSync(src)) {
  console.log("\n请先创建文件并粘贴支付宝公钥:");
  console.log(" ", src);
  console.log("\n步骤: 支付宝开发设置保存后 → 复制「支付宝公钥」→ 粘贴进该文件 → 保存 → 再运行本脚本\n");
  process.exit(1);
}

let key = readFileSync(src, "utf8").trim();
key = key
  .replace(/-----BEGIN PUBLIC KEY-----/g, "")
  .replace(/-----END PUBLIC KEY-----/g, "")
  .replace(/\s+/g, "");

const envPath = resolve(root, ".env.local");
let text = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
const line = `ALIPAY_PUBLIC_KEY=${key}`;
const re = /^ALIPAY_PUBLIC_KEY=.*$/m;
if (re.test(text)) text = text.replace(re, line);
else text = text.trimEnd() + "\n" + line + "\n";

writeFileSync(envPath, text, "utf8");
console.log("\n✅ 已写入 .env.local → ALIPAY_PUBLIC_KEY\n");
