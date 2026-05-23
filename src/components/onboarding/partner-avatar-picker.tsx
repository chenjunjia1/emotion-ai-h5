"use client";

import { AI_PARTNER_AVATARS, type AiAvatarId } from "@/lib/onboarding/options";
import { PartnerAvatarImage } from "@/components/onboarding/partner-avatar-image";
import { cn } from "@/lib/utils";

export function PartnerAvatarPicker({
  value,
  onChange,
}: {
  value: AiAvatarId;
  onChange: (id: AiAvatarId) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {AI_PARTNER_AVATARS.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-1 py-2 transition-all duration-200",
              active ? "bg-[#FFF0F5]" : "hover:bg-slate-50/80"
            )}
            aria-label={item.name}
            aria-pressed={active}
          >
            <span
              className={cn(
                "relative h-[4.25rem] w-[4.25rem] overflow-hidden rounded-full bg-white shadow-md",
                active
                  ? "scale-105 ring-2 ring-offset-2 ring-offset-white"
                  : "opacity-90",
                active ? item.activeColor : "ring-transparent"
              )}
            >
              <PartnerAvatarImage id={item.id} sizes="96px" />
            </span>
            <span
              className={cn(
                "max-w-full truncate text-[9px] font-bold leading-tight",
                active ? "text-[#FF5C8A]" : "text-slate-500"
              )}
            >
              {item.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
