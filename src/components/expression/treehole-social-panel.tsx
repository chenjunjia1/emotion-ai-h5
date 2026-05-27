"use client";

import { Copy, Sparkles } from "lucide-react";
import type { TreeholeMomentsVariant } from "@/lib/mock/emotion-treehole";
import { cn } from "@/lib/utils";

const VARIANT_STYLE: Record<
  TreeholeMomentsVariant["id"],
  { emoji: string; chip: string; nightChip: string }
> = {
  light: {
    emoji: "🌬️",
    chip: "bg-slate-100 text-slate-600",
    nightChip: "bg-white/10 text-white/70",
  },
  gentle: {
    emoji: "🌸",
    chip: "bg-[#FFF0F5] text-[#FF4F8B]",
    nightChip: "bg-[#FF4F8B]/20 text-[#FF9EC4]",
  },
  xhs: {
    emoji: "📕",
    chip: "bg-[#FFF1F2] text-[#E11D48]",
    nightChip: "bg-rose-500/15 text-rose-200",
  },
};

type Props = {
  variants: TreeholeMomentsVariant[];
  xhsCopy: string;
  night?: boolean;
  onCopy: (text: string, label: string) => void;
};

export function TreeholeSocialPanel({ variants, xhsCopy, night, onCopy }: Props) {
  return (
    <section className="treehole-social-panel mb-3">
      <div className="mb-2.5 flex items-end justify-between gap-2 px-0.5">
        <div>
          <p className="th-title flex items-center gap-1 text-[12px] font-black">
            <Sparkles size={13} className="text-[#FF9EC4]" />
            说漂亮话发圈
          </p>
          <p className="th-muted mt-0.5 text-[10px]">三种 vibe · 点一下就复制</p>
        </div>
      </div>

      <div className="space-y-2">
        {variants.map((v) => {
          const style = VARIANT_STYLE[v.id];
          return (
            <div
              key={v.id}
              className={cn(
                "treehole-copy-card flex items-start gap-2.5 rounded-2xl p-3 transition active:scale-[0.99]",
                night
                  ? "bg-white/[0.06] ring-1 ring-white/10 backdrop-blur-sm"
                  : "bg-white shadow-[0_4px_16px_rgba(255,100,140,0.08)] ring-1 ring-[#FFE8F0]"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg",
                  night ? style.nightChip : style.chip
                )}
              >
                {style.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-[10px] font-black",
                    night ? "text-white/55" : "text-[#9CA3AF]"
                  )}
                >
                  {v.label}
                </p>
                <p className="th-body mt-1 text-[12px] leading-relaxed">{v.text}</p>
              </div>
              <button
                type="button"
                onClick={() => onCopy(v.text, v.label)}
                className={cn(
                  "mt-0.5 shrink-0 rounded-full px-2.5 py-1.5 text-[10px] font-black active:scale-95",
                  night
                    ? "bg-[#FF4F8B]/25 text-[#FF9EC4] ring-1 ring-[#FF4F8B]/30"
                    : "bg-[#FFF0F5] text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
                )}
              >
                复制
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-2.5 flex gap-2">
        <button
          type="button"
          onClick={() => onCopy(xhsCopy, "小红书")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 rounded-2xl py-2.5 text-[11px] font-black active:scale-[0.98]",
            night
              ? "bg-white/10 text-white ring-1 ring-white/15"
              : "bg-white text-[#E11D48] ring-1 ring-[#FFE8F0] shadow-sm"
          )}
        >
          <Copy size={12} />
          复制小红书笔记
        </button>
      </div>
    </section>
  );
}
