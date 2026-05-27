"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InspirationSourceBar } from "@/components/inspiration/inspiration-source-bar";
import { GradientButton, CreamCard } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import {
  canUseExpressionKind,
  expressionQuotaKey,
  EXPRESSION_PRICING_HINT,
} from "@/lib/expression/pricing";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";

type FeatureKind = "image-caption" | "moments" | "xhs-note";

const CONFIG: Record<
  FeatureKind,
  { title: string; emoji: string; placeholder: string; kind: "image_caption" | "moments" | "xhs_note" }
> = {
  "image-caption": {
    title: "上传图片配文",
    emoji: "🖼️",
    placeholder: "可选：补充你想表达的心情或场景",
    kind: "image_caption",
  },
  moments: {
    title: "写朋友圈",
    emoji: "✍️",
    placeholder: "说说今天的心情、场景或想表达的点…",
    kind: "moments",
  },
  "xhs-note": {
    title: "小红书笔记",
    emoji: "📕",
    placeholder: "产品/场景/人群，例如：秋冬护肤、通勤穿搭…",
    kind: "xhs_note",
  },
};

export function FeatureMockPage({ feature }: { feature: FeatureKind }) {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";
  const hint = searchParams.get("hint") ?? "";
  const fromInspiration =
    searchParams.get("from") === "inspiration" || Boolean(searchParams.get("inspiration_id"));
  const returnTo = searchParams.get("returnTo") ?? "/inspiration";
  const cfg = CONFIG[feature];
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [input, setInput] = useState(topic || hint);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [extras, setExtras] = useState<Record<string, string>>({});

  useEffect(() => {
    const next = topic || hint;
    if (next) setInput(next);
  }, [topic, hint]);

  const needsVip = feature !== "image-caption" && !canUseExpressionKind(user?.plan ?? "free", cfg.kind);
  const quotaKey = feature === "image-caption" ? "expression_image" : expressionQuotaKey(cfg.kind);

  const onGenerate = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (needsVip) {
      showToast(expressionErrorMessage("feature_vip"));
      return;
    }
    if (!canAffordQuota(user, quotaKey)) {
      openQuotaModal({ need: getQuotaCost(quotaKey), have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    try {
      if (feature === "image-caption") {
        showToast("请使用识图配文页面上传图片");
        return;
      } else {
        const res = await apiExpressionGenerate({
          kind: cfg.kind,
          prompt: input || topic,
        });
        if (res.user) setUser(res.user);
        const lines = [
          res.text,
          res.titles?.length ? `\n标题建议：\n${res.titles.join("\n")}` : "",
          res.tags?.length ? `\n标签：${res.tags.join(" ")}` : "",
        ].filter(Boolean);
        setResult(lines.join("\n"));
      }
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

  return (
    <AppShell>
      <div className="space-y-4">
        <Link href="/create" className="text-[12px] font-bold text-[#FF4F8B]">
          ← 返回创作中心
        </Link>

        {fromInspiration && (topic || hint) ? (
          <InspirationSourceBar
            headline={(topic || hint).slice(0, 48)}
            returnTo={returnTo}
          />
        ) : null}
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#FF9EC4] to-[#FF7AAE] text-2xl shadow">
            {cfg.emoji}
          </span>
          <h1 className="text-[18px] font-black text-[#1F2937]">{cfg.title}</h1>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={cfg.placeholder}
          rows={5}
          className="w-full rounded-[18px] border border-[#FFE8F0] bg-white p-3 text-[13px] outline-none focus:ring-2 focus:ring-[#FF4F8B]/20"
        />

        {needsVip ? (
          <div className="rounded-[16px] border border-[#FFE0EC] bg-[#FFF5F8] p-3 text-[12px] text-[#6B7280]">
            <p className="font-bold text-[#1F2937]">会员专享功能</p>
            <p className="mt-1">{EXPRESSION_PRICING_HINT.vip}</p>
            <Link
              href="/profile?pricing=1"
              className="mt-2 inline-block text-[12px] font-bold text-[#FF4F8B]"
            >
              开通 Pro 会员 →
            </Link>
          </div>
        ) : null}

        <GradientButton className="w-full" onClick={() => void onGenerate()}>
          {loading ? "生成中…" : needsVip ? "会员解锁后生成" : "一键生成"}
        </GradientButton>

        {result ? (
          <CreamCard className="p-4">
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">{result}</p>
            {Object.entries(extras).map(([k, v]) =>
              v ? (
                <div key={k} className="mt-3 border-t border-[#FFF0F5] pt-2">
                  <p className="text-[10px] font-bold text-[#FF4F8B]">{k}</p>
                  <p className="text-[12px] text-[#374151]">{v}</p>
                </div>
              ) : null
            )}
            <button
              type="button"
              className="mt-3 text-[12px] font-bold text-[#FF4F8B]"
              onClick={() => result && void navigator.clipboard?.writeText(result)}
            >
              复制全部
            </button>
          </CreamCard>
        ) : null}
      </div>
    </AppShell>
  );
}
