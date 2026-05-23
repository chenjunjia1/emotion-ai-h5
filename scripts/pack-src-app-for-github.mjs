#!/usr/bin/env node
/**
 * 打包正确的 src/app（修复分批上传误传到仓库根目录 app/ 的问题）
 * 用法: node scripts/pack-src-app-for-github.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "github-upload-src-app");
const zip = resolve(root, "github-upload-src-app.zip");

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(resolve(out, "src", "app"), { recursive: true });

cpSync(resolve(root, "src", "app"), resolve(out, "src", "app"), { recursive: true });

writeFileSync(
  resolve(out, "README-上传说明.txt"),
  `【重要】修复 Vercel 一直 Error / 线上仍是旧版

原因：分批脚本 batch-app.zip 里是「app」文件夹，若上传到仓库根目录，
会生成错误的 /app/page.tsx；Next.js 实际用的是 /src/app/page.tsx（旧版）。

请按顺序操作：

1) 删除仓库根目录的 app 文件夹（不是 src/app！）
   GitHub → emotion-ai-h5 → 点进根目录的 app → Delete directory

2) 上传本 zip 到仓库的 src 目录（合并覆盖）
   GitHub → src → Add file → Upload files → 拖入解压后的 src 文件夹
   Commit: fix: 同步 src/app 与本地一致

3) Vercel Deployments 等新的构建 Ready

更稳：直接用 emotion-ai-h5-上传GitHub.zip 整包覆盖整个 src。
`,
  "utf8"
);

if (existsSync(zip)) rmSync(zip);
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${out.replace(/'/g, "''")}\\*' -DestinationPath '${zip.replace(/'/g, "''")}' -Force"`,
  { stdio: "inherit" }
);

console.log("\n✅ 已生成:", zip);
console.log("   内含 src/app（", resolve(root, "src", "app"), "）\n");
