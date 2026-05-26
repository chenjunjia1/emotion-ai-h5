"use client";

import { cn } from "@/lib/utils";
import { WIZARD_STEPS } from "@/lib/publish-pack/moments-options";

export function WizardStepBar({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center justify-center gap-1 px-2 py-3">
      {WIZARD_STEPS.map((label, i) => {
        const step = (i + 1) as 1 | 2;
        const active = current === step;
        const done = current > step;
        return (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-0.5">
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black",
                  active
                    ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm"
                    : done
                      ? "bg-[#FFF0F5] text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
                      : "bg-[#F3F4F6] text-[#8A94A6]"
                )}
              >
                {done ? "✓" : step}
              </span>
              <span
                className={cn(
                  "max-w-[52px] text-center text-[9px] font-bold leading-tight",
                  active ? "text-[#FF4F8B]" : "text-[#8A94A6]"
                )}
              >
                {label}
              </span>
            </div>
            {i < WIZARD_STEPS.length - 1 ? (
              <div
                className={cn(
                  "mb-3 h-0.5 w-4 shrink-0 rounded-full",
                  done ? "bg-[#FF4F8B]/40" : "bg-[#E5E7EB]"
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
