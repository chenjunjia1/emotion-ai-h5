#!/usr/bin/env node
/**
 * 释放 3000 端口，避免多个 dev 进程抢写 .next 导致 CSS/JS 404
 */
import { execSync } from "child_process";

const PORT = Number(process.env.DEV_PORT || 3000);

function killWindows(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();
    for (const line of out.split("\n")) {
      if (!/LISTENING/i.test(line)) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid}`, { stdio: "ignore" });
        console.log(`[kill-dev-port] 已结束进程 PID ${pid} (端口 ${port})`);
      } catch {
        /* ignore */
      }
    }
    return pids.size > 0;
  } catch {
    return false;
  }
}

function killUnix(port) {
  try {
    execSync(`lsof -ti:${port} | xargs -r kill -9`, { stdio: "ignore", shell: true });
    console.log(`[kill-dev-port] 已释放端口 ${port}`);
    return true;
  } catch {
    return false;
  }
}

export function killDevPort(port = PORT) {
  return process.platform === "win32" ? killWindows(port) : killUnix(port);
}

if (process.argv[1]?.includes("kill-dev-port")) {
  killDevPort();
}
