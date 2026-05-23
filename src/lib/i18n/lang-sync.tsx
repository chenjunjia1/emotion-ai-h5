"use client";

import { useEffect } from "react";
import { useApp } from "@/contexts/app-context";

export function LangHtmlSync() {
  const { lang } = useApp();

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  return null;
}
