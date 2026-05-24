"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { ReviewResultDetail } from "@/components/review/review-result-detail";
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
import { REVIEW_DEMO_RESULT } from "@/lib/review/result-shape";
import { cn } from "@/lib/utils";

const METRIC_FIELDS = [
  { key: "views", label: "播放量" },
  { key: "likes", label: "点赞数" },
  { key: "comments", label: "评论数" },
  { key: "saves", label: "收藏数" },
  { key: "shares", label: "转发数" },
  { key: "completionRate", label: "完播率 %" },
] as const;

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const tab = params.get("tab") ?? "review";
  const { tr, showToast } = useApp();
  const { saveReview } = useProduct();
  const { run, busy } = useAsyncAction();
  const reviewCost = QUOTA_COST.review ?? 40;

  const [platform, setPlatform] = useState("抖音");
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
        showToast("请填写视频标题");
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
      <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#FFE8F0] bg-[#FFF4F7]/95 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="flex-1 text-base font-black text-[#1F2937]">{tr("reviewTitle")}</h1>
        <Link href="/history?filter=review" className="text-[11px] font-bold text-[#FF4F8B]">
          历史记录
        </Link>
      </div>

      <div className="space-y-4 px-4 pb-32 pt-4">
        <div className="rounded-[20px] bg-gradient-to-r from-violet-50 to-[#FFF0F5] p-4 ring-1 ring-violet-100">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 text-[12px] font-black text-violet-700">
                <Sparkles size={14} />
                AI 帮你看数据表现，找到改进方向
              </p>
              <p className="mt-1 text-[10px] font-bold text-violet-600/80">
                每次复盘消耗 {reviewCost} 灵感 →
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowDemo(true);
                setResult(null);
              }}
              className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-violet-600 ring-1 ring-violet-200"
            >
              复盘示例
            </button>
          </div>
        </div>

        {!result ? (
          <div className="cream-card space-y-4 rounded-[24px] p-4 ring-1 ring-[#FFE8F0]">
            <PlatformIconRow value={platform} onChange={setPlatform} step={1} title="选择平台" />

            <section>
              <p className="mb-2 text-[12px] font-black text-[#1F2937]">
                <span className="mr-1 text-[#FF4F8B]">2.</span>
                输入视频数据
              </p>
              <label className="mb-1 block text-[10px] font-bold text-[#8A94A6]">视频标题</label>
              <input
                className="mb-3 w-full rounded-xl bg-white px-3 py-2.5 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                placeholder="例如：下班后的治愈时刻"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="mb-1 block text-[10px] font-bold text-[#8A94A6]">视频内容简介</label>
              <input
                className="mb-3 w-full rounded-xl bg-white px-3 py-2.5 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                placeholder="一句话描述视频讲了什么"
                value={contentIntro}
                onChange={(e) => setContentIntro(e.target.value)}
              />

              <div className="grid grid-cols-3 gap-2">
                {METRIC_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label className="mb-1 block text-[9px] font-bold text-[#8A94A6]">{f.label}</label>
                    <input
                      type="number"
                      className="w-full rounded-xl bg-white px-2 py-2 text-center text-[12px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0] outline-none"
                      value={metrics[f.key]}
                      onChange={(e) =>
                        setMetrics((m) => ({ ...m, [f.key]: e.target.value }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-[#8A94A6]">发布时间</label>
                  <select
                    className="w-full rounded-xl bg-white px-2 py-2.5 text-[11px] ring-1 ring-[#FFE8F0] outline-none"
                    value={publishTime}
                    onChange={(e) => setPublishTime(e.target.value)}
                  >
                    {PUBLISH_TIME_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold text-[#8A94A6]">账号类型</p>
                  <select
                    className="w-full rounded-xl bg-white px-2 py-2.5 text-[11px] ring-1 ring-[#FFE8F0] outline-none"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                  >
                    {ACCOUNT_TYPE_VALUES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className="flex justify-center">
              <QuotaCostBadge cost={reviewCost} />
            </div>

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
                {busy ? "AI 分析中…" : "开始 AI 复盘分析"}
              </span>
              <span className="text-[9px] font-semibold text-white/90">消耗 {reviewCost} 灵感</span>
            </button>
          </div>
        ) : (
          <div id="review-result" className="space-y-3">
            <div className="flex justify-end">
              <DemoContentBadge show={contentDemo} label={tr("demoContentLabel")} />
            </div>
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
          </div>
        )}

        {!result && showDemo ? (
          <ReviewResultDetail
            result={REVIEW_DEMO_RESULT}
            title="下班后的治愈时刻"
            demo
          />
        ) : null}
      </div>
    </AppShell>
  );
}

function SectionPlaceholder({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="p-4">
      <button type="button" onClick={onBack} className="mb-4 text-sm font-bold text-[#FF4F8B]">
        ← 返回单条复盘
      </button>
      <p className="font-black">{title}</p>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          加载中…
        </div>
      }
    >
      <ReviewInner />
    </Suspense>
  );
}
