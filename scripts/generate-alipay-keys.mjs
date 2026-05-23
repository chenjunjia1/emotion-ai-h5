/**
 * 本地生成支付宝 RSA2 密钥（PKCS8）
 * 运行: node scripts/generate-alipay-keys.mjs
 */
import { generateKeyPairSync } from "crypto";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, ".alipay-keys");

if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: { type: "spki", format: "pem" },
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

writeFileSync(resolve(outDir, "应用私钥-勿上传.txt"), privateKey, "utf8");
writeFileSync(resolve(outDir, "应用公钥-粘贴到支付宝.txt"), publicKey, "utf8");

const publicOneLine = publicKey
  .replace(/-----BEGIN PUBLIC KEY-----/g, "")
  .replace(/-----END PUBLIC KEY-----/g, "")
  .replace(/\s+/g, "");

writeFileSync(resolve(outDir, "应用公钥-单行.txt"), publicOneLine + "\n", "utf8");

const privateOneLine = privateKey
  .replace(/-----BEGIN PRIVATE KEY-----/g, "")
  .replace(/-----END PRIVATE KEY-----/g, "")
  .replace(/\s+/g, "");

writeFileSync(
  resolve(outDir, "README-下一步.txt"),
  [
    "密钥已生成。文件夹: emotion-ai-h5\\.alipay-keys",
    "",
    "【你只需要手动做 1 次（约 1 分钟）】",
    "1. 用记事本打开「应用公钥-单行.txt」，Ctrl+A 全选，Ctrl+C 复制",
    "2. 浏览器打开 open.alipay.com → 你的应用 → 开发设置 → 接口加签方式 → 设置",
    "3. 选「公钥」→ 粘贴 → 保存",
    "4. 网页出现「支付宝公钥」→ 复制整段",
    "5. 打开项目 .env.local，把 ALIPAY_PUBLIC_KEY= 后面贴上支付宝公钥，保存",
    "6. 再运行: node scripts/apply-alipay-public-key.mjs （或手动粘贴）",
    "",
    "应用私钥已尝试写入 .env.local 的 ALIPAY_PRIVATE_KEY",
    "切勿把私钥上传到 GitHub！",
  ].join("\n"),
  "utf8"
);

function upsertEnv(key, value) {
  const envPath = resolve(root, ".env.local");
  let text = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const line = `${key}=${value}`;
  const re = new RegExp(`^${key}=.*$`, "m");
  if (re.test(text)) {
    text = text.replace(re, line);
  } else {
    if (text.length && !text.endsWith("\n")) text += "\n";
    text += line + "\n";
  }
  writeFileSync(envPath, text, "utf8");
}

try {
  upsertEnv("ALIPAY_PRIVATE_KEY", privateOneLine);
  if (!existsSync(resolve(root, ".env.local"))) {
    writeFileSync(
      resolve(root, ".env.local"),
      "PAY_PROVIDER=mock\nNEXT_PUBLIC_BACKEND_MODE=server\n",
      "utf8"
    );
    upsertEnv("ALIPAY_PRIVATE_KEY", privateOneLine);
  }
} catch (e) {
  console.warn("未能写入 .env.local:", e.message);
}

console.log("\n✅ 已在你的电脑生成密钥:");
console.log("   ", outDir);
console.log("\n📋 请你只做这一件事（我无法替你登录支付宝网页）:");
console.log("   打开「应用公钥-单行.txt」→ 复制 → 粘贴到支付宝「接口加签方式」→ 保存");
console.log("\n📁 用资源管理器打开文件夹:");
console.log("   explorer \"" + outDir + "\"\n");
