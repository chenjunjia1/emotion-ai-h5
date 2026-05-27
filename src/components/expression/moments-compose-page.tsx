"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy, RefreshCw, Sparkles, Users, Wand2, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { InspirationSourceBar } from "@/components/inspiration/inspiration-source-bar";
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import {
  EXPRESSION_RESULT_STORAGE_KEY,
  type ExpressionResultPayload,
} from "@/lib/api/expression/types";
import { EXPRESSION_PRICING_HINT } from "@/lib/expression/pricing";
import { getQuotaCost } from "@/lib/v1/quota";
import {
  MOMENTS_EXAMPLE_SNIPPETS,
  MOMENTS_PROMPT_CHIPS,
  MOMENTS_TONE_OPTIONS,
  type MomentsTone,
} from "@/lib/mock/moments-prompts";
import { canAffordQuota, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

export function MomentsComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";
  const hint = searchParams.get("hint") ?? "";
  const fromInspiration =
    searchParams.get("from") === "inspiration" || Boolean(searchParams.get("inspiration_id"));
  const returnTo = searchParams.get("returnTo") ?? "/inspiration";

  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState(topic || hint);
  const [tone, setTone] = useState<MomentsTone>("松弛");
  const [loading, setLoading] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [result, setResult] = useState<ExpressionResultPayload | null>(null);

  const quotaCost = getQuotaCost("expression_moments");
  const isVip = user && user.plan !== "free";

  useEffect(() => {
    const next = topic || hint;
    if (next) setInput(next);
  }, [topic, hint]);

  useEffect(() => {
    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % MOMENTS_EXAMPLE_SNIPPETS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const buildPrompt = useCallback(() => {
    const base = input.trim() || topic || hint;
    if (!base) return "";
    return `${base}（风格：${tone}，适合发朋友圈，口语自然有画面感）`;
  }, [input, topic, hint, tone]);

  const onGenerate = async (seed?: string) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (user.plan === "free") {
      showToast(expressionErrorMessage("feature_vip"));
      return;
    }
    const prompt = seed ?? buildPrompt();
    if (!prompt.trim()) {
      showToast("选个提示词或输入你想表达的点");
      return;
    }
    if (!canAffordQuota(user, "expression_moments")) {
      openQuotaModal({ need: quotaCost, have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await apiExpressionGenerate({ kind: "moments", prompt });
      if (res.user) setUser(res.user);
      if (!res.text) {
        showToast("未生成到内容，请重试");
        return;
      }
      const payload: ExpressionResultPayload = {
        text: res.text,
        titles: res.titles,
        tags: res.tags,
        prompt: input.trim() || seed,
        quotaCost: res.quotaCost ?? quotaCost,
        usedMock: res.usedMock,
      };
      setResult(payload);
      showToast(res.quotaCost ? `生成完成（消耗 ${res.quotaCost} 灵感）` : "生成完成");
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("生成失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const goResultPage = () => {
    if (!result) return;
    try {
      sessionStorage.setItem(EXPRESSION_RESULT_STORAGE_KEY, JSON.stringify(result));
    } catch {
      /* ignore */
    }
    router.push("/expression/result?from=moments");
  };

  return (
    <AppShell>
      <div className="moments-compose space-y-3.5 pb-4">
        <Link href="/create" className="inline-flex text-[12px] font-bold text-[#FF4F8B]">
          ← 返回创作中心
        </Link>

        {fromInspiration && (topic || hint) ? (
          <InspirationSourceBar headline={(topic || hint).slice(0, 48)} returnTo={returnTo} />
        ) : null}

        <section className="moments-hero relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FF7AAE] via-[#FF6B9D] to-[#FF9A4D] p-4 text-white shadow-[0_10px_32px_rgba(255,79,139,0.35)]">
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/20 blur-2xl" aria-hidden />
          <p className="relative text-[11px] font-bold text-white/90">朋友圈秒发 · 90/00 后口吻</p>
          <h1 className="relative mt-1 text-[22px] font-black leading-tight">写一条让人想点赞的朋友圈</h1>
          <p
            className="relative mt-2 flex items-center gap-1 text-[10px] text-white/85"
            aria-live="polite"
          >
            <Users size={11} />
            今日已有 2w+ 条朋友圈文案在这里生成
          </p>
        </section>

        <div className="rounded-[18px] bg-white p-3.5 shadow-[0_4px_20px_rgba(255,79,139,0.08)] ring-1 ring-[#FFE8F0]">
          <label className="text-[11px] font-bold text-[#9CA3AF]">想表达什么？</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：下班治愈、探店打卡、自拍氛围感…"
            rows={4}
            className="mt-2 w-full resize-none rounded-[14px] border border-[#FFE8F0] bg-[#FFFBFC] p-3 text-[14px] leading-relaxed text-[#1F2937] outline-none focus:ring-2 focus:ring-[#FF4F8B]/25"
          />

          <p className="mt-2 text-[10px] font-bold text-[#9CA3AF]">语气风格</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MOMENTS_TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-95",
                  tone === t.id
                    ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm"
                    : "bg-[#FFF0F5] text-[#6B7280] ring-1 ring-[#FFE8F0]"
                )}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] font-bold text-[#9CA3AF]">不知道怎么写？点一下试试</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {MOMENTS_PROMPT_CHIPS.map((chip) => (
              <button
                key={chip.text}
                type="button"
                onClick={() => {
                  setInput(chip.text);
                  void onGenerate(`${chip.text}（风格：${tone}）`);
                }}
                className="group relative rounded-full bg-[#FFF5F8] px-2.5 py-1 text-left text-[11px] font-semibold text-[#374151] ring-1 ring-[#FFE8F0] transition active:scale-95 hover:ring-[#FF4F8B]/40"
              >
                {chip.tag ? (
                  <span className="mr-1 inline-block rounded bg-[#FF4F8B]/15 px-1 text-[8px] font-black text-[#FF4F8B]">
                    {chip.tag}
                  </span>
                ) : null}
                {chip.text}
              </button>
            ))}
          </div>

          <p
            key={exampleIdx}
            className="home-ticker-fade mt-3 rounded-[12px] bg-[#FFF8FC] px-2.5 py-2 text-[11px] italic leading-relaxed text-[#9CA3AF]"
          >
            参考：{MOMENTS_EXAMPLE_SNIPPETS[exampleIdx]}
          </p>
        </div>

        {user?.plan === "free" ? (
          <div className="rounded-[16px] border border-[#FFE0EC] bg-[#FFF5F8] p-3">
            <p className="text-[12px] font-bold text-[#1F2937]">Pro 会员专享</p>
            <p className="mt-1 text-[11px] text-[#6B7280]">{EXPRESSION_PRICING_HINT.vip}</p>
            <Link href="/profile?pricing=1" className="mt-2 inline-block text-[12px] font-bold text-[#FF4F8B]">
              开通 Pro 会员 →
            </Link>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-1 text-[10px] text-[#9CA3AF]">
            <Zap size={11} className="text-[#FF9A4D]" />
            每次生成消耗 {quotaCost} 灵感
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void onGenerate()}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-[14px] font-black text-white shadow-[0_6px_20px_rgba(255,79,139,0.4)] disabled:opacity-60 active:scale-[0.98]"
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Wand2 size={18} className="fill-white/25" />
          )}
          {loading ? "生成中…" : "一键生成朋友圈"}
        </button>

        {result ? (
          <article className="space-y-2.5 rounded-[20px] bg-white p-4 shadow-[0_6px_24px_rgba(255,79,139,0.1)] ring-1 ring-[#FFE8F0]">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1 text-[11px] font-black text-[#FF4F8B]">
                <Sparkles size={12} />
                生成结果
              </p>
              <button
                type="button"
                onClick={() => void onGenerate()}
                className="text-[11px] font-bold text-[#9CA3AF]"
              >
                换一版
              </button>
            </div>
            <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#374151]">{result.text}</p>
            {result.tags && result.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[10px] font-semibold text-[#FF4F8B]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => void navigator.clipboard?.writeText(result.text ?? "")}
                className="flex items-center justify-center gap-1 rounded-full bg-[#FFF0F5] py-2.5 text-[12px] font-black text-[#FF4F8B] active:scale-[0.98]"
              >
                <Copy size={14} />
                复制
              </button>
              <button
                type="button"
                onClick={goResultPage}
                className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2.5 text-[12px] font-black text-white active:scale-[0.98]"
              >
                全屏查看
              </button>
            </div>
          </article>
        ) : null}
      </div>
    </AppShell>
  );
}
