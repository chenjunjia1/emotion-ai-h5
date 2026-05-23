import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b pb-28",
        "md:my-4 md:min-h-[calc(100vh-2rem)] md:overflow-x-hidden md:overflow-y-auto md:rounded-[2rem] md:border md:border-orange-100/80 md:shadow-xl",
        theme.bg
      )}
      style={{ backgroundColor: theme.pageBg }}
    >
      <AppHeader />
      <main className="px-4 pb-2 pt-2">{children}</main>
    </div>
  );
}
