"use client";

import { Check } from "lucide-react";
import { PlatformBrandIcon } from "@/components/v1/platform-brand-icon";
import { WIZARD_PLATFORMS } from "@/lib/publish-pack/moments-options";
import { cn } from "@/lib/utils";

const ICON_SIZE = 40;

export function PlatformSelectGrid({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <section>
      <p className="text-[13px] font-black text-[#1F2937]">选择发布平台</p>
      <p className="mt-0.5 text-[10px] leading-snug text-[#8A94A6]">
        官方标识风格 · AI 按平台规则生成
      </p>

      <div className="mt-2.5 grid grid-cols-3 gap-2">
        {WIZARD_PLATFORMS.map((p) => {
          const active = value === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onChange(p.id)}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl bg-white px-1 py-2 transition active:scale-[0.97]",
                active
                  ? "ring-2 ring-[#FF4F8B] shadow-sm"
                  : "ring-1 ring-[#F0F0F0] shadow-[0_1px_6px_rgba(0,0,0,0.04)] hover:ring-[#FFD0E8]"
              )}
            >
              {active ? (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4F8B] text-white">
                  <Check size={9} strokeWidth={3} />
                </span>
              ) : null}

              <PlatformBrandIcon platform={p.id} size={ICON_SIZE} active={active} />

              <span className="max-w-full truncate text-center text-[11px] font-black leading-tight text-[#1F2937]">
                {p.id}
              </span>
              <span className="max-w-full truncate px-0.5 text-center text-[8px] leading-tight text-[#9CA3AF]">
                {p.desc}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
