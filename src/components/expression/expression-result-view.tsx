"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, Copy, Crown, RefreshCw, Sparkles } from "lucide-react";
import { GradientButton } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import type { ExpressionResultPayload } from "@/lib/api/expression/types";
import { EXPRESSION_PRICING_HINT } from "@/lib/expression/pricing";
import { cn } from "@/lib/utils";

type Props = {
  initial: ExpressionResultPayload;
  fromHome?: boolean;
};

export function ExpressionResultView({ initial, fromHome }: Props) {
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [data, setData] = useState(initial);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const onCopy = useCallback(async () => {
    const blob = [
      data.text,
      data.titles?.length ? `\n\n— 标题备选 —\n${data.titles.join("\n")}` : "",
      data.tags?.length ? `\n\n#${data.tags.join(" #")}` : "",
    ]
      .filter(Boolean)
      .join("");
    try {
      await navigator.clipboard.writeText(blob);
      setCopied(true);
      showToast("已复制到剪贴板");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("复制失败，请长按选择文字");
    }
  }, [data, showToast]);

  const onRegenerate = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    setRegenerating(true);
    try {
      const res = await apiExpressionGenerate({
        kind: "quick",
        prompt: data.prompt ?? "今天想表达什么",
      });
      if (res.user) setUser(res.user);
      if (res.text) {
        const next: ExpressionResultPayload = {
          text: res.text,
          titles: res.titles,
          tags: res.tags,
          prompt: data.prompt,
          quotaCost: res.quotaCost,
          usedMock: res.usedMock,
        };
        setData(next);
        try {
          sessionStorage.setItem("expression_result_v2", JSON.stringify(next));
        } catch {
          /* ignore */
        }
        showToast(`已重新生成（消耗 ${res.quotaCost ?? 10} 灵感）`);
      }
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("生成失败，请重试");
      }
    } finally {
      setRegenerating(false);
    }
  };

  const isFree = user?.plan === "free";

  return (
    <div className="expression-result space-y-4 pb-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#FF4F8B]">
            AI 已为你写好
          </p>
          <h1 className="mt-0.5 text-[20px] font-black text-[#1F2937]">生成结果</h1>
          {data.prompt ? (
            <p className="mt-1 line-clamp-2 text-[12px] text-[#9CA3AF]">
              主题：{data.prompt}
            </p>
          ) : null}
        </div>
        {data.usedMock ? (
          <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
            演示模式
          </span>
        ) : null}
      </div>

      <article className="relative overflow-hidden rounded-[20px] bg-white p-4 shadow-[0_8px_32px_rgba(255,79,139,0.08)] ring-1 ring-[#FFE8F0]">
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FF9EC4]/20 blur-2xl"
          aria-hidden
        />
        <div className="relative whitespace-pre-wrap text-[15px] leading-[1.75] text-[#374151]">
          {data.text}
        </div>
        {data.titles && data.titles.length > 0 ? (
          <div className="relative mt-4 border-t border-[#FFF0F5] pt-3">
            <p className="mb-1.5 text-[11px] font-bold text-[#9CA3AF]">标题备选</p>
            <ul className="space-y-1">
              {data.titles.map((t) => (
                <li key={t} className="text-[13px] font-semibold text-[#4B5563]">
                  · {t}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {data.tags && data.tags.length > 0 ? (
          <div className="relative mt-3 flex flex-wrap gap-1.5">
            {data.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-[#FFF5F8] px-2.5 py-0.5 text-[11px] font-semibold text-[#FF4F8B]"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </article>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => void onCopy()}
          className="flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3 text-[13px] font-black text-white shadow-[0_4px_16px_rgba(255,79,139,0.35)] active:scale-[0.98]"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "已复制" : "复制全文"}
        </button>
        <button
          type="button"
          disabled={regenerating}
          onClick={() => void onRegenerate()}
          className="flex items-center justify-center gap-1.5 rounded-full bg-[#F3F4F6] py-3 text-[13px] font-bold text-[#4B5563] ring-1 ring-[#E5E7EB] disabled:opacity-60 active:scale-[0.98]"
        >
          <RefreshCw size={16} className={cn(regenerating && "animate-spin")} />
          {regenerating ? "生成中…" : "换一版"}
        </button>
      </div>

      <GradientButton href={fromHome ? "/" : "/create"} className="w-full !rounded-[14px]">
        {fromHome ? "回首页" : "去创作中心"}
      </GradientButton>

      <Link
        href="/inspiration"
        className="flex items-center justify-center gap-1 text-center text-[12px] font-bold text-[#FF4F8B]"
      >
        <Sparkles size={14} />
        去灵感库找更多选题 →
      </Link>

      {isFree ? (
        <div className="rounded-[16px] border border-[#FFE0EC] bg-gradient-to-br from-[#FFF5F8] to-white p-3.5">
          <div className="flex items-center gap-2 text-[13px] font-black text-[#1F2937]">
            <Crown size={16} className="text-[#FF9A4D]" />
            会员专享 · 更多创作能力
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#6B7280]">
            {EXPRESSION_PRICING_HINT.vip}。{EXPRESSION_PRICING_HINT.freeDaily}
          </p>
          <Link
            href="/profile?pricing=1"
            className="mt-2 inline-flex rounded-full bg-[#FF4F8B] px-3 py-1.5 text-[11px] font-bold text-white"
          >
            查看会员方案
          </Link>
        </div>
      ) : null}

      <p className="text-center text-[10px] text-[#B0B8C4]">
        {EXPRESSION_PRICING_HINT.quick}
        {data.quotaCost != null ? ` · 本次已消耗 ${data.quotaCost} 灵感` : null}
      </p>
    </div>
  );
}
