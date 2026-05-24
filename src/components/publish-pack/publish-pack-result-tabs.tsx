"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "title", label: "标题" },
  { id: "script", label: "脚本" },
  { id: "cover", label: "封面" },
  { id: "comment", label: "首评" },
  { id: "tags", label: "标签" },
  { id: "more", label: "更多" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PublishPackResultTabs({
  pack,
  onCopy,
}: {
  pack: Record<string, unknown>;
  onCopy: (text: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("title");
  const titles = (pack.titles as string[]) ?? [];
  const tags = (pack.tags as string[]) ?? [];
  const replies = (pack.commentReplies as string[]) ?? [];

  const tabContent: Record<TabId, { title: string; body: string }> = {
    title: {
      title: "推荐标题",
      body: [
        `【主推】${displayField(pack.recommendedTitle)}`,
        ...titles.map((t, i) => `${i + 1}. ${t}`),
      ].join("\n"),
    },
    script: {
      title: "30秒口播脚本",
      body: displayField(pack.script30s),
    },
    cover: {
      title: "封面文案",
      body: displayField(pack.coverCopy),
    },
    comment: {
      title: "首评 + 回复话术",
      body: [
        `【首评】${displayField(pack.firstComment)}`,
        ...replies.map((r, i) => `${i + 1}. ${r}`),
      ].join("\n"),
    },
    tags: {
      title: "推荐标签",
      body: tags.length ? tags.join(" ") : displayField(pack.xhsNote, "暂无标签，可在小红书笔记中补充 #话题"),
    },
    more: {
      title: "发布建议",
      body: [
        `发布时间：${displayField(pack.publishTime)}`,
        `发布技巧：${displayField(pack.publishTips)}`,
        pack.xhsNote ? `\n【小红书图文】\n${displayField(pack.xhsNote)}` : "",
        `\n安全分：${displayField(pack.safetyScore)} · ${displayField(pack.safetyLevel)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  };

  const current = tabContent[tab];

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-lg ring-1 ring-[#FFE8F0]">
      <div className="bg-gradient-to-r from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] px-4 py-3 text-white">
        <p className="text-[10px] font-bold text-white/90">✨ 完整发布包已就绪</p>
        <p className="mt-1 line-clamp-2 text-base font-black">{displayField(pack.recommendedTitle)}</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[#FFE8F0] px-2 py-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black transition",
              tab === t.id
                ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white"
                : "bg-[#FFF4F7] text-[#8A94A6]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-black text-[#FF4F8B]">{current.title}</p>
          <button
            type="button"
            onClick={() => onCopy(current.body)}
            className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] ring-1 ring-[#FF4F8B]/20"
          >
            <Copy size={12} />
            复制
          </button>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#1F2937]/85">
          {current.body}
        </pre>
      </div>
    </div>
  );
}
