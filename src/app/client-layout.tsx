"use client";

import { Suspense } from "react";
import { ClientChrome } from "@/components/layout/client-chrome";
import { TreeholeRouteTransition } from "@/components/layout/treehole-route-transition";
import { HomeDataWarmup } from "@/components/home/home-data-warmup";
import { InviteCapture } from "@/components/invite-capture";
import { Providers } from "./providers";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <HomeDataWarmup />
      <Suspense fallback={null}>
        <InviteCapture />
      </Suspense>
      {children}
      <Suspense fallback={null}>
        <TreeholeRouteTransition />
      </Suspense>
      <ClientChrome />
    </Providers>
  );
}
