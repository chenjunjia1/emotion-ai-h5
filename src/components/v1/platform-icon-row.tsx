"use client";

import { PUBLISH_PLATFORM_VALUES } from "@/lib/i18n/publish-form-options";
import { PlatformBrandIcon, getPlatformBrand } from "@/components/v1/platform-brand-icon";
import { cn } from "@/lib/utils";

export function PlatformIconRow({
  value,
  onChange,
  step = 1,
  title = "选择平台",
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  title?: string;
  hint?: string;
}) {
  return (
    <section>
      <p className="mb-1 text-[12px] font-black text-[#1F2937]">
        <span className="mr-1 text-[#FF4F8B]">{step}.</span>
        {title}
      </p>
      {hint ? <p className="mb-2 text-[10px] text-[#8A94A6]">{hint}</p> : null}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {PUBLISH_PLATFORM_VALUES.map((p) => {
          const active = value === p;
          const brand = getPlatformBrand(p);
          return (
            <button
              key={p}
              type="button"
              onClick={() => onChange(p)}
              className={cn(
                "flex min-w-[72px] shrink-0 flex-col items-center gap-1.5 rounded-2xl px-2 py-2.5 transition active:scale-[0.97]",
                active
                  ? "bg-white ring-2 ring-[#FF4F8B] shadow-sm"
                  : "bg-white ring-1 ring-[#FFE8F0]"
              )}
            >
              <PlatformBrandIcon platform={p} size={48} />
              <span
                className={cn(
                  "text-[10px] font-black",
                  active ? "text-[#FF4F8B]" : "text-[#5A6478]"
                )}
              >
                {brand?.label ?? p}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
