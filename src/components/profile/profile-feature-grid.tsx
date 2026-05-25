"use client";

import Link from "next/link";
import { FileText, Gift, History, Sparkles } from "lucide-react";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const QUICK: {
  href: string;
  labelKey: I18nKey;
  icon: typeof History;
  tint: string;
}[] = [
  { href: "/history", labelKey: "profileMenuLibrary", icon: History, tint: "from-[#FFE8F0] to-[#FFF8FB]" },
  { href: "/history?filter=pack", labelKey: "profileFeatHistory", icon: FileText, tint: "from-[#FFF3E8] to-[#FFFBF5]" },
  { href: "/review", labelKey: "profileFeatReview", icon: Sparkles, tint: "from-[#F3EEFF] to-[#FBF8FF]" },
  { href: "/invite", labelKey: "profileQuickInvite", icon: Gift, tint: "from-[#E8FFF3] to-[#F5FFFA]" },
];

/** 我的 — 2×2 快捷入口 */
export function ProfileFeatureGrid({ tr }: { tr: (key: I18nKey) => string }) {
  return (
    <section>
      <p className="mb-2 px-0.5 text-[11px] font-black text-[#8A94A6]">{tr("profileMenuTitle")}</p>
      <div className="grid grid-cols-2 gap-2.5">
        {QUICK.map(({ href, labelKey, icon: Icon, tint }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-start gap-2 rounded-[18px] bg-gradient-to-br p-3.5",
              "ring-1 ring-[#FFE8F0] shadow-sm active:scale-[0.97]",
              tint
            )}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
              <Icon size={18} className="text-[#FF4F8B]" strokeWidth={2.2} />
            </span>
            <span className="text-[12px] font-black leading-tight text-[#1F2937]">
              {tr(labelKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
