"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { HomeHeroCompact } from "@/components/expression/home-hero-compact";
import { HomeHotTopicsTop3 } from "@/components/home/home-hot-topics-top3";
import { HomeValueStrip } from "@/components/home/home-value-strip";

const HomeFeatureBento = dynamic(
  () =>
    import("@/components/expression/home-feature-bento").then((m) => ({
      default: m.HomeFeatureBento,
    })),
  {
    loading: () => (
      <div
        className="h-72 animate-pulse rounded-[22px] bg-[#FFF0F5] ring-1 ring-[#FFE8F0]/80"
        aria-hidden
      />
    ),
  }
);
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";
import {
  EXPRESSION_RESULT_STORAGE_KEY,
  type ExpressionResultPayload,
} from "@/lib/api/expression/types";

export function HomeExpressionPage() {
  const router = useRouter();
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);

  const onQuickGenerate = async (prompt?: string) => {
    const text = (prompt ?? input).trim() || "今天想表达什么";
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!canAffordQuota(user, "expression_quick")) {
      openQuotaModal({
        need: getQuotaCost("expression_quick"),
        have: getTotalQuota(user),
      });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setGenerating(true);
    try {
      const res = await apiExpressionGenerate({ kind: "quick", prompt: text });
      if (res.user) setUser(res.user);
      if (!res.text) {
        showToast("未生成到内容，请重试");
        return;
      }
      const payload: ExpressionResultPayload = {
        text: res.text,
        titles: res.titles,
        tags: res.tags,
        prompt: text,
        quotaCost: res.quotaCost,
        usedMock: res.usedMock,
      };
      try {
        sessionStorage.setItem(EXPRESSION_RESULT_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        /* ignore */
      }
      router.push(`/expression/result?from=home`);
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("生成失败，请稍后再试");
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell homePage showHeader>
      <div className="home-v2 relative flex flex-col gap-3 pb-2 pt-0.5">
        <div
          className="pointer-events-none absolute -left-20 top-32 h-56 w-56 rounded-full bg-[#FF9EC4]/12 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-16 top-[320px] h-44 w-44 rounded-full bg-[#FFC46B]/10 blur-3xl"
          aria-hidden
        />

        <div className="home-flow relative z-10 flex flex-col gap-3">
          <HomeHeroCompact
            input={input}
            onInputChange={setInput}
            generating={generating}
            onGenerate={(p) => {
              if (p) setInput(p);
              void onQuickGenerate(p);
            }}
          />

          <HomeHotTopicsTop3 />

          <HomeValueStrip />

          <HomeFeatureBento />
        </div>
      </div>
    </AppShell>
  );
}
