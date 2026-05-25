"use client";

import { useMemo, useState } from "react";
import { Copy, Heart, RefreshCw, Share2 } from "lucide-react";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { MOMENTS_COPY_FILTERS } from "@/lib/publish-pack/moments-options";
import type {
  MomentsCommentReply,
  MomentsCopyItem,
  MomentsGridSlot,
  MomentsImageSuggestion,
  MomentsPublishTime,
} from "@/lib/publish-pack/moments-result";
import { cn } from "@/lib/utils";

const MAIN_TABS = [
  { id: "title", label: "标题" },
  { id: "script", label: "脚本" },
  { id: "cover", label: "封面" },
  { id: "comment", label: "首评" },
  { id: "moments", label: "朋友圈" },
] as const;

const MOMENTS_SUB_TABS = [
  { id: "copy", label: "文案" },
  { id: "images", label: "配图建议" },
  { id: "grid", label: "九宫格" },
  { id: "emoji", label: "表情优化" },
] as const;

type MainTab = (typeof MAIN_TABS)[number]["id"];
type SubTab = (typeof MOMENTS_SUB_TABS)[number]["id"];

export function MomentsResultView({
  pack,
  onCopy,
  onSave,
  onRegenOne,
  onRegenAll,
  onCopyAll,
  onShare,
  busy,
  favorites,
  onToggleFavorite,
}: {
  pack: Record<string, unknown>;
  onCopy: (text: string, isMomentsCopy?: boolean) => void;
  onSave: () => void;
  onRegenOne: (copyId: string) => void;
  onRegenAll: () => void;
  onCopyAll: () => void;
  onShare: () => void;
  busy?: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
}) {
  const [mainTab, setMainTab] = useState<MainTab>("moments");
  const [subTab, setSubTab] = useState<SubTab>("copy");
  const [filter, setFilter] = useState<string>("全部");

  const copies = (pack.momentsCopies as MomentsCopyItem[]) ?? [];
  const images = (pack.imageSuggestions as MomentsImageSuggestion[]) ?? [];
  const grid = (pack.gridSuggestions as MomentsGridSlot[]) ?? [];
  const emoji = pack.emojiVersions as { simple: string; cute: string; premium: string } | undefined;
  const replies = (pack.commentReplies as MomentsCommentReply[]) ?? [];
  const publishTime = pack.publishTime as MomentsPublishTime | undefined;

  const filteredCopies = useMemo(() => {
    if (filter === "全部") return copies;
    return copies.filter((c) => c.category === filter);
  }, [copies, filter]);

  const standardBody: Record<Exclude<MainTab, "moments">, string> = {
    title: displayField(pack.recommendedTitle),
    script: displayField(pack.script30s, "短视频脚本见发布包其他平台生成"),
    cover: displayField(pack.coverCopy),
    comment: displayField(pack.firstComment),
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-black text-[#1F2937]">生成结果</p>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={busy}
            onClick={onRegenAll}
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

      <div className="overflow-hidden rounded-[24px] bg-white ring-1 ring-[#FFE8F0]">
        <div className="flex gap-1 overflow-x-auto border-b border-[#FFE8F0] px-2 py-2 scrollbar-none">
          {MAIN_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMainTab(t.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[11px] font-black",
                mainTab === t.id
                  ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white"
                  : "bg-[#FFF4F7] text-[#8A94A6]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {mainTab !== "moments" ? (
            <div>
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onCopy(standardBody[mainTab])}
                  className="inline-flex items-center gap-1 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B]"
                >
                  <Copy size={11} /> 复制
                </button>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#1F2937]">
                {standardBody[mainTab]}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-[13px] font-black text-[#1F2937]">朋友圈文案</p>
                <p className="text-[10px] text-[#8A94A6]">为你生成多种朋友圈文案，挑选最适合的发布</p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {MOMENTS_COPY_FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold ring-1",
                      filter === f
                        ? "bg-[#FF4F8B] text-white ring-[#FF4F8B]"
                        : "bg-white text-[#5A6478] ring-[#FFE8F0]"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {MOMENTS_SUB_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSubTab(t.id)}
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold",
                      subTab === t.id
                        ? "bg-[#FFF0F5] text-[#FF4F8B] ring-1 ring-[#FF4F8B]/30"
                        : "text-[#8A94A6]"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {subTab === "copy" ? (
                <div className="space-y-3">
                  {filteredCopies.map((c, i) => (
                    <article
                      key={c.id}
                      className="rounded-2xl bg-[#FFF8FB] p-3 ring-1 ring-[#FFE8F0]"
                    >
                      <p className="text-[11px] font-black text-[#FF4F8B]">
                        文案 {i + 1}（{c.label}）
                      </p>
                      <pre className="mt-2 whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#1F2937]">
                        {c.content}
                      </pre>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => onCopy(c.content, true)}
                          className="flex min-w-[calc(50%-4px)] flex-1 items-center justify-center gap-1 rounded-xl bg-white py-2 text-[10px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
                        >
                          <Copy size={11} /> 复制文案
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onCopy(c.content, true);
                            window.setTimeout(() => {
                              window.location.href = "weixin://";
                            }, 400);
                          }}
                          className="flex min-w-[calc(50%-4px)] flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2 text-[10px] font-bold text-white"
                        >
                          去朋友圈
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => onRegenOne(c.id)}
                          className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-white py-2 text-[10px] font-bold text-[#FF9A4D] ring-1 ring-[#FFE0C8] disabled:opacity-50"
                        >
                          <RefreshCw size={11} /> 换一条
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleFavorite(c.id)}
                          className={cn(
                            "flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[10px] font-bold ring-1",
                            favorites.has(c.id)
                              ? "bg-[#FF4F8B] text-white ring-[#FF4F8B]"
                              : "bg-white text-[#5A6478] ring-[#FFE8F0]"
                          )}
                        >
                          <Heart size={11} fill={favorites.has(c.id) ? "currentColor" : "none"} />
                          收藏
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}

              {subTab === "images" ? (
                <div className="space-y-3">
                  <p className="text-[12px] font-black text-[#1F2937]">配图建议</p>
                  {images.map((g) => (
                    <div key={g.category} className="rounded-2xl bg-[#FFF8FB] p-3 ring-1 ring-[#FFE8F0]">
                      <p className="text-[11px] font-black text-[#FF4F8B]">{g.category}</p>
                      <p className="mt-1 text-[11px] text-[#1F2937]">适合场景：{g.scene}</p>
                      <p className="mt-1 text-[11px] text-[#1F2937]">图片风格：{g.style}</p>
                      <p className="mt-1 text-[11px] text-[#8A94A6]">配图关键词：{g.keywords}</p>
                    </div>
                  ))}
                </div>
              ) : null}

              {subTab === "grid" ? (
                <div className="space-y-2">
                  <p className="text-[12px] font-black text-[#1F2937]">九宫格建议</p>
                  {grid.map((g) => (
                    <div key={g.slot} className="flex gap-2 rounded-xl bg-[#FFF8FB] p-2.5 ring-1 ring-[#FFE8F0]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#FF4F8B] text-[10px] font-black text-white">
                        {g.slot}
                      </span>
                      <div>
                        <p className="text-[11px] font-black text-[#1F2937]">{g.title}</p>
                        <p className="text-[10px] text-[#8A94A6]">{g.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {subTab === "emoji" && emoji ? (
                <div className="space-y-3">
                  <p className="text-[12px] font-black text-[#1F2937]">表情优化</p>
                  {(
                    [
                      ["简洁版", emoji.simple],
                      ["可爱版", emoji.cute],
                      ["高级感版", emoji.premium],
                    ] as const
                  ).map(([label, text]) => (
                    <div key={label} className="rounded-2xl bg-[#FFF8FB] p-3 ring-1 ring-[#FFE8F0]">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[11px] font-black text-[#FF4F8B]">{label}</p>
                        <button
                          type="button"
                          onClick={() => onCopy(text)}
                          className="text-[10px] font-bold text-[#FF4F8B]"
                        >
                          复制
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#1F2937]">
                        {text}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : null}

              {replies.length > 0 ? (
                <section className="rounded-2xl bg-white p-3 ring-1 ring-[#FFE8F0]">
                  <p className="text-[12px] font-black text-[#1F2937]">
                    评论互动回复（{replies.length}条）
                  </p>
                  <div className="mt-2 space-y-2">
                    {replies.map((r, i) => (
                      <div key={i} className="rounded-xl bg-[#F9FAFB] p-2.5">
                        <p className="text-[10px] text-[#8A94A6]">{r.comment}</p>
                        <p className="mt-1 text-[11px] font-bold text-[#1F2937]">回复：{r.reply}</p>
                        <button
                          type="button"
                          onClick={() => onCopy(`回复：${r.reply}`)}
                          className="mt-1 text-[10px] font-bold text-[#FF4F8B]"
                        >
                          复制回复
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {publishTime ? (
                <section className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-white p-3 ring-1 ring-[#FFE8F0]">
                  <p className="text-[12px] font-black text-[#1F2937]">发布时间建议</p>
                  <p className="mt-1 text-[14px] font-black text-[#FF4F8B]">{publishTime.recommended}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#5A6478]">{publishTime.reason}</p>
                  <div className="mt-2 space-y-1.5">
                    {publishTime.otherSlots.map((s) => (
                      <p key={s.time} className="text-[10px] text-[#8A94A6]">
                        <span className="font-bold text-[#1F2937]">{s.time}</span> — {s.suitable}
                      </p>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 mx-auto max-w-lg px-4">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-[#FFE8F0] backdrop-blur">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl bg-white py-3 text-[12px] font-black text-[#5A6478] ring-1 ring-[#FFE8F0]"
          >
            保存到素材库
          </button>
          <button
            type="button"
            onClick={onCopyAll}
            className="rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3 text-[12px] font-black text-white"
          >
            复制全部文案
          </button>
        </div>
      </div>
    </section>
  );
}
