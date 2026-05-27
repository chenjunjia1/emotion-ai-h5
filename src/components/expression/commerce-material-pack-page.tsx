"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Copy,
  FileText,
  Mic2,
  ShoppingBag,
  Sparkles,
  Video,
  Wand2,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CreamCard, GradientButton } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import type { CommerceMaterialPackPayload } from "@/lib/api/expression/types";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  COMMERCE_PRODUCT_CHIPS,
  COMMERCE_PRODUCT_PLACEHOLDERS,
} from "@/lib/mock/commerce-material-pack";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

function PackSection({
  title,
  icon: Icon,
  tint,
  content,
  onCopy,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tint: string;
  content: string;
  onCopy: () => void;
}) {
  return (
    <CreamCard className="p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-xl text-white shadow-sm",
              tint
            )}
          >
            <Icon size={16} />
          </span>
          <h3 className="text-[13px] font-black text-[#1F2937]">{title}</h3>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="flex items-center gap-0.5 rounded-full bg-[#FFF0F5] px-2 py-1 text-[10px] font-bold text-[#FF4F8B] active:scale-95"
        >
          <Copy size={11} />
          复制
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-[12px] leading-relaxed text-[#374151]">
        {content}
      </pre>
    </CreamCard>
  );
}

export function CommerceMaterialPackPage() {
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommerceMaterialPackPayload | null>(null);
  const quotaCost = getQuotaCost("expression_commerce_pack");

  const onGenerate = async (seed?: string) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const product = (seed ?? input).trim();
    if (!product) {
      showToast("先输入商品信息");
      return;
    }
    if (!canAffordQuota(user, "expression_commerce_pack")) {
      openQuotaModal({ need: quotaCost, have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await apiExpressionGenerate({ kind: "commerce_pack", prompt: product });
      if (res.user) setUser(res.user);
      if (!res.commercePack) {
        showToast("未生成到素材，请重试");
        return;
      }
      setResult(res.commercePack);
      if (!seed) setInput(product);
      showToast("带货素材包已生成");
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("生成失败，请稍后再试");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text: string) => {
    const ok = await copyToClipboard(text);
    showToast(ok ? "已复制" : "复制失败");
  };

  const copyAll = useCallback(() => {
    if (!result) return;
    void copyText(
      [
        `【商品】${result.productSummary}`,
        "",
        "【卖点】",
        ...result.sellingPoints.map((s, i) => `${i + 1}. ${s}`),
        "",
        "【短视频脚本】",
        result.videoScript,
        "",
        "【小红书笔记】",
        result.xhsNote,
        "",
        "【直播话术】",
        result.liveScript,
      ].join("\n")
    );
  }, [result]);

  return (
    <AppShell>
      <div className="page-flow-stagger pb-4">
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#9CA3AF] active:opacity-70"
        >
          <ChevronLeft size={16} />
          返回首页
        </Link>

        <div className="commerce-pack-hero relative mb-4 overflow-hidden rounded-[22px] px-4 py-4 text-white shadow-[0_14px_40px_rgba(239,68,68,0.25)]">
          <div
            className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-white/15 blur-2xl"
            aria-hidden
          />
          <div className="relative z-10 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/20 text-2xl ring-1 ring-white/30 backdrop-blur-sm">
              🛒
            </span>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black ring-1 ring-white/25">
                <Sparkles size={10} />
                一套带走 · 直接能拍能播
              </span>
              <h1 className="mt-1.5 text-[20px] font-black leading-tight">带货素材包</h1>
              <p className="mt-1 text-[11px] leading-relaxed text-white/90">
                输入商品，生成卖点、短视频脚本、小红书笔记、直播话术
              </p>
            </div>
          </div>
        </div>

        <CreamCard className="mb-3 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-[#6B7280]">商品信息</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {COMMERCE_PRODUCT_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setInput(chip)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold active:scale-95",
                  input === chip
                    ? "bg-gradient-to-r from-[#EF4444] to-[#FF6B6B] text-white shadow-md"
                    : "bg-[#FFF5F5] text-[#6B7280] ring-1 ring-[#FFE8E8]"
                )}
              >
                {chip}
              </button>
            ))}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder={COMMERCE_PRODUCT_PLACEHOLDERS[0]}
            className="w-full resize-none rounded-[14px] bg-[#FFFBFC] p-3 text-[13px] leading-relaxed text-[#1F2937] outline-none ring-1 ring-[#FFE8F0] focus:ring-2 focus:ring-[#EF4444]/25"
          />
          <GradientButton
            className="mt-3 w-full gap-1.5 bg-gradient-to-r from-[#EF4444] to-[#FF6B6B] py-3.5 shadow-[0_8px_24px_rgba(239,68,68,0.35)]"
            onClick={() => void onGenerate()}
          >
            <Wand2 size={16} className={loading ? "animate-spin" : undefined} />
            {loading ? "正在生成…" : `生成带货素材包 · ${quotaCost} 灵感`}
          </GradientButton>
        </CreamCard>

        {result ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[12px] font-black text-[#1F2937]">你的带货素材包</p>
              <button
                type="button"
                onClick={copyAll}
                className="text-[10px] font-bold text-[#EF4444]"
              >
                复制全套
              </button>
            </div>

            <CreamCard className="border-[#FFE8E8] bg-gradient-to-br from-[#FFF5F5] to-white p-3.5 ring-[#FECACA]">
              <p className="text-[10px] font-bold text-[#DC2626]">商品定位</p>
              <p className="mt-1 text-[14px] font-semibold leading-relaxed text-[#1F2937]">
                {result.productSummary}
              </p>
            </CreamCard>

            <CreamCard className="p-3.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] text-white">
                    <ShoppingBag size={16} />
                  </span>
                  <h3 className="text-[13px] font-black text-[#1F2937]">核心卖点</h3>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    void copyText(result.sellingPoints.map((s, i) => `${i + 1}. ${s}`).join("\n"))
                  }
                  className="text-[10px] font-bold text-[#FF4F8B]"
                >
                  复制
                </button>
              </div>
              <ul className="space-y-2">
                {result.sellingPoints.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 rounded-[12px] bg-[#FFFBFC] px-2.5 py-2 text-[12px] leading-snug text-[#374151] ring-1 ring-[#FFE8F0]"
                  >
                    <span className="font-black text-[#EF4444]">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CreamCard>

            <PackSection
              title="短视频脚本"
              icon={Video}
              tint="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]"
              content={result.videoScript}
              onCopy={() => void copyText(result.videoScript)}
            />
            <PackSection
              title="小红书笔记"
              icon={FileText}
              tint="bg-gradient-to-br from-[#FF6B6B] to-[#FF2442]"
              content={result.xhsNote}
              onCopy={() => void copyText(result.xhsNote)}
            />
            <PackSection
              title="直播话术"
              icon={Mic2}
              tint="bg-gradient-to-br from-[#FF9A4D] to-[#EF4444]"
              content={result.liveScript}
              onCopy={() => void copyText(result.liveScript)}
            />

            <Link
              href={`/publish-pack?topic=${encodeURIComponent(input.slice(0, 40))}`}
              className="flex items-center justify-center gap-1 rounded-[16px] bg-[#1F2937] py-3 text-[12px] font-black text-white active:scale-[0.99]"
            >
              <ShoppingBag size={14} />
              用脚本去生成发布包
            </Link>
          </div>
        ) : (
          <p className="px-2 text-center text-[11px] text-[#9CA3AF]">
            卖点 · 短视频 · 小红书 · 直播话术 一次齐
          </p>
        )}
      </div>
    </AppShell>
  );
}
