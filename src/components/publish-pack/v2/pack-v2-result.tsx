"use client";

import { useState } from "react";
import {
  Camera,
  Check,
  Clock,
  Copy,
  Heart,
  Loader2,
  MessageCircle,
  RefreshCcw,
  Share2,
} from "lucide-react";
import type { RestyleOption } from "@/lib/publish-pack/quick-package-types";
import { getAdvancedPackCostPoints, PACK_PRICING } from "@/lib/publish-pack/quota-display";
import { PackImageCard, PackImageLightbox } from "@/components/publish-pack/v2/pack-image-lightbox";
import { IMAGE_COUNT_OPTIONS } from "@/lib/publish-pack/pack-inspiration";
import { getUpgradeDiff } from "@/lib/publish-pack/pack-pricing";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type { QuickPublishPackage } from "@/lib/publish-pack/quick-package-types";
import { applyProDiscountPrice } from "@/services/pricingService";
import type { PlanType } from "@/lib/types/v1";

export function PackV2LoadingSteps({ mode }: { mode: "quick" | "advanced" }) {
  const steps =
    mode === "quick"
      ? [
          "正在理解你的主题",
          "正在匹配适合平台",
          "正在生成标题和正文",
          "正在整理发布建议",
        ]
      : [
          "正在理解你的主题",
          "正在匹配适合平台",
          "文案与配图同时生成中…",
          "真实感图片约 30–60 秒，请稍候",
          "正在整理发布建议",
        ];

  return (
    <div className="space-y-3 rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
      {steps.map((s, i) => (
        <div
          key={s}
          className="flex items-center gap-3 rounded-2xl bg-[#fff8f1] p-3 animate-in fade-in slide-in-from-left-2"
          style={{ animationDelay: `${i * 120}ms` }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-xs font-black text-white">
            <Check size={15} />
          </div>
          <span className="text-sm font-bold">{s}</span>
        </div>
      ))}
    </div>
  );
}

export function PackV2Result({
  pkg,
  mode,
  imageCount,
  plan,
  favorites,
  isPro,
  onCopy,
  onFavorite,
  onUpgrade,
  onPay,
  onSwitchAdvanced,
  onRestyle,
  onRegenImage,
  onShare,
  onToast,
  actionBusy,
}: {
  pkg: QuickPublishPackage;
  mode: "quick" | "advanced";
  imageCount: ImageCountOption;
  plan: PlanType;
  favorites: Set<string>;
  isPro: boolean;
  onCopy: (text: string, msg?: string) => void;
  onFavorite: (id: string) => void;
  onUpgrade: (target: ImageCountOption) => void;
  onPay: (kind: "watermark" | "upgrade") => void;
  onSwitchAdvanced: (count: ImageCountOption) => void;
  onRestyle?: (bodyId: string, style: RestyleOption) => void;
  onRegenImage?: (imageId: string, asCover: boolean) => void;
  onShare?: () => void;
  onToast?: (msg: string) => void;
  actionBusy?: boolean;
}) {
  const copyAllPack = () => {
    const title = pkg.titles[0]?.text ?? pkg.topic;
    const body = pkg.bodies[0]?.text ?? "";
    const text = [title, "", body, "", pkg.tags.join(" ")].filter(Boolean).join("\n");
    onCopy(text, "已复制标题+正文+标签");
  };

  const [lightbox, setLightbox] = useState<{
    src: string;
    alt: string;
    label: string;
  } | null>(null);

  const advanced = mode === "advanced";
  const vs = pkg.viralScore;
  const rows = advanced
    ? [
        ["标题点击力", vs.titleClick],
        ["情绪共鸣力", vs.emotionResonance],
        ["评论互动", vs.commentInteraction],
        ["平台匹配", vs.platformMatch],
        ["发布时间", vs.publishTimeMatch],
      ]
    : [
        ["标题点击力", vs.titleClick],
        ["情绪共鸣", vs.emotionResonance],
        ["发布时间", vs.publishTimeMatch],
      ];

  const displayImages = pkg.images.slice(0, imageCount);
  const upgradeDiff = (target: ImageCountOption) =>
    applyProDiscountPrice(getUpgradeDiff(imageCount, target), plan);

  return (
    <div className="space-y-4 pb-28">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyAllPack}
          className="inline-flex items-center gap-1 rounded-full bg-pink-500 px-4 py-2 text-xs font-black text-white shadow-sm"
        >
          <Copy size={14} />
          复制全部（标题+正文+标签）
        </button>
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-white px-4 py-2 text-xs font-black text-pink-500"
          >
            <Share2 size={14} />
            生成分享海报
          </button>
        ) : null}
      </div>

      <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-slate-400">
              {advanced ? "完整爆款指数" : "基础爆款指数"}
            </div>
            <div className="mt-1 text-5xl font-black text-pink-500">
              {vs.total}
              <span className="text-base">分</span>
            </div>
          </div>
          <div className="rounded-2xl bg-orange-50 p-3 text-xs font-bold leading-6 text-orange-500">
            {vs.highlights.map((h) => (
              <span key={h} className="block">
                {h}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {rows.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1 flex justify-between text-xs font-bold">
                <span>{label}</span>
                <span>{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-pink-50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-700"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black">标题推荐</h3>
          <button
            type="button"
            className="flex items-center gap-1 text-sm font-black text-pink-500"
            onClick={() => onCopy(pkg.titles.map((t) => t.text).join("\n"), "已换一批标题")}
          >
            <RefreshCcw size={14} />
            换一批
          </button>
        </div>
        {pkg.titles.map((t, i) => (
          <div
            key={t.id}
            className="flex items-center gap-2 border-t border-pink-50 py-3 first:border-t-0"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-black text-pink-500">
              {i + 1}
            </span>
            <span className="flex-1 text-sm font-bold">{t.text}</span>
            <button type="button" onClick={() => onCopy(t.text, "已复制标题")}>
              <Copy size={16} className="text-pink-500" />
            </button>
            <button type="button" onClick={() => onFavorite(`title-${t.id}`)}>
              <Heart
                size={16}
                className={favorites.has(`title-${t.id}`) ? "fill-pink-500 text-pink-500" : "text-slate-300"}
              />
            </button>
          </div>
        ))}
      </section>

      {advanced && displayImages.length > 0 && (
        <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-black">
              <Camera className="text-pink-500" size={20} />
              高级真实感图片
            </h3>
            <button
              type="button"
              onClick={onPay.bind(null, "upgrade")}
              className="rounded-full bg-orange-50 px-3 py-2 text-xs font-black text-orange-500"
            >
              换一张 · 20灵感
            </button>
          </div>
          <p className="mb-3 text-xs text-slate-400">点击缩略图可放大查看完整图片</p>
          <div
            className={`grid gap-2.5 ${
              imageCount === 1 ? "grid-cols-1" : imageCount === 4 ? "grid-cols-2" : "grid-cols-2"
            }`}
          >
            {displayImages.map((img, i) => {
              const isCover = i === 0;
              const label = isCover ? "封面图" : `配图${i}`;

              return (
                <div
                  key={img.id}
                  className={isCover && imageCount === 4 ? "col-span-2" : undefined}
                >
                  <PackImageCard
                    src={img.url}
                    alt={img.alt ?? pkg.topic}
                    label={label}
                    tall={isCover && imageCount === 4}
                    onOpen={() =>
                      setLightbox({ src: img.url, alt: img.alt ?? pkg.topic, label })
                    }
                  />
                  {onRegenImage ? (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={() => onRegenImage(img.id, isCover)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-full bg-pink-50 py-2 text-xs font-black text-pink-500 disabled:opacity-50"
                    >
                      {actionBusy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <RefreshCcw size={12} />
                      )}
                      换一张（{PACK_PRICING.extra.regenImage} 灵感）
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div className="mt-3 rounded-2xl bg-pink-50/80 px-3 py-2.5 text-sm">
            <span className="text-xs text-slate-400">封面字 · </span>
            <span className="font-black text-pink-600">{pkg.coverText.main}</span>
            {pkg.coverText.sub && (
              <span className="ml-2 text-slate-500">{pkg.coverText.sub}</span>
            )}
          </div>
          {lightbox && (
            <PackImageLightbox
              src={lightbox.src}
              alt={lightbox.alt}
              label={lightbox.label}
              onClose={() => setLightbox(null)}
              onSaved={() =>
                onToast?.("图片已保存（或已触发下载）") ??
                onCopy(lightbox.src, "图片已保存（或已触发下载）")
              }
            />
          )}
          {imageCount < 4 && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-pink-50 p-4">
              <div>
                <b className="text-sm">想让内容更像完整小红书笔记？</b>
                <p className="mt-1 text-xs text-slate-500">
                  升级到4张图，一封面+三张生活配图。
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUpgrade(4)}
                className="shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-4 py-2 text-xs font-black text-white"
              >
                补 {upgradeDiff(4)} 灵感
              </button>
            </div>
          )}
          {!isPro && (
            <button
              type="button"
              onClick={() => onPay("watermark")}
              className="mt-3 w-full text-center text-xs font-bold text-pink-500"
            >
              无水印保存 · Pro 专属
            </button>
          )}
        </section>
      )}

      {advanced && pkg.coverTexts && (
        <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-lg font-black">封面字推荐</h3>
          <p className="text-sm font-black text-pink-500">{pkg.coverText.main}</p>
          <p className="mt-1 text-sm text-slate-500">{pkg.coverText.sub}</p>
          <p className="mt-2 text-xs text-slate-400">{pkg.coverText.layoutTip}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pkg.coverTexts.map((c) => (
              <span
                key={c}
                className="rounded-full bg-pink-50 px-3 py-2 text-xs font-bold text-pink-500"
              >
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-lg font-black">正文推荐</h3>
        {pkg.bodies.map((b) => (
          <div key={b.id} className="mb-4 border-t border-pink-50 pt-4 first:border-t-0 first:pt-0">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">{b.text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onCopy(b.text, "已复制正文")}
                className="rounded-full bg-pink-50 px-3 py-2 text-xs font-black text-pink-500"
              >
                复制
              </button>
              {onRestyle
                ? (
                    [
                      ["改短一点", "改短一点"],
                      ["更口语一点", "更像真人写的"],
                      ...(advanced ? [["更高级一点", "更高级一点"]] : []),
                    ] as const
                  ).map(([label, style]) => (
                    <button
                      key={`${b.id}-${label}`}
                      type="button"
                      disabled={actionBusy}
                      onClick={() => onRestyle(b.id, style as RestyleOption)}
                      className="rounded-full bg-pink-50 px-3 py-2 text-xs font-black text-pink-500 disabled:opacity-50"
                    >
                      {label}
                    </button>
                  ))
                : null}
              {!advanced ? (
                <button
                  type="button"
                  onClick={() => onFavorite(b.id)}
                  className="rounded-full bg-pink-50 px-3 py-2 text-xs font-black text-pink-500"
                >
                  收藏
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-black">标签与发布建议</h3>
          <button
            type="button"
            onClick={() => onCopy(pkg.tags.join(" "), "已复制全部标签")}
            className="text-xs font-black text-pink-500"
          >
            复制全部
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {pkg.tags.map((x) => (
            <span
              key={x}
              className="rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-500"
            >
              {x}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl bg-pink-50 p-3">
            <Clock size={16} className="mb-1 text-pink-500" />
            <b>发布时间</b>
            <p className="mt-1 text-xs leading-5 text-slate-600">{pkg.publishAdvice.bestTime}</p>
            <p className="mt-1 text-[10px] text-slate-400">随时可发，下面只是更容易被刷到的参考</p>
          </div>
          <div className="rounded-2xl bg-pink-50 p-3">
            <MessageCircle size={16} className="mb-1 text-pink-500" />
            <b>评论引导</b>
            <p className="mt-1 text-xs text-slate-500">{pkg.publishAdvice.commentHook}</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          推荐平台：{pkg.publishAdvice.platform} · 适合人群：{pkg.publishAdvice.audience}
        </p>
      </section>

      {!advanced && (
        <section className="rounded-[30px] bg-gradient-to-br from-pink-500 to-orange-400 p-5 text-white shadow-lg shadow-pink-200">
          <h3 className="text-xl font-black">这条内容已经有感觉了，要不要配一张真实感封面？</h3>
          <p className="mt-2 text-sm leading-6 opacity-90">
            高级模式可以生成像真人博主随手拍的图片，更适合直接发小红书/朋友圈。
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {IMAGE_COUNT_OPTIONS.map((item) => (
              <button
                key={item.count}
                type="button"
                onClick={() => onSwitchAdvanced(item.count)}
                className="rounded-2xl bg-white/95 p-3 text-center text-pink-500"
              >
                <div className="font-black">{item.title}</div>
                <div className="mt-1 text-xs">
                  {getAdvancedPackCostPoints(item.count, plan)} 灵感
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
