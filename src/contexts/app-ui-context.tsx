"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { I18nKey } from "@/lib/i18n";
import type { Lang, User } from "@/lib/types/v1";

/** 轻量 UI 上下文：顶栏/底栏/列表卡片用，避免 HMR 牵连整棵 app-context */
export type AppUiContextValue = {
  lang: Lang;
  tr: (key: I18nKey) => string;
  user: User | null;
  setLoginOpen: (v: boolean) => void;
  openQuotaModal: (detail?: { need: number; have: number }) => void;
  showToast: (msg: string) => void;
  pendingOrderCount: number;
};

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({
  value,
  children,
}: {
  value: AppUiContextValue;
  children: ReactNode;
}) {
  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi(): AppUiContextValue {
  const ctx = useContext(AppUiContext);
  if (!ctx) {
    throw new Error("useAppUi must be used within AppProvider");
  }
  return ctx;
}
