"use client";

import { usePathname } from "next/navigation";
import { AdminModeFab } from "@/components/admin/admin-mode-fab";
import { BottomNav } from "./bottom-nav";

export function ClientChrome() {
  const pathname = usePathname();
  const hideChrome =
    pathname.startsWith("/onboarding") || pathname.startsWith("/admin");

  if (hideChrome) return null;
  return (
    <>
      <BottomNav />
      <AdminModeFab />
    </>
  );
}
