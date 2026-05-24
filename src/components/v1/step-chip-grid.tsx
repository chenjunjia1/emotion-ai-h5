"use client";

import { cn } from "@/lib/utils";

export function StepChipGrid({
  step,
  title,
  options,
  value,
  onChange,
  columns = 4,
}: {
  step: number;
  title: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  columns?: 3 | 4;
}) {
  return (
    <section>
      <p className="mb-2 text-[12px] font-black text-[#1F2937]">
        <span className="mr-1 text-[#FF4F8B]">{step}.</span>
        {title}
      </p>
      <div className={cn("grid gap-2", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn(
                "rounded-xl px-1 py-2 text-center text-[10px] font-bold transition active:scale-[0.98]",
                active
                  ? "bg-[#FFF0F5] text-[#FF4F8B] ring-2 ring-[#FF4F8B]/40"
                  : "bg-white text-[#5A6478] ring-1 ring-[#FFE8F0]"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </section>
  );
}
