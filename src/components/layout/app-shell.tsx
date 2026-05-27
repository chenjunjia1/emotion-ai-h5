import type { ReactNode } from "react";
import { Suspense } from "react";
import { AppHeader } from "./app-header";
import { SiteFooter } from "./site-footer";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function AppShell({
  children,
  showHeader = true,
  homePage = false,
  treeholeDark = false,
  wide = false,
}: {
  children: ReactNode;
  showHeader?: boolean;
  /** 首页奶油粉渐变背景 */
  homePage?: boolean;
  /** 情绪树洞 · 深夜模式外壳 */
  treeholeDark?: boolean;
  /** 发布包工作室等宽屏双栏布局 */
  wide?: boolean;
}) {
  const shell = (
    <div
      className={cn(
        "mx-auto min-h-screen w-full pb-28",
        wide ? "max-w-5xl" : "max-w-[430px]",
        treeholeDark
          ? "treehole-shell-dark bg-[#0a0618]"
          : homePage
            ? "home-shell-bg"
            : cn("bg-gradient-to-b", theme.bg),
        treeholeDark
          ? "md:my-0 md:min-h-screen md:overflow-x-hidden md:overflow-y-auto md:rounded-none md:border-0 md:shadow-none"
          : "md:my-4 md:min-h-[calc(100vh-2rem)] md:overflow-x-hidden md:overflow-y-auto md:rounded-[2rem] md:border md:border-orange-100/80 md:shadow-xl"
      )}
      style={homePage || treeholeDark ? undefined : { backgroundColor: theme.pageBg }}
    >
      {showHeader ? (
        <Suspense fallback={<div className="h-[52px] shrink-0" aria-hidden />}>
          <AppHeader homePage={homePage} />
        </Suspense>
      ) : null}
      <main
        className={cn(
          treeholeDark ? "px-0 pb-0 pt-0" : homePage ? "px-3.5 pb-2 pt-0.5" : "px-4 pb-2 pt-2"
        )}
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );

  if (treeholeDark) {
    return <div className="treehole-viewport-wrap min-h-screen w-full treehole-shell-dark">{shell}</div>;
  }

  return shell;
}
