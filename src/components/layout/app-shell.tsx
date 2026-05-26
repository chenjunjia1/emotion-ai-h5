import type { ReactNode } from "react";
import { AppHeader } from "./app-header";
import { SiteFooter } from "./site-footer";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  showHeader = true,
  homePage = false,
  wide = false,
}: {
  children: ReactNode;
  showHeader?: boolean;
  /** 首页奶油粉渐变背景 */
  homePage?: boolean;
  /** 发布包工作室等宽屏双栏布局 */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full pb-28",
        wide ? "max-w-5xl" : "max-w-[430px]",
        homePage
          ? "bg-gradient-to-b from-[#FFF6FA] via-[#FFFBF8] to-[#FFF0F5]"
          : cn("bg-gradient-to-b", theme.bg),
        "md:my-4 md:min-h-[calc(100vh-2rem)] md:overflow-x-hidden md:overflow-y-auto md:rounded-[2rem] md:border md:border-orange-100/80 md:shadow-xl"
      )}
      style={homePage ? undefined : { backgroundColor: theme.pageBg }}
    >
      {showHeader ? <AppHeader homePage={homePage} /> : null}
      <main className={homePage ? "px-3.5 pb-2 pt-1" : "px-4 pb-2 pt-2"}>{children}</main>
      <SiteFooter />
    </div>
  );
}
