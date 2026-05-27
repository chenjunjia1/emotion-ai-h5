"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function LegalShell({
  title,
  subtitle,
  variant = "default",
  children,
}: {
  title: string;
  subtitle?: string;
  /** profile：柔和顶栏，适合资料编辑等表单页 */
  variant?: "default" | "profile";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isProfile = variant === "profile";

  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full max-w-[430px] pb-28",
        isProfile
          ? "bg-gradient-to-b from-[#FFF5F8] via-[#FFFBFC] to-[#FFF8F0]"
          : cn("bg-gradient-to-br", theme.bg)
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-40 px-4 backdrop-blur-md",
          isProfile
            ? "border-b border-[#FFE8F0]/60 bg-[#FFFBFC]/90 pb-3 pt-3"
            : cn("flex items-center gap-2 border-b bg-white/85 py-3", theme.border)
        )}
      >
        {isProfile ? (
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() =>
                window.history.length > 1 ? router.back() : router.push("/profile")
              }
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm ring-1 ring-[#FFE8F0] active:scale-95"
              aria-label="返回"
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="text-[17px] font-black leading-tight text-[#1F2937]">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-[11px] leading-relaxed text-[#9CA3AF]">{subtitle}</p>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                window.history.length > 1 ? router.back() : router.push("/profile")
              }
              className={cn("flex h-9 w-9 items-center justify-center rounded-xl", theme.softOrange)}
              aria-label="返回"
            >
              <ChevronLeft size={20} className="text-orange-600" />
            </button>
            <h1 className="text-base font-bold text-slate-900">{title}</h1>
          </>
        )}
      </header>
      <main className={cn("px-4", isProfile ? "pb-4 pt-3" : "py-4")}>{children}</main>
    </div>
  );
}
