"use client";

import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useApp } from "@/contexts/app-context";

export function AppToast() {
  const { toast } = useApp();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || !toast) return null;
  return createPortal(
    <div className="fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-2xl">
      {toast}
    </div>,
    document.body
  );
}
