"use client";

import { FileText, Image, MessageCircle, Sparkles, Type } from "lucide-react";

const DELIVERABLES = [
  { icon: Type, label: "爆款标题", color: "text-[#FF4F8B]" },
  { icon: FileText, label: "口播脚本", color: "text-[#FF9A4D]" },
  { icon: Image, label: "封面文案", color: "text-violet-500" },
  { icon: MessageCircle, label: "首评引导", color: "text-sky-500" },
  { icon: Sparkles, label: "话题标签", color: "text-emerald-500" },
];

export function PublishPackValueBanner() {
  return (
    <div className="overflow-hidden rounded-[20px] bg-gradient-to-br from-[#FFF4F7] via-white to-[#FFF8F0] p-3.5 ring-1 ring-[#FFE8F0]">
      <p className="text-[13px] font-black text-[#1F2937]">选完 5 步，1 分钟拿到完整发布包</p>
      <p className="mt-0.5 text-[10px] text-[#8A94A6]">标题 + 脚本 + 封面 + 首评，直接复制就能发</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {DELIVERABLES.map((d) => {
          const Icon = d.icon;
          return (
            <span
              key={d.label}
              className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#5A6478] ring-1 ring-[#FFE8F0]"
            >
              <Icon size={11} className={d.color} />
              {d.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
