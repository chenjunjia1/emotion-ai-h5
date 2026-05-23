#!/usr/bin/env node
/**
 * 1. 结束占用 3000 的旧 dev
 * 2. 删除 .next（避免 CSS/JS 404、无样式页）
 * 3. 启动 next dev
 */
import { rmSync, existsSync } from "fs";
import { spawn } from "child_process";
import { killDevPort } from "./kill-dev-port.mjs";

console.log("[dev-fresh] 正在释放 3000 端口…");
killDevPort(3000);

if (existsSync(".next")) {
  rmSync(".next", { recursive: true, force: true });
  console.log("[dev-fresh] 已删除 .next");
}

console.log("[dev-fresh] 启动开发服务…");
console.log("[dev-fresh] 提示: 开发时不要同时运行 npm run build");

const child = spawn("npx", ["next", "dev"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

child.on("exit", (code) => process.exit(code ?? 0));
