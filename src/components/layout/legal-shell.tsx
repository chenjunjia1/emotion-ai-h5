"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div
      className={cn(
        "mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-br pb-28",
        theme.bg
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-40 flex items-center gap-2 border-b bg-white/85 px-4 py-3 backdrop-blur-md",
          theme.border
        )}
      >
        <button
          type="button"
          onClick={() => (window.history.length > 1 ? router.back() : router.push("/profile"))}
          className={cn("flex h-9 w-9 items-center justify-center rounded-xl", theme.softOrange)}
          aria-label="返回"
        >
          <ChevronLeft size={20} className="text-orange-600" />
        </button>
        <h1 className="text-base font-bold text-slate-900">{title}</h1>
      </header>
      <main className="px-4 py-4">{children}</main>
    </div>
  );
}
