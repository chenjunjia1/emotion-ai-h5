"use client";

import { useState } from "react";
import { Copy, Heart, RefreshCw, Share2 } from "lucide-react";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "title", label: "标题" },
  { id: "script", label: "脚本" },
  { id: "cover", label: "封面" },
  { id: "comment", label: "首评" },
  { id: "publish", label: "发布文案" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PublishPackResultTabs({
  pack,
  onCopy,
  onShare,
  onRegen,
  busy,
  favorites,
  onToggleFavorite,
}: {
  pack: Record<string, unknown>;
  onCopy: (text: string) => void;
  onShare: () => void;
  onRegen: () => void;
  busy?: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  const [tab, setTab] = useState<TabId>("title");
  const titles = (pack.titles as string[]) ?? [];
  const tags = (pack.tags as string[]) ?? [];
  const replies = (pack.commentReplies as string[]) ?? [];

  const tabContent: Record<TabId, { title: string; body: string; favId: string }> = {
    title: {
      title: "推荐标题",
      body: [
        `【主推】${displayField(pack.recommendedTitle)}`,
        ...titles.map((t, i) => `${i + 1}. ${t}`),
      ].join("\n"),
      favId: "title",
    },
    script: {
      title: "30秒口播脚本",
      body: displayField(pack.script30s),
      favId: "script",
    },
    cover: {
      title: "封面文案",
      body: displayField(pack.coverCopy),
      favId: "cover",
    },
    comment: {
      title: "首评 + 回复话术",
      body: [
        `【首评】${displayField(pack.firstComment)}`,
        ...replies.map((r, i) => `${i + 1}. ${r}`),
      ].join("\n"),
      favId: "comment",
    },
    publish: {
      title: "发布文案",
      body: [
        displayField(pack.xhsNote, ""),
        tags.length ? `\n话题标签：${tags.join(" ")}` : "",
        pack.publishTime ? `\n发布时间：${displayField(pack.publishTime)}` : "",
        pack.publishTips ? `\n发布技巧：${displayField(pack.publishTips)}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      favId: "publish",
    },
  };

  const current = tabContent[tab];
  const favOn = favorites.has(current.favId);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-black text-[#1F2937]">生成结果</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={onRegen}
            className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#FF9A4D] ring-1 ring-[#FFE0C8] disabled:opacity-50"
          >
            <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
            重新生成
          </button>
          <button
            type="button"
            onClick={onShare}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
            aria-label="分享"
          >
            <Share2 size={14} />
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] bg-white shadow-lg ring-1 ring-[#FFE8F0]">
        <div className="bg-gradient-to-r from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] px-4 py-3 text-white">
          <p className="text-[10px] font-bold text-white/90">✨ 完整发布包已就绪</p>
          <p className="mt-1 line-clamp-2 text-base font-black">{displayField(pack.recommendedTitle)}</p>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-[#FFE8F0] px-2 py-2 scrollbar-none">
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
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[12px] font-black text-[#FF4F8B]">{current.title}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onCopy(current.body)}
                className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] ring-1 ring-[#FF4F8B]/20"
              >
                <Copy size={12} />
                复制
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(current.favId)}
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-full ring-1",
                  favOn
                    ? "bg-[#FF4F8B] text-white ring-[#FF4F8B]"
                    : "bg-white text-[#8A94A6] ring-[#FFE8F0]"
                )}
                aria-label="收藏"
              >
                <Heart size={12} fill={favOn ? "currentColor" : "none"} />
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onRegen}
                className="inline-flex items-center gap-1 rounded-full bg-[#FFF8F0] px-2.5 py-1 text-[10px] font-bold text-[#FF9A4D] ring-1 ring-[#FFE0C8] disabled:opacity-50"
              >
                <RefreshCw size={11} />
                换一版
              </button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#1F2937]/85">
            {current.body}
          </pre>
        </div>
      </div>
    </section>
  );
}
