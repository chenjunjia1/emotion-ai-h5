"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function MultiSelectCardGrid({
  title,
  subtitle,
  options,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  options: readonly { id: string; desc?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  return (
    <section>
      {title ? <p className="text-[13px] font-black text-[#1F2937]">{title}</p> : null}
      {subtitle ? <p className="mt-1 text-[10px] text-[#8A94A6]">{subtitle}</p> : null}
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        {options.map((o) => {
          const active = value.includes(o.id);
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => toggle(o.id)}
              className={cn(
                "relative rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.98]",
                active ? "bg-[#FFF0F5] ring-2 ring-[#FF4F8B]/40" : "bg-white ring-1 ring-[#FFE8F0]"
              )}
            >
              {active ? (
                <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4F8B] text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              ) : null}
              <p className="text-[11px] font-black text-[#1F2937]">{o.id}</p>
              {o.desc ? <p className="mt-0.5 text-[9px] text-[#8A94A6]">{o.desc}</p> : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
