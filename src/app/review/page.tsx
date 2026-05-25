"use client";

import { Suspense, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewResultDetail } from "@/components/review/review-result-detail";
import { ReviewDataTierPicker } from "@/components/review/review-data-tier-picker";
import { ReviewTitleIdeas } from "@/components/review/review-title-ideas";
import { StepChipGrid } from "@/components/v1/step-chip-grid";
import { PlatformIconRow } from "@/components/v1/platform-icon-row";
import { DemoContentBadge } from "@/components/ui/demo-content-badge";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { QUOTA_COST } from "@/lib/constants/v1";
import {
  ACCOUNT_TYPE_VALUES,
  PUBLISH_TIME_OPTIONS,
} from "@/lib/i18n/publish-form-options";
import { CONTENT_INTRO_PRESETS } from "@/lib/review/content-intro-presets";
import { REVIEW_DEMO_RESULT } from "@/lib/review/result-shape";
import { cn } from "@/lib/utils";

const METRIC_FIELDS = [
  { key: "views", label: "\u64ad\u653e\u91cf" },
  { key: "likes", label: "\u70b9\u8d5e\u6570" },
  { key: "comments", label: "\u8bc4\u8bba\u6570" },
  { key: "saves", label: "\u6536\u85cf\u6570" },
  { key: "shares", label: "\u8f6c\u53d1\u6570" },
  { key: "completionRate", label: "\u5b8c\u64ad\u7387 %" },
] as const;

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "review";
  const { tr, showToast } = useApp();
  const { saveReview } = useProduct();
  const { run, busy } = useAsyncAction();
  const reviewCost = QUOTA_COST.review ?? 40;

  const [platform, setPlatform] = useState("\u6296\u97f3");
  const [accountType, setAccountType] = useState<string>(ACCOUNT_TYPE_VALUES[0]);
  const [publishTime, setPublishTime] = useState<string>(PUBLISH_TIME_OPTIONS[3]);
  const [title, setTitle] = useState("");
  const [contentIntro, setContentIntro] = useState("");
  const [metrics, setMetrics] = useState<Record<string, string>>({
    views: "1200",
    likes: "86",
    comments: "24",
    saves: "52",
    shares: "8",
    completionRate: "38",
  });
  const [tierId, setTierId] = useState("good");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [contentDemo, setContentDemo] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  if (tab === "weekly") {
    return (
      <AppShell>
        <SectionPlaceholder title={tr("weeklyReport")} onBack={() => router.push("/review")} />
      </AppShell>
    );
  }

  const onReview = () =>
    void run(async () => {
      if (!title.trim()) {
        showToast("\u8bf7\u586b\u5199\u89c6\u9891\u6807\u9898");
        return;
      }
      const r = await saveReview({
        title: title.trim(),
        contentIntro: contentIntro.trim(),
        views: Number(metrics.views) || 0,
        likes: Number(metrics.likes) || 0,
        comments: Number(metrics.comments) || 0,
        saves: Number(metrics.saves) || 0,
        shares: Number(metrics.shares) || 0,
        completionRate: Number(metrics.completionRate) || 0,
        platform,
        track: accountType,
        accountType,
        publishTime,
      });
      if (r) {
        setContentDemo(Boolean((r as { usedMock?: boolean }).usedMock));
        setResult(r as Record<string, unknown>);
        setShowDemo(false);
        showToast(tr("reviewDone"));
        setTimeout(() => {
          document.getElementById("review-result")?.scrollIntoView({ behavior: "smooth" });
        }, 120);
      } else {
        showToast(tr("generateFailed"));
      }
    });

  return (
    <AppShell showHeader={false}>
      <Wrapper className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#FFE8F0] bg-[#FFF4F7]/95 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-base font-black text-[#1F2937]">{tr("reviewTitle")}</h1>
        <Link href="/history?filter=review" className="text-[11px] font-bold text-[#FF4F8B]">
          {"\u5386\u53f2\u8bb0\u5f55"}
        </Link>
      </Wrapper>

      <Wrapper className="space-y-4 px-4 pb-32 pt-4">
        <Wrapper className="overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-500/10 via-[#FFF0F5] to-orange-50 p-4 ring-1 ring-violet-100">
          <Wrapper className="flex items-start justify-between gap-2">
            <Wrapper>
              <p className="flex items-center gap-1.5 text-[13px] font-black text-violet-800">
                <Sparkles size={15} className="text-violet-600" />
                {"3 \u5206\u949f\u770b\u61c2\u6570\u636e\uff0c\u627e\u5230\u4e0b\u4e00\u6761\u600e\u4e48\u6539"}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-violet-700/80">
                {"AI \u8bca\u65ad\u6807\u9898\u3001\u8282\u594f\u3001\u4e92\u52a8\uff0c\u5e76\u7ed9\u51fa\u4e0b\u4e00\u6761\u9009\u9898\u5efa\u8bae"}
              </p>
              <Wrapper className="mt-2 flex flex-wrap gap-1.5">
                {["\u6807\u9898\u8bca\u65ad", "\u8282\u594f\u5206\u6790", "\u4e0b\u6761\u5efa\u8bae"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-white/80 px-2 py-0.5 text-[9px] font-bold text-violet-600 ring-1 ring-violet-100"
                  >
                    {t}
                  </span>
                ))}
              </Wrapper>
            </Wrapper>
            <button
              type="button"
              onClick={() => {
                setShowDemo(true);
                setResult(null);
              }}
              className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 ring-1 ring-violet-200 shadow-sm"
            >
              {"\u770b\u793a\u4f8b"}
            </button>
          </Wrapper>
        </Wrapper>

        {!result ? (
          <Wrapper className="cream-card space-y-4 rounded-[24px] p-4 ring-1 ring-[#FFE8F0]">
            <PlatformIconRow
              value={platform}
              onChange={setPlatform}
              step={1}
              hint={"\u4e0d\u540c\u5e73\u53f0\u7b97\u6cd5\u504f\u597d\u4e0d\u540c\uff0c\u9009\u5bf9\u590d\u76d8\u66f4\u51c6"}
            />

            <ReviewTitleIdeas
              onPick={(t) => {
                setTitle(t);
                showToast(tr("reviewTitleApplied"));
              }}
            />

            <section>
              <p className="mb-2 text-[12px] font-black text-[#1F2937]">
                <span className="mr-1 text-[#FF4F8B]">2.</span>
                {"\u4f60\u7684\u89c6\u9891\u5927\u6982\u4ec0\u4e48\u6c34\u5e73\uff1f"}
              </p>
              <p className="mb-2 text-[10px] text-[#8A94A6]">
                {"\u70b9\u9009\u6863\u4f4d\uff0c\u81ea\u52a8\u586b\u6570\u636e\uff08\u4e5f\u53ef\u624b\u52a8\u6539\uff09"}
              </p>
              <ReviewDataTierPicker
                value={tierId}
                onChange={(id, m) => {
                  setTierId(id);
                  setMetrics(m);
                }}
              />
            </section>

            <section>
              <p className="mb-2 text-[12px] font-black text-[#1F2937]">
                <span className="mr-1 text-[#FF4F8B]">3.</span>
                {"\u786e\u8ba4\u89c6\u9891\u4fe1\u606f"}
              </p>
              <label className="mb-1 block text-[10px] font-bold text-[#8A94A6]">{"\u89c6\u9891\u6807\u9898"}</label>
              <input
                className="mb-3 w-full rounded-xl bg-white px-3 py-2.5 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                placeholder={"\u4f8b\u5982\uff1a\u4e0b\u73ed\u540e\u7684\u6cbb\u6108\u65f6\u523b"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <p className="mb-1.5 text-[10px] font-bold text-[#8A94A6]">
                {"\u89c6\u9891\u8bb2\u4e86\u4ec0\u4e48\uff1f\uff08\u70b9\u9009\u6216\u81ea\u586b\uff09"}
              </p>
              <Wrapper className="mb-2 flex flex-wrap gap-1.5">
                {CONTENT_INTRO_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setContentIntro(p.text)}
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 active:scale-[0.98]",
                      contentIntro === p.text
                        ? "bg-[#FF4F8B] text-white ring-[#FF4F8B]"
                        : "bg-[#FFF0F5] text-[#FF4F8B] ring-[#FFD0E8]"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </Wrapper>
              <input
                className="mb-3 w-full rounded-xl bg-white px-3 py-2.5 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                placeholder={"\u4e00\u53e5\u8bdd\u63cf\u8ff0\u89c6\u9891\u5185\u5bb9"}
                value={contentIntro}
                onChange={(e) => setContentIntro(e.target.value)}
              />

              <Wrapper className="grid grid-cols-3 gap-2">
                {METRIC_FIELDS.map((f) => (
                  <Wrapper key={f.key}>
                    <label className="mb-1 block text-[9px] font-bold text-[#8A94A6]">{f.label}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl bg-white px-2 py-2 text-center text-[12px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0] outline-none"
                      value={metrics[f.key]}
                      onChange={(e) =>
                        setMetrics((m) => ({ ...m, [f.key]: e.target.value }))
                      }
                    />
                  </Wrapper>
                ))}
              </Wrapper>
            </section>

            <StepChipGrid
              step={4}
              title={"\u8d26\u53f7\u7c7b\u578b"}
              options={ACCOUNT_TYPE_VALUES}
              value={accountType}
              onChange={setAccountType}
              columns={4}
            />

            <section>
              <p className="mb-2 text-[12px] font-black text-[#1F2937]">
                <span className="mr-1 text-[#FF4F8B]">5.</span>
                {"\u53d1\u5e03\u65f6\u95f4"}
              </p>
              <Wrapper className="flex flex-wrap gap-1.5">
                {PUBLISH_TIME_OPTIONS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setPublishTime(t)}
                    className={cn(
                      "rounded-full px-2.5 py-1.5 text-[10px] font-bold ring-1",
                      publishTime === t
                        ? "bg-[#FFF0F5] text-[#FF4F8B] ring-[#FF4F8B]/40"
                        : "bg-white text-[#5A6478] ring-[#FFE8F0]"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </Wrapper>
            </section>

            <Wrapper className="flex justify-center">
              <QuotaCostBadge cost={reviewCost} />
            </Wrapper>

            <button
              type="button"
              disabled={busy || !title.trim()}
              onClick={onReview}
              className={cn(
                "flex w-full flex-col items-center gap-0.5 rounded-2xl py-3.5 text-white",
                "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] shadow-[0_8px_24px_rgba(255,79,139,0.35)] disabled:opacity-50"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-black">
                <TrendingUp size={18} />
                {busy ? "AI \u5206\u6790\u4e2d\u2026" : "\u5f00\u59cb AI \u590d\u76d8\u5206\u6790"}
              </span>
              <span className="text-[9px] font-semibold text-white/90">
                {"\u6d88\u8017 "}
                {reviewCost}
                {" \u7075\u611f"}
              </span>
            </button>
          </Wrapper>
        ) : (
          <Wrapper id="review-result" className="space-y-3">
            <Wrapper className="flex justify-end">
              <DemoContentBadge show={contentDemo} label={tr("demoContentLabel")} />
            </Wrapper>
            <ReviewResultDetail result={result} title={title.trim()} />
            <button
              type="button"
              onClick={() => {
                setResult(null);
                setShowDemo(false);
              }}
              className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-[#5A6478] ring-1 ring-[#FFE8F0]"
            >
              {tr("reviewAgain")}
            </button>
          </Wrapper>
        )}

        {!result && showDemo ? (
          <ReviewResultDetail result={REVIEW_DEMO_RESULT} title="下班后的治愈时刻" demo />
        ) : null}
      </Wrapper>
    </AppShell>
  );
}

function Wrapper({
  className,
  id,
  children,
}: {
  className?: string;
  id?: string;
  children: ReactNode;
}) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}

function SectionPlaceholder({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <Wrapper className="p-4">
      <button type="button" onClick={onBack} className="mb-4 text-sm font-bold text-[#FF4F8B]">
        {"\u2190 \u8fd4\u56de\u5355\u6761\u590d\u76d8"}
      </button>
      <p className="font-black">{title}</p>
    </Wrapper>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <Wrapper className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          {"\u52a0\u8f7d\u4e2d\u2026"}
        </Wrapper>
      }
    >
      <ReviewInner />
    </Suspense>
  );
}
