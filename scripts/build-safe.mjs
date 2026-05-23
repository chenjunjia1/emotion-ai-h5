#!/usr/bin/env node
/**
 * build 前检查 dev 是否在跑，避免与 next dev 同时写 .next 导致白屏/无样式
 */
import { spawn } from "child_process";
import net from "net";
import { killDevPort } from "./kill-dev-port.mjs";

const PORT = Number(process.env.DEV_PORT || 3000);

function isPortOpen(port) {
  return new Promise((resolve) => {
    const s = net.createConnection({ port, host: "127.0.0.1" });
    s.once("connect", () => {
      s.destroy();
      resolve(true);
    });
    s.once("error", () => resolve(false));
    setTimeout(() => {
      s.destroy();
      resolve(false);
    }, 400);
  });
}

const open = await isPortOpen(PORT);
if (open) {
  console.error(
    `\n[build-safe] 端口 ${PORT} 仍有开发服务在运行。\n` +
      `请先在该终端按 Ctrl+C 停止 npm run dev，或执行: node scripts/kill-dev-port.mjs\n` +
      `否则 npm run build 可能破坏 .next，页面会变成无样式纯 HTML。\n`
  );
  process.exit(1);
}

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  cwd: process.cwd(),
});

child.on("exit", (code) => process.exit(code ?? 0));
