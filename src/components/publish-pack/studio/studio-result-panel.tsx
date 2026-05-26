"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  ImageIcon,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import type { QuickPublishPackage, RestyleOption } from "@/lib/publish-pack/quick-package-types";
import { RESTYLE_OPTIONS, STUDIO_QUOTA } from "@/lib/publish-pack/studio-config";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { cn } from "@/lib/utils";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between text-[9px] font-bold text-[#5A6478]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[#FFE8F0]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] transition-all duration-700"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function StudioResultPanel({
  pkg,
  busy,
  favorites,
  onToggleFavorite,
  onRegenerate,
  onSave,
  onRegenImages,
  onRegenOneImage,
  onRestyle,
  onPremiumCover,
  onCopyAll,
  showToast,
}: {
  pkg: QuickPublishPackage;
  busy: boolean;
  favorites: Set<string>;
  onToggleFavorite: (id: string) => void;
  onRegenerate: () => void;
  onSave: () => void;
  onRegenImages: () => void;
  onRegenOneImage: (id: string, asCover?: boolean) => void;
  onRestyle: (style: RestyleOption) => void;
  onPremiumCover: () => void;
  onCopyAll: () => void;
  showToast: (msg: string) => void;
}) {
  const [bodyIdx, setBodyIdx] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const body = pkg.bodies[bodyIdx] ?? pkg.bodies[0];
  const cover = pkg.images.find((i) => i.role === "cover") ?? pkg.images[0];
  const gallery = pkg.images.filter((i) => i.role === "gallery");

  const copy = (text: string, msg = "已复制") => {
    void copyToClipboard(text);
    showToast(msg);
  };

  return (
    <div id="studio-pack-result" className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[16px] font-black text-[#1F2937]">生成结果</h2>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onRegenerate}
            className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
          >
            重新生成
          </button>
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-[#FFF0F5] px-3 py-1 text-[10px] font-bold text-[#FF4F8B]"
          >
            保存
          </button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[24px] bg-white p-4 ring-1 ring-inset ring-[#FFE8F0] shadow-sm">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-bold text-[#8A94A6]">爆款指数</p>
            <p className="text-[36px] font-black leading-none text-[#FF4F8B]">
              {pkg.viralScore.total}
              <span className="text-[14px]">分</span>
            </p>
          </div>
          <p className="text-[12px] text-[#FFC46B]">
            {"★".repeat(pkg.viralScore.stars)}
            {"☆".repeat(5 - pkg.viralScore.stars)}
          </p>
        </div>
        <div className="mt-3 space-y-2">
          <ScoreBar label="标题点击力" value={pkg.viralScore.titleClick} />
          <ScoreBar label="情绪共鸣力" value={pkg.viralScore.emotionResonance} />
          <ScoreBar label="评论互动力" value={pkg.viralScore.commentInteraction} />
          <ScoreBar label="平台匹配度" value={pkg.viralScore.platformMatch} />
          <ScoreBar label="发布时间匹配" value={pkg.viralScore.publishTimeMatch} />
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {pkg.viralScore.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-bold text-[#FF4F8B]"
            >
              {h}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] bg-white p-4 ring-1 ring-inset ring-[#FFE8F0]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-black">标题推荐（5）</p>
          <button
            type="button"
            onClick={onRegenerate}
            className="text-[10px] font-bold text-[#FF4F8B]"
          >
            换一批
          </button>
        </div>
        <ul className="space-y-2">
          {pkg.titles.map((t) => (
            <li
              key={t.id}
              className="flex items-start gap-2 rounded-xl bg-[#FFF8FB] p-2.5 ring-1 ring-inset ring-[#FFE8F0]"
            >
              <span className="text-sm">🔥</span>
              <p className="min-w-0 flex-1 text-[12px] font-bold text-[#1F2937]">{t.text}</p>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => copy(t.text)}
                  className="rounded-lg bg-white p-1.5 text-[#FF4F8B]"
                  aria-label="复制"
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(`title-${t.id}`)}
                  className={cn(
                    "rounded-lg p-1.5",
                    favorites.has(`title-${t.id}`) ? "text-[#FF4F8B]" : "text-[#B0B8C4]"
                  )}
                >
                  <Bookmark size={12} fill={favorites.has(`title-${t.id}`) ? "currentColor" : "none"} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-[22px] bg-white p-4 ring-1 ring-inset ring-[#FFE8F0]">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-black">配图推荐</p>
          <button
            type="button"
            disabled={busy}
            onClick={onRegenImages}
            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4F8B]"
          >
            <RefreshCw size={11} className={busy ? "animate-spin" : ""} />
            换一组（{STUDIO_QUOTA.regenImages} 灵感）
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {cover ? (
            <button
              type="button"
              onClick={() => setPreviewUrl(cover.url)}
              className="relative col-span-2 aspect-[4/5] overflow-hidden rounded-2xl ring-2 ring-[#FF4F8B]/30"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cover.url} alt={cover.alt ?? ""} className="h-full w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-md bg-[#FF4F8B] px-1.5 py-0.5 text-[9px] font-black text-white">
                封面图
              </span>
            </button>
          ) : null}
          {gallery.map((img) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setPreviewUrl(img.url)}
              className="relative aspect-square overflow-hidden rounded-xl ring-1 ring-inset ring-[#FFE8F0]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        {busy ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-[#FFE8F0]" />
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex flex-wrap gap-2">
          {cover ? (
            <button
              type="button"
              onClick={() => onRegenOneImage(cover.id, true)}
              className="text-[10px] font-bold text-[#8A94A6]"
            >
              封面换一张
            </button>
          ) : null}
        </div>
      </section>

      <section className="rounded-[22px] bg-white p-4 ring-1 ring-inset ring-[#FFE8F0]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-black">正文推荐（3）</p>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setBodyIdx((i) => Math.max(0, i - 1))}
              className="rounded-lg bg-[#FFF0F5] p-1"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() => setBodyIdx((i) => Math.min(pkg.bodies.length - 1, i + 1))}
              className="rounded-lg bg-[#FFF0F5] p-1"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
        {body ? (
          <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-[#374151]">
            {body.text}
          </p>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["改短一点", "更高级一点", "更口语一点"].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => onRestyle(label as RestyleOption)}
              className="rounded-full bg-[#FFF8FB] px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] ring-1 ring-inset ring-[#FFE8F0]"
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => body && copy(body.text)}
            className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
          >
            复制
          </button>
        </div>
      </section>

      <section className="rounded-[22px] bg-white p-4 ring-1 ring-inset ring-[#FFE8F0]">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[13px] font-black">标签推荐（10）</p>
          <button
            type="button"
            onClick={() => copy(pkg.tags.join(" "), "已复制全部标签")}
            className="text-[10px] font-bold text-[#FF4F8B]"
          >
            复制全部
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {pkg.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[10px] font-bold text-[#FF4F8B]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-[22px] bg-gradient-to-br from-[#FFF8FB] to-white p-4 ring-1 ring-inset ring-[#FFE8F0]">
        <p className="mb-2 text-[13px] font-black">发布建议</p>
        <ul className="space-y-1.5 text-[11px] text-[#5A6478]">
          <li>📱 推荐平台：{pkg.publishAdvice.platform}</li>
          <li>🕐 发布时间：{pkg.publishAdvice.bestTime}</li>
          <li>👥 适合人群：{pkg.publishAdvice.audience}</li>
          <li>💬 评论引导：{pkg.publishAdvice.commentHook}</li>
        </ul>
      </section>

      <section className="rounded-[22px] bg-white p-3 ring-1 ring-inset ring-[#FFE8F0]">
        <p className="mb-2 text-[11px] font-black text-[#8A94A6]">换个风格</p>
        <div className="flex flex-wrap gap-1">
          {RESTYLE_OPTIONS.map((opt) => (
            <button
              key={opt}
              type="button"
              disabled={busy}
              onClick={() => onRestyle(opt)}
              className="rounded-full bg-[#FFF8FB] px-2 py-1 text-[9px] font-bold text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
            >
              {opt}
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2 pb-4">
        <button
          type="button"
          onClick={onCopyAll}
          className="rounded-2xl bg-white py-3 text-[11px] font-black text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
        >
          复制全文
        </button>
        <button
          type="button"
          onClick={onSave}
          className="rounded-2xl bg-white py-3 text-[11px] font-black text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
        >
          保存发布包
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => onRestyle("更像小红书")}
          className="col-span-2 rounded-2xl bg-[#FFF0F5] py-3 text-[11px] font-black text-[#FF4F8B]"
        >
          换个风格
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={onPremiumCover}
          className="col-span-2 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-[12px] font-black text-white shadow-lg"
        >
          <ImageIcon size={16} />
          生成高级封面（{STUDIO_QUOTA.premiumCover} 灵感）
        </button>
        <Link
          href="/history?filter=pack"
          className="col-span-2 flex items-center justify-center gap-1 py-2 text-[10px] font-bold text-[#8A94A6]"
        >
          <Star size={12} />
          在「生成记录」查看已保存内容
        </Link>
      </div>

      {previewUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="button"
          tabIndex={0}
          onClick={() => setPreviewUrl(null)}
          onKeyDown={(e) => e.key === "Escape" && setPreviewUrl(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  );
}
