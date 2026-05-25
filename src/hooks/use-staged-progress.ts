"use client";

import { useEffect, useState } from "react";

/** 生成等待时轮换阶段文案，提升「有进度」的体感 */
export function useStagedProgress(
  active: boolean,
  stages: readonly string[],
  intervalMs = 700
): string {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setIndex(0);
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1 < stages.length ? i + 1 : i));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [active, stages, intervalMs]);

  return stages[Math.min(index, stages.length - 1)] ?? stages[0] ?? "";
}
