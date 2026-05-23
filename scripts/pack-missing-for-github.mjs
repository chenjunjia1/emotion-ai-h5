#!/usr/bin/env node
/**
 * 打包 GitHub 上缺失、导致 Vercel Module not found 的目录
 * 用法: node scripts/pack-missing-for-github.mjs
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, "github-upload-missing");
const zip = resolve(root, "github-upload-missing.zip");

const PATHS = [
  "src/components/play",
  "src/components/pricing",
  "src/components/home",
  "src/lib/ai/normalize-ai-result.ts",
  "src/lib/play-rarity.ts",
  "src/lib/play-sounds.ts",
  "src/lib/quest-loot.ts",
  "src/lib/v1/invite-progress.ts",
  "src/hooks/use-async-action.ts",
  "scripts/grant-bonus-quota.mjs",
];

if (existsSync(out)) rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const manifest = [];
for (const rel of PATHS) {
  const src = resolve(root, rel);
  if (!existsSync(src)) {
    console.warn("[skip] not found:", rel);
    continue;
  }
  const dest = resolve(out, rel);
  mkdirSync(dirname(dest), { recursive: true });
  const stat = cpSync(src, dest, { recursive: true });
  manifest.push(rel);
}

writeFileSync(
  resolve(out, "README-上传说明.txt"),
  `Vercel 报错是因为 GitHub 缺这些文件（app 已更新但依赖未上传）。

上传步骤：
1. 解压 github-upload-missing.zip
2. 打开 https://github.com/chenjunjia1/emotion-ai-h5
3. 进入 src 目录 → Add file → Upload files
4. 拖入解压后的 components 和 lib 文件夹（合并到现有 src 下）
5. Commit: fix: 补全 play/pricing/home 组件与 lib 依赖
6. 等 Vercel 自动部署 Ready

若仍失败，请用 emotion-ai-h5-上传GitHub.zip 整包覆盖 src。
`,
  "utf8"
);

if (existsSync(zip)) rmSync(zip);
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${out.replace(/'/g, "''")}\\*' -DestinationPath '${zip.replace(/'/g, "''")}' -Force"`,
  { stdio: "inherit" }
);

console.log("\n✅ 已打包缺失文件:");
manifest.forEach((p) => console.log("   ", p));
console.log("\n📦", zip);
console.log("\n请按 README-上传说明.txt 上传到 GitHub src 目录\n");
