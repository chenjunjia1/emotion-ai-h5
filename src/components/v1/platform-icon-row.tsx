"use client";

import { PLATFORM_EMOJI, PUBLISH_PLATFORM_VALUES } from "@/lib/i18n/publish-form-options";
import { cn } from "@/lib/utils";

export function PlatformIconRow({
  value,
  onChange,
  step = 1,
  title = "选择平台",
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  title?: string;
}) {
  return (
    <section>
      <p className="mb-2 text-[12px] font-black text-[#1F2937]">
        <span className="mr-1 text-[#FF4F8B]">{step}.</span>
        {title}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {PUBLISH_PLATFORM_VALUES.map((p) => {
          const active = value === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 transition active:scale-[0.98]",
                active
                  ? "bg-[#1F2937] text-white shadow-md"
                  : "bg-white text-[#5A6478] ring-1 ring-[#FFE8F0]"
              )}
            >
              <span className="text-lg">{PLATFORM_EMOJI[p] ?? "📱"}</span>
              <span className="text-[10px] font-bold">{p}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
