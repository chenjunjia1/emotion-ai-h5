"use client";

import { Suspense } from "react";
import { ClientChrome } from "@/components/layout/client-chrome";
import { InviteCapture } from "@/components/invite-capture";
import { Providers } from "./providers";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Suspense fallback={null}>
        <InviteCapture />
      </Suspense>
      {children}
      <ClientChrome />
    </Providers>
  );
}
