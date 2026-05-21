import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-br pb-28",
        "md:my-4 md:min-h-[calc(100vh-2rem)] md:overflow-hidden md:rounded-[2rem] md:border md:shadow-xl",
        theme.bg,
        theme.border
      )}
    >
      <AppHeader />
      <main className="space-y-4 px-4 pt-3">{children}</main>
    </div>
  );
}
