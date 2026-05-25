"use client";

import { Bot, Copy } from "lucide-react";
import { BUDDY_ANSWER_PREVIEW } from "@/lib/operation-chat/buddy-prompts";

export function AiAssistantAnswerPreview() {
  return (
    <section className="overflow-hidden rounded-[22px] bg-gradient-to-b from-[#FFF8FB] to-white p-4 ring-1 ring-[#FFE8F0] shadow-[0_4px_20px_rgba(255,120,150,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-black text-[#1F2937]">回答长什么样？</p>
        <span className="rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[8px] font-black text-[#059669]">
          可复制直接用
        </span>
      </div>
      <p className="mt-0.5 text-[10px] text-[#8A94A6]">点场景后，你会拿到类似下面的结构化建议</p>

      <div className="mt-3 flex gap-2.5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md">
          <Bot size={18} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="rounded-2xl rounded-tl-md bg-white p-3 shadow-sm ring-1 ring-[#FFE8F0]">
            <p className="text-[9px] font-black text-[#FF4F8B]">顾问建议</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#374151] line-clamp-3">
              {BUDDY_ANSWER_PREVIEW.analysis}
            </p>
          </div>

          <div className="rounded-2xl bg-white/90 p-2.5 ring-1 ring-[#FFE8F0]">
            <p className="text-[9px] font-black text-[#FF4F8B]">标题参考 · 点一下复制</p>
            <ul className="mt-1.5 space-y-1">
              {BUDDY_ANSWER_PREVIEW.titles.slice(0, 2).map((t) => (
                <li
                  key={t}
                  className="flex items-start gap-1.5 rounded-lg bg-[#FFF8FB] px-2 py-1.5 text-[10px] font-medium text-[#374151]"
                >
                  <Copy size={10} className="mt-0.5 shrink-0 text-[#FF9A4D]" />
                  <span className="line-clamp-2">{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-1">
            {BUDDY_ANSWER_PREVIEW.topics.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-bold text-[#FF4F8B]"
              >
                {t.slice(0, 14)}…
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
