"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Copy, Flame, RefreshCw, Sparkles, TrendingUp, Wand2, Zap } from "lucide-react";
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
  XHS_HOT_TAGS_HINT,
  XHS_NOTE_EXAMPLE_SNIPPETS,
  XHS_NOTE_PROMPT_CHIPS,
  XHS_NOTE_STYLE_OPTIONS,
  type XhsNoteStyle,
} from "@/lib/mock/xhs-note-prompts";
import { canAffordQuota, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

export function XhsNoteComposePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";
  const hint = searchParams.get("hint") ?? "";
  const fromInspiration =
    searchParams.get("from") === "inspiration" || Boolean(searchParams.get("inspiration_id"));
  const returnTo = searchParams.get("returnTo") ?? "/inspiration";

  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState(topic || hint);
  const [style, setStyle] = useState<XhsNoteStyle>("种草");
  const [loading, setLoading] = useState(false);
  const [exampleIdx, setExampleIdx] = useState(0);
  const [result, setResult] = useState<ExpressionResultPayload | null>(null);

  const quotaCost = getQuotaCost("expression_xhs");

  useEffect(() => {
    const next = topic || hint;
    if (next) setInput(next);
  }, [topic, hint]);

  useEffect(() => {
    const id = setInterval(() => {
      setExampleIdx((i) => (i + 1) % XHS_NOTE_EXAMPLE_SNIPPETS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  const buildPrompt = useCallback(() => {
    const base = input.trim() || topic || hint;
    if (!base) return "";
    return `${base}（小红书笔记，${style}风，标题吸睛+正文分段+emoji，带话题标签感，真实不硬广）`;
  }, [input, topic, hint, style]);

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
      showToast("选个热门选题或输入你的产品/场景");
      return;
    }
    if (!canAffordQuota(user, "expression_xhs")) {
      openQuotaModal({ need: quotaCost, have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await apiExpressionGenerate({ kind: "xhs_note", prompt });
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
    router.push("/expression/result?from=xhs");
  };

  const copyAll = () => {
    if (!result) return;
    const blob = [
      result.titles?.length ? `标题备选：\n${result.titles.join("\n")}\n\n` : "",
      result.text,
      result.tags?.length ? `\n\n#${result.tags.join(" #")}` : "",
    ].join("");
    void navigator.clipboard?.writeText(blob).then(() => showToast("已复制全部"));
  };

  return (
    <AppShell>
      <div className="xhs-compose space-y-3.5 pb-4">
        <Link href="/create" className="inline-flex text-[12px] font-bold text-[#FF4F8B]">
          ← 返回创作中心
        </Link>

        {fromInspiration && (topic || hint) ? (
          <InspirationSourceBar headline={(topic || hint).slice(0, 48)} returnTo={returnTo} />
        ) : null}

        <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#FF2442] via-[#FF4D6D] to-[#FF6B8A] p-4 text-white shadow-[0_10px_32px_rgba(255,36,66,0.35)]">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl" aria-hidden />
          <div className="relative flex items-start gap-2">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <BookOpen size={20} strokeWidth={2.5} />
            </span>
            <div>
              <p className="flex items-center gap-1 text-[10px] font-bold text-white/90">
                <Flame size={11} className="fill-white/30" />
                小红书爆款笔记 · 最新选题库
              </p>
              <h1 className="mt-0.5 text-[22px] font-black leading-tight">3 秒出标题 + 正文</h1>
              <p className="mt-1.5 flex items-center gap-1 text-[10px] text-white/85">
                <TrendingUp size={11} />
                灵感库已同步今日热门方向，点选题直接生成
              </p>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap gap-1.5 px-0.5">
          {XHS_HOT_TAGS_HINT.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[#FFF0F3] px-2 py-0.5 text-[9px] font-black text-[#FF2442] ring-1 ring-[#FFD0DC]"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="rounded-[18px] bg-white p-3.5 shadow-[0_4px_20px_rgba(255,36,66,0.08)] ring-1 ring-[#FFE0EC]">
          <label className="text-[11px] font-bold text-[#9CA3AF]">你的产品 / 场景 / 人群</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="例如：平价护肤、通勤穿搭、探店打卡…"
            rows={4}
            className="mt-2 w-full resize-none rounded-[14px] border border-[#FFE0EC] bg-[#FFFBFC] p-3 text-[14px] leading-relaxed text-[#1F2937] outline-none focus:ring-2 focus:ring-[#FF2442]/25"
          />

          <p className="mt-2 text-[10px] font-bold text-[#9CA3AF]">笔记类型</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {XHS_NOTE_STYLE_OPTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-95",
                  style === s.id
                    ? "bg-gradient-to-r from-[#FF2442] to-[#FF6B8A] text-white shadow-sm"
                    : "bg-[#FFF0F3] text-[#6B7280] ring-1 ring-[#FFE0EC]"
                )}
              >
                {s.emoji} {s.label}
              </button>
            ))}
          </div>

          <p className="mt-3 flex items-center gap-1 text-[10px] font-bold text-[#9CA3AF]">
            <Sparkles size={11} className="text-[#FF2442]" />
            最新热门选题 · 点一下开写
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {XHS_NOTE_PROMPT_CHIPS.map((chip) => (
              <button
                key={chip.text}
                type="button"
                onClick={() => {
                  setInput(chip.text);
                  void onGenerate(
                    `${chip.text}（小红书${style}笔记，标题+正文+标签，真实分享口吻）`
                  );
                }}
                className="rounded-full bg-[#FFF5F7] px-2.5 py-1 text-left text-[11px] font-semibold text-[#374151] ring-1 ring-[#FFE0EC] transition active:scale-95 hover:ring-[#FF2442]/40"
              >
                {chip.tag ? (
                  <span className="mr-1 inline-block rounded bg-[#FF2442]/12 px-1 text-[8px] font-black text-[#FF2442]">
                    {chip.tag}
                  </span>
                ) : null}
                {chip.text}
              </button>
            ))}
          </div>

          <p
            key={exampleIdx}
            className="home-ticker-fade mt-3 rounded-[12px] bg-[#FFF5F7] px-2.5 py-2 text-[11px] italic leading-relaxed text-[#9CA3AF]"
          >
            爆款标题参考：{XHS_NOTE_EXAMPLE_SNIPPETS[exampleIdx]}
          </p>
        </div>

        {user?.plan === "free" ? (
          <div className="rounded-[16px] border border-[#FFE0EC] bg-[#FFF5F8] p-3">
            <p className="text-[12px] font-bold text-[#1F2937]">Pro 会员专享</p>
            <p className="mt-1 text-[11px] text-[#6B7280]">{EXPRESSION_PRICING_HINT.vip}</p>
            <Link href="/profile?pricing=1" className="mt-2 inline-block text-[12px] font-bold text-[#FF2442]">
              开通 Pro 会员 →
            </Link>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-1 text-[10px] text-[#9CA3AF]">
            <Zap size={11} className="text-[#FF2442]" />
            每次生成消耗 {quotaCost} 灵感
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void onGenerate()}
          className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-[#FF2442] to-[#FF6B8A] py-3.5 text-[14px] font-black text-white shadow-[0_6px_20px_rgba(255,36,66,0.35)] disabled:opacity-60 active:scale-[0.98]"
        >
          {loading ? (
            <RefreshCw size={18} className="animate-spin" />
          ) : (
            <Wand2 size={18} className="fill-white/25" />
          )}
          {loading ? "生成中…" : "一键生成小红书笔记"}
        </button>

        {result ? (
          <article className="space-y-2.5 rounded-[20px] bg-white p-4 shadow-[0_6px_24px_rgba(255,36,66,0.12)] ring-1 ring-[#FFE0EC]">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1 text-[11px] font-black text-[#FF2442]">
                <Sparkles size={12} />
                笔记已生成
              </p>
              <button
                type="button"
                onClick={() => void onGenerate()}
                className="text-[11px] font-bold text-[#9CA3AF]"
              >
                换一版
              </button>
            </div>
            {result.titles && result.titles.length > 0 ? (
              <div className="rounded-[12px] bg-[#FFF5F7] p-2.5">
                <p className="text-[10px] font-black text-[#FF2442]">标题备选</p>
                <ul className="mt-1 space-y-0.5">
                  {result.titles.map((t) => (
                    <li key={t} className="text-[12px] font-semibold text-[#374151]">
                      · {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <p className="whitespace-pre-wrap text-[14px] leading-[1.75] text-[#374151]">{result.text}</p>
            {result.tags && result.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {result.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#FFF0F3] px-2 py-0.5 text-[10px] font-semibold text-[#FF2442]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={copyAll}
                className="flex items-center justify-center gap-1 rounded-full bg-[#FFF0F3] py-2.5 text-[12px] font-black text-[#FF2442] active:scale-[0.98]"
              >
                <Copy size={14} />
                复制全文
              </button>
              <button
                type="button"
                onClick={goResultPage}
                className="rounded-full bg-gradient-to-r from-[#FF2442] to-[#FF6B8A] py-2.5 text-[12px] font-black text-white active:scale-[0.98]"
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
