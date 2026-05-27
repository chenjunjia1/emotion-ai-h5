"use client";

import { useEffect, useState } from "react";

/** 避免 SSR 与客户端 sessionStorage 等导致的水合不一致 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
