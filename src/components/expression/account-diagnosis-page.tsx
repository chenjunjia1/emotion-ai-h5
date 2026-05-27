"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  Copy,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
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
import type { AccountDiagnosisPayload } from "@/lib/api/expression/types";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  ACCOUNT_DIAGNOSIS_CHIPS,
  ACCOUNT_DIAGNOSIS_PLACEHOLDERS,
} from "@/lib/mock/account-diagnosis";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

function ResultBlock({
  title,
  icon: Icon,
  tint,
  children,
  onCopy,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tint: string;
  children: React.ReactNode;
  onCopy: () => void;
}) {
  return (
    <CreamCard className="p-3.5">
      <div className="mb-2.5 flex items-center justify-between gap-2">
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
      {children}
    </CreamCard>
  );
}

export function AccountDiagnosisPage() {
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountDiagnosisPayload | null>(null);
  const quotaCost = getQuotaCost("expression_account_diagnosis");

  const buildPrompt = useCallback(() => input.trim(), [input]);

  const onGenerate = async (seed?: string) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const positioning = (seed ?? buildPrompt()).trim();
    if (!positioning) {
      showToast("先输入或选择账号定位");
      return;
    }
    if (!canAffordQuota(user, "expression_account_diagnosis")) {
      openQuotaModal({ need: quotaCost, have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const res = await apiExpressionGenerate({
        kind: "account_diagnosis",
        prompt: positioning,
      });
      if (res.user) setUser(res.user);
      if (!res.diagnosis) {
        showToast("未生成到诊断结果，请重试");
        return;
      }
      setResult(res.diagnosis);
      if (!seed) setInput(positioning);
      showToast("账号诊断报告已生成");
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

  const copyFullReport = () => {
    if (!result) return;
    const plan = result.publishPlan
      .map((d) => `Day${d.day} ${d.theme}：${d.content}（${d.tip}）`)
      .join("\n");
    void copyText(
      [
        `【定位】${result.summary}`,
        "",
        "【内容方向】",
        ...result.contentDirection.map((s, i) => `${i + 1}. ${s}`),
        "",
        "【爆款选题】",
        ...result.hotTopics.map((s, i) => `${i + 1}. ${s}`),
        "",
        "【7天发布计划】",
        plan,
        "",
        "【变现建议】",
        ...result.monetization.map((s, i) => `${i + 1}. ${s}`),
      ].join("\n")
    );
  };

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

        <div className="account-diagnosis-hero relative mb-4 overflow-hidden rounded-[22px] px-4 py-4 text-white shadow-[0_14px_40px_rgba(217,119,6,0.28)]">
          <div
            className="pointer-events-none absolute -right-6 -top-8 h-32 w-32 rounded-full bg-white/15 blur-2xl"
            aria-hidden
          />
          <div className="relative z-10 flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/20 text-2xl ring-1 ring-white/30 backdrop-blur-sm">
              📊
            </span>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black ring-1 ring-white/25">
                <Sparkles size={10} />
                高价值功能
              </span>
              <h1 className="mt-1.5 text-[20px] font-black leading-tight">账号诊断</h1>
              <p className="mt-1 text-[11px] leading-relaxed text-white/90">
                输入定位，AI 输出内容方向、爆款选题、7 天发布计划与变现建议
              </p>
            </div>
          </div>
        </div>

        <CreamCard className="mb-3 p-3.5">
          <p className="mb-2 text-[11px] font-bold text-[#6B7280]">选择或输入账号定位</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ACCOUNT_DIAGNOSIS_CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => setInput(chip)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95",
                  input === chip
                    ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md"
                    : "bg-[#FFF5F8] text-[#6B7280] ring-1 ring-[#FFE8F0]"
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
            placeholder={ACCOUNT_DIAGNOSIS_PLACEHOLDERS[0]}
            className="w-full resize-none rounded-[14px] bg-[#FFFBFC] p-3 text-[13px] leading-relaxed text-[#1F2937] outline-none ring-1 ring-[#FFE8F0] focus:ring-2 focus:ring-[#FF4F8B]/30"
          />
          <GradientButton
            className="mt-3 w-full gap-1.5 py-3.5"
            onClick={() => void onGenerate()}
          >
            <Wand2 size={16} className={loading ? "animate-spin" : undefined} />
            {loading ? "正在诊断…" : `生成诊断报告 · ${quotaCost} 灵感`}
          </GradientButton>
        </CreamCard>

        {result ? (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-0.5">
              <p className="text-[12px] font-black text-[#1F2937]">你的账号诊断报告</p>
              <button
                type="button"
                onClick={copyFullReport}
                className="text-[10px] font-bold text-[#FF4F8B]"
              >
                复制全文
              </button>
            </div>

            <CreamCard className="border-[#FFE8D6] bg-gradient-to-br from-[#FFFBF5] to-white p-3.5 ring-[#FFE4C7]">
              <p className="text-[10px] font-bold text-[#D97706]">定位判断</p>
              <p className="mt-1 text-[14px] font-semibold leading-relaxed text-[#1F2937]">
                {result.summary}
              </p>
            </CreamCard>

            <ResultBlock
              title="内容方向"
              icon={Target}
              tint="bg-gradient-to-br from-[#FF6B6B] to-[#FF2442]"
              onCopy={() =>
                void copyText(result.contentDirection.map((s, i) => `${i + 1}. ${s}`).join("\n"))
              }
            >
              <ul className="space-y-2">
                {result.contentDirection.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[12px] leading-snug text-[#374151]"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF4F8B]" />
                    {item}
                  </li>
                ))}
              </ul>
            </ResultBlock>

            <ResultBlock
              title="爆款选题"
              icon={TrendingUp}
              tint="bg-gradient-to-br from-[#FF9A4D] to-[#FF4F8B]"
              onCopy={() =>
                void copyText(result.hotTopics.map((s, i) => `${i + 1}. ${s}`).join("\n"))
              }
            >
              <ul className="space-y-1.5">
                {result.hotTopics.map((item) => (
                  <li
                    key={item}
                    className="rounded-[12px] bg-[#FFF8F5] px-2.5 py-2 text-[12px] font-medium text-[#374151] ring-1 ring-[#FFE8F0]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </ResultBlock>

            <ResultBlock
              title="7 天发布计划"
              icon={CalendarDays}
              tint="bg-gradient-to-br from-[#34D399] to-[#059669]"
              onCopy={() =>
                void copyText(
                  result.publishPlan
                    .map((d) => `Day${d.day} ${d.theme}\n${d.content}\n💡 ${d.tip}`)
                    .join("\n\n")
                )
              }
            >
              <div className="space-y-2">
                {result.publishPlan.map((day) => (
                  <div
                    key={day.day}
                    className="rounded-[14px] bg-[#F0FDF4] p-2.5 ring-1 ring-[#BBF7D0]/80"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#059669] text-[10px] font-black text-white">
                        {day.day}
                      </span>
                      <p className="text-[12px] font-black text-[#065F46]">{day.theme}</p>
                    </div>
                    <p className="mt-1.5 text-[12px] leading-snug text-[#374151]">{day.content}</p>
                    <p className="mt-1 text-[10px] text-[#059669]">💡 {day.tip}</p>
                  </div>
                ))}
              </div>
            </ResultBlock>

            <ResultBlock
              title="变现建议"
              icon={Wallet}
              tint="bg-gradient-to-br from-[#A855F7] to-[#7C3AED]"
              onCopy={() =>
                void copyText(result.monetization.map((s, i) => `${i + 1}. ${s}`).join("\n"))
              }
            >
              <ul className="space-y-2">
                {result.monetization.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-[12px] leading-snug text-[#374151]"
                  >
                    <Lightbulb size={14} className="mt-0.5 shrink-0 text-[#A855F7]" />
                    {item}
                  </li>
                ))}
              </ul>
            </ResultBlock>

            <Link
              href="/publish-pack"
              className="flex items-center justify-center gap-1 rounded-[16px] bg-[#1F2937] py-3 text-[12px] font-black text-white active:scale-[0.99]"
            >
              <BarChart3 size={14} />
              用选题去生成发布包
            </Link>
          </div>
        ) : (
          <p className="px-2 text-center text-[11px] text-[#9CA3AF]">
            报告包含：内容方向 · 爆款选题 · 7 天计划 · 变现路径
          </p>
        )}
      </div>
    </AppShell>
  );
}
