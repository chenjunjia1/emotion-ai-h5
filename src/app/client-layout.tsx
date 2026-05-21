"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { Providers } from "./providers";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      {children}
      <BottomNav />
    </Providers>
  );
}
