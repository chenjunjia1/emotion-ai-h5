"use client";

import { useCallback, useState } from "react";

/** 防止重复点击；busy 状态驱动按钮 disabled */
export function useAsyncAction() {
  const [busy, setBusy] = useState(false);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (busy) return undefined;
    setBusy(true);
    try {
      return await fn();
    } finally {
      setBusy(false);
    }
  }, [busy]);

  return { run, busy };
}
