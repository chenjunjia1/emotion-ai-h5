"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./bottom-nav";

export function ClientChrome() {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith("/onboarding");

  if (hideChrome) return null;
  return <BottomNav />;
}
