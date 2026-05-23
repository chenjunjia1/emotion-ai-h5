"use client";

import { cn } from "@/lib/utils";

export function OnboardingProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="flex flex-1 items-center">
          <div
            className={cn(
              "h-2 w-2 shrink-0 rounded-full transition-all",
              n <= step ? "bg-[#FF7AAE] shadow-[0_0_0_3px_rgba(255,122,174,0.25)]" : "bg-slate-200"
            )}
          />
          {i < 2 ? (
            <div
              className={cn(
                "mx-0.5 h-0.5 flex-1 rounded-full",
                n < step ? "bg-[#FF7AAE]/60" : "bg-slate-200"
              )}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
