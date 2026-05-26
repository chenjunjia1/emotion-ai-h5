"use client";

import { PlatformBrandIcon } from "@/components/v1/platform-brand-icon";
import { WIZARD_PLATFORMS } from "@/lib/publish-pack/moments-options";
import { cn } from "@/lib/utils";

/** 单行平台切换（不占独立步骤） */
export function PlatformCompactChips({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="shrink-0 text-[10px] font-bold text-[#8A94A6]">发布平台</span>
      {WIZARD_PLATFORMS.map((p) => {
        const active = value === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-black transition active:scale-[0.97]",
              active
                ? "bg-[#FFF0F5] text-[#FF4F8B] ring-2 ring-[#FF4F8B]/35"
                : "bg-white text-[#5A6478] ring-1 ring-[#FFE8F0]"
            )}
          >
            <PlatformBrandIcon platform={p.id} size={18} active={active} />
            {p.id}
          </button>
        );
      })}
    </div>
  );
}
