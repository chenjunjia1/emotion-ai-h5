"use client";

import Link from "next/link";
import { Wand2 } from "lucide-react";
import { buildCreateHubHref } from "@/lib/inspiration/inspiration-create-bridge";

const STEPS = [
  { n: "1", label: "浏览灵感", desc: "挑结构 / 分类" },
  { n: "2", label: "点卡片生成", desc: "自动带入选题" },
  { n: "3", label: "创作页发布", desc: "改稿 · 出图 · 复制" },
] as const;

/** 灵感页：说明与创作中心的关联 */
export function InspirationCreateFlowStrip() {
  return (
    <div className="rounded-[16px] bg-gradient-to-br from-[#FFF8FC] via-white to-[#FFF5EB] p-2.5 ring-1 ring-[#FFE8F0]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-black text-[#1F2937]">灵感 → 创作 一条龙</p>
        <Link
          href={buildCreateHubHref({ from: "inspiration" })}
          className="flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_2px_10px_rgba(255,79,139,0.3)] active:scale-95"
        >
          <Wand2 size={12} />
          创作中心
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s.n} className="relative rounded-[12px] bg-white/90 px-2 py-1.5 text-center ring-1 ring-[#FFE8F0]/80">
            {i < STEPS.length - 1 ? (
              <span
                className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden text-[10px] text-[#FF9EC4] sm:block"
                aria-hidden
              >
                →
              </span>
            ) : null}
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#FFF0F5] text-[9px] font-black text-[#FF4F8B]">
              {s.n}
            </span>
            <p className="mt-0.5 text-[10px] font-black text-[#374151]">{s.label}</p>
            <p className="text-[8px] leading-tight text-[#9CA3AF]">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
