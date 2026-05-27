"use client";

import { useEffect, useState } from "react";
import {
  formatTreeholeOnlineCount,
  readTreeholeOnlineCount,
  tickTreeholeOnlineCount,
  TREEHOLE_ONLINE_BASE,
  TREEHOLE_ONLINE_TICK_MS,
  writeTreeholeOnlineCount,
} from "@/lib/treehole/online-count";

/** 树洞入口在线人数 · 每 5 分钟随机加减，刷新后按离线时长补算 */
export function useTreeholeOnlineCount(): number {
  const [count, setCount] = useState(TREEHOLE_ONLINE_BASE);

  useEffect(() => {
    const init = readTreeholeOnlineCount();
    setCount(init.count);
    writeTreeholeOnlineCount(init.count, init.updatedAt);

    const timer = window.setInterval(() => {
      setCount((prev) => {
        const next = tickTreeholeOnlineCount(prev);
        writeTreeholeOnlineCount(next, Date.now());
        return next;
      });
    }, TREEHOLE_ONLINE_TICK_MS);

    return () => window.clearInterval(timer);
  }, []);

  return count;
}

export function useTreeholeOnlineLabel(): string {
  const count = useTreeholeOnlineCount();
  return formatTreeholeOnlineCount(count);
}
