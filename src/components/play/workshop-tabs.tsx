"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function WorkshopTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: {
    id: T;
    label: string;
    icon: LucideIcon;
    emoji?: string;
    href?: string;
  }[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="workshop-tabs mb-4 grid grid-cols-4 gap-1.5 rounded-[22px] bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] p-1.5 ring-1 ring-[#FF7AAE]/15">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "workshop-tab-item flex flex-col items-center gap-0.5 rounded-[18px] py-2.5 transition active:scale-95",
              isActive
                ? "bg-white text-[#FF5C8A] shadow-[0_4px_14px_rgba(255,107,107,0.2)]"
                : "text-slate-500"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl text-white transition",
                isActive
                  ? "bg-gradient-to-br from-[#FF6B6B] to-[#FF7AAE] play-icon-spark"
                  : "bg-slate-200/80 text-slate-500"
              )}
            >
              {t.emoji ? (
                <span className="text-base">{t.emoji}</span>
              ) : (
                <Icon size={16} strokeWidth={2.2} />
              )}
            </span>
            <span className="max-w-full truncate px-0.5 text-[9px] font-black leading-tight">
              {t.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
