"use client";

import { cn } from "@/lib/utils";
import { EXTRA_NOTE_PRESETS } from "@/lib/publish-pack/extra-note-presets";

export function ExtraNoteHelper({
  value,
  onChange,
  step = 5,
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
}) {
  const togglePreset = (text: string) => {
    if (value.includes(text)) {
      onChange(value.replace(text, "").replace(/\n\n+/g, "\n").trim());
      return;
    }
    onChange(value ? `${value}\n${text}` : text);
  };

  return (
    <section>
      <p className="mb-1 text-[12px] font-black text-[#1F2937]">
        <span className="mr-1 text-[#FF4F8B]">{step}.</span>
        补充说明（选填）
      </p>
      <p className="mb-2 text-[10px] leading-relaxed text-[#8A94A6]">
        不懂怎么写？点下面场景卡片，AI 会按你的情况定制脚本
      </p>

      <div className="mb-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {EXTRA_NOTE_PRESETS.map((p) => {
          const on = value.includes(p.text) || value.includes(p.label);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => togglePreset(p.text)}
              className={cn(
                "rounded-xl px-2 py-2 text-left transition active:scale-[0.98]",
                on
                  ? "bg-[#FF4F8B] text-white shadow-sm ring-2 ring-[#FF4F8B]/30"
                  : "bg-[#FFF8FB] text-[#1F2937] ring-1 ring-[#FFE8F0] hover:ring-[#FFD0E8]"
              )}
            >
              <p className="text-[10px] font-black leading-tight">
                {on ? "✓ " : ""}
                {p.label}
              </p>
              <p
                className={cn(
                  "mt-0.5 line-clamp-2 text-[8px] leading-snug",
                  on ? "text-white/85" : "text-[#8A94A6]"
                )}
              >
                {p.desc}
              </p>
            </button>
          );
        })}
      </div>

      <textarea
        className="w-full resize-none rounded-2xl border-0 bg-white p-3 text-[12px] text-[#1F2937] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
        rows={3}
        maxLength={200}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="也可以自己写：比如粉丝数、拍摄场景、想要什么语气…"
      />
      <p className="mt-1 text-right text-[10px] text-[#8A94A6]">{value.length}/200</p>
    </section>
  );
}
