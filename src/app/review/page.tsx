"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BarChart3, RefreshCw, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { ReviewScoreMeter } from "@/components/review/review-score-meter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { PLATFORM_VALUES, TRACK_VALUES } from "@/lib/i18n/form-options";
import { QUOTA_COST } from "@/lib/constants/v1";
import { DemoContentBadge } from "@/components/ui/demo-content-badge";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { HintTip } from "@/components/ui/hint-tip";
import { heatBadgeClass } from "@/lib/content/heat-level";
import {
  REVIEW_DATA_TIERS,
  REVIEW_LOADING_LINES,
  calcEngagementRate,
  engagementFunLabel,
  getDailyReviewTitleItems,
  getTierById,
  scoreFunBadge,
  scoreLabel,
  type ReviewTitleIdea,
} from "@/lib/review/presets";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const REVIEW_PLATFORMS = PLATFORM_VALUES.slice(0, 4);

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function ReviewInner() {
  const params = useSearchParams();
  const tab = params.get("tab") ?? "review";
  const { tr, showToast } = useApp();
  const { saveReview, growth } = useProduct();
  const { run, busy } = useAsyncAction();
  const [title, setTitle] = useState("");
  const [views, setViews] = useState("1200");
  const [likes, setLikes] = useState("86");
  const [platform, setPlatform] = useState<string>(REVIEW_PLATFORMS[0]);
  const [track, setTrack] = useState<string>(TRACK_VALUES[3]);
  const [tierId, setTierId] = useState<string>("good");
  const [titleBatch, setTitleBatch] = useState(0);
  const [loadingLine, setLoadingLine] = useState(0);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [contentDemo, setContentDemo] = useState(false);
  const [socialCount, setSocialCount] = useState(() => getTodayInspirationCount());
  const reviewCost = QUOTA_COST.review ?? 2;

  const titleIdeas = useMemo(
    () => getDailyReviewTitleItems(todayKey(), titleBatch, 8),
    [titleBatch]
  );
  const featuredTitle = titleIdeas.find((item) => item.heat === "爆") ?? titleIdeas[0];
  const viewsNum = Number(views) || 0;
  const likesNum = Number(likes) || 0;
  const engagement = calcEngagementRate(viewsNum, likesNum);
  const selectedTier = getTierById(tierId);
  const engagementHint = engagementFunLabel(engagement);
  const formStep = !title.trim() ? 1 : viewsNum > 0 ? 3 : 2;
  const isStepComplete = (i: number) => {
    if (i === 0) return Boolean(title.trim());
    if (i === 1) return viewsNum > 0;
    return false;
  };

  useEffect(() => {
    if (!busy) return;
    const id = window.setInterval(() => {
      setLoadingLine((i) => (i + 1) % REVIEW_LOADING_LINES.length);
    }, 900);
    return () => window.clearInterval(id);
  }, [busy]);

  useEffect(() => {
    const tick = () => setSocialCount(getTodayInspirationCount());
    tick();
    const id = window.setInterval(tick, msUntilNextInspirationTick());
    return () => window.clearInterval(id);
  }, []);

  const onReview = () =>
    void run(async () => {
      if (!title.trim()) {
        showToast(tr("reviewInputPlaceholder"));
        return;
      }
      const r = await saveReview({
        title: title.trim(),
        views: viewsNum,
        likes: likesNum,
        platform,
        track,
      });
      if (r) {
        const row = r as Record<string, unknown> & { usedMock?: boolean };
        setContentDemo(Boolean(row.usedMock));
        setResult(row);
        showToast(tr("reviewDone"));
        setTimeout(() => {
          document.getElementById("review-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else showToast(tr("generateFailed"));
    });

  const pickTier = useCallback((id: string, v: number, l: number) => {
    setTierId(id);
    setViews(String(v));
    setLikes(String(l));
    setResult(null);
  }, []);

  const pickTitle = (item: ReviewTitleIdea) => {
    setTitle(item.title);
    if (item.suggestTrack) setTrack(item.suggestTrack);
    setResult(null);
    showToast(tr("reviewTitleApplied"));
  };

  if (tab === "weekly") {
    return (
      <AppShell>
        <SectionTitle
          title={tr("weeklyReport")}
          desc={tr("weeklyReportDesc")}
          eyebrow="📊"
        />

        <div className="mb-3 flex gap-2">
          <Link
            href="/review"
            className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-orange-100"
          >
            {tr("reviewTabSingle")}
          </Link>
          <Link
            href="/review?tab=weekly"
            className="rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-1.5 text-[10px] font-black text-white shadow-sm"
          >
            {tr("reviewTabWeekly")}
          </Link>
        </div>

        <Card className="overflow-hidden border-[#FF7AAE]/25 shadow-[0_8px_28px_rgba(255,122,174,0.12)]">
          <div className="bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-4 py-3.5 text-white">
            <p className="text-sm font-black">{tr("reviewWeeklyHero")}</p>
            <p className="mt-1 text-[10px] text-white/90">
              Lv.{growth.level.name} · 连续 {growth.streakDays} 天打卡
            </p>
          </div>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "完成任务", value: `${growth.tasksDone.length}`, emoji: "✅" },
                { label: "成长值", value: String(growth.xp), emoji: "⚡" },
                { label: "连续天数", value: `${growth.streakDays}天`, emoji: "🔥" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-gradient-to-b from-white to-orange-50/60 py-3 text-center ring-1 ring-orange-100"
                >
                  <div className="text-xl">{s.emoji}</div>
                  <div className="text-base font-black text-[#FF5C8A]">{s.value}</div>
                  <div className="text-[9px] font-medium text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-4 rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-amber-50 px-3 py-3 text-xs font-semibold leading-relaxed text-slate-700 ring-1 ring-[#FF7AAE]/15">
              📌 {tr("reviewWeeklyAdvice")}：保持「痛点+反常识」选题，连发 3 条同系列内容，别天天换方向。
            </p>
            <Link
              href="/review"
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white",
                `bg-gradient-to-r ${theme.primary}`
              )}
            >
              <BarChart3 size={16} />
              去复盘刚发的一条
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const score = result ? Number(result.performanceScore) : 0;
  const label = scoreLabel(score);

  return (
    <AppShell>
      <div className="page-flow-stagger">
        <SectionTitle
          title={tr("reviewTitle")}
          desc={tr("reviewDesc")}
          eyebrow="📝"
        />

        <Card className="play-section-enter mb-3 overflow-hidden border-[#FF7AAE]/30 shadow-[0_8px_28px_rgba(255,122,174,0.15)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-4 py-3.5 text-white">
            <span
              className="library-hero-shine pointer-events-none absolute -right-8 top-0 h-20 w-20 rounded-full bg-white/20 blur-2xl"
              aria-hidden
            />
            <p className="relative inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black backdrop-blur-sm">
              {tr("reviewHeroTag")}
            </p>
            <p className="relative mt-2 text-[11px] font-semibold text-white/95">
              {tr("reviewSocialProof").replace("{count}", formatInspirationCount(socialCount))}
            </p>
            <div className="relative mt-3 flex gap-2">
              {[tr("reviewStep1"), tr("reviewStep2"), tr("reviewStep3")].map((step, i) => (
                <span
                  key={step}
                  className={cn(
                    "review-hero-step flex flex-1 items-center justify-center gap-1 rounded-xl py-1.5 text-[9px] font-bold backdrop-blur-sm transition",
                    formStep === i + 1
                      ? "bg-white/25 ring-2 ring-white/50"
                      : isStepComplete(i)
                        ? "bg-white/30 ring-1 ring-white/40"
                        : "bg-white/15"
                  )}
                >
                <span
                  className={cn(
                    "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                    isStepComplete(i) ? "bg-white font-black text-[#FF5C8A]" : "bg-white/30"
                  )}
                >
                  {isStepComplete(i) ? "✓" : i + 1}
                </span>
                {step}
              </span>
              ))}
            </div>
          </div>
        </Card>

        <div className="mb-3 flex gap-2">
        <Link
          href="/review"
          className="rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-1.5 text-[10px] font-black text-white shadow-sm"
        >
          {tr("reviewTabSingle")}
        </Link>
        <Link
          href="/review?tab=weekly"
          className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-slate-500 ring-1 ring-orange-100"
        >
          {tr("reviewTabWeekly")}
        </Link>
        </div>

        {!result ? (
          <div className="cream-card play-section-enter space-y-3 rounded-[28px] p-4 ring-1 ring-orange-100/60">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF7AAE] to-[#FFC46B] shadow-sm">
              <BarChart3 size={18} className="text-white" />
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">{tr("reviewCardTitle")}</p>
              <p className="text-[10px] text-slate-500">{tr("reviewCardSub")}</p>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-slate-600">{tr("reviewTitleIdeas")}</p>
                <p className="text-[9px] text-slate-500">{tr("reviewTitleIdeasSub")}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTitleBatch((b) => b + 1);
                  showToast(tr("reviewTitleShuffleDone"));
                }}
                className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-[#FF7AAE] transition active:scale-95 hover:bg-[#FFF0F5]"
              >
                <RefreshCw size={12} className="play-icon-wiggle" />
                {tr("reviewTitleShuffle")}
              </button>
            </div>

            {featuredTitle ? (
              <button
                type="button"
                onClick={() => pickTitle(featuredTitle)}
                className="mb-2 w-full rounded-2xl border border-[#FF7AAE]/35 bg-gradient-to-r from-[#FFF0F5] to-orange-50 p-3 text-left active:scale-[0.99]"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[9px] font-black text-[#FF5C8A]">
                      🔥 {tr("reviewFeaturedTitle")}
                    </p>
                    <p className="mt-1 text-xs font-black leading-snug text-slate-800">
                      {featuredTitle.title}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black",
                      heatBadgeClass(featuredTitle.heat)
                    )}
                  >
                    {featuredTitle.heat}
                  </span>
                </div>
              </button>
            ) : null}

            <div key={titleBatch} className="max-h-[120px] space-y-1 overflow-y-auto overscroll-contain rounded-xl border border-orange-100/80 bg-white/70 p-1.5">
              {titleIdeas.map((idea, i) => (
                <button
                  key={idea.title}
                  type="button"
                  onClick={() => pickTitle(idea)}
                  style={{ animationDelay: `${i * 0.04}s` }}
                  className={cn(
                    "review-chip-item flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left transition active:scale-[0.99]",
                    title === idea.title
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-sm"
                      : "bg-white/95 text-slate-600 ring-1 ring-orange-100/80"
                  )}
                >
                  <span className="flex-1 text-[10px] font-semibold leading-snug">{idea.title}</span>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-1.5 py-0.5 text-[8px] font-black",
                      title === idea.title ? "bg-white/25 text-white" : heatBadgeClass(idea.heat)
                    )}
                  >
                    {idea.heat}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-600">
              ✏️ {tr("reviewInputLabel")}
            </label>
            <input
              className="w-full rounded-2xl border-0 bg-white/95 px-3 py-2.5 text-sm ring-2 ring-[#FF7AAE]/25 outline-none focus:ring-[#FF7AAE]/45"
              placeholder={tr("reviewInputPlaceholder")}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">{tr("reviewPlatform")}</p>
            <div className="flex flex-wrap gap-1.5">
              {REVIEW_PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 active:scale-95",
                    platform === p
                      ? "bg-[#FFF0F5] text-[#FF5C8A] ring-[#FF7AAE]/40"
                      : "bg-white/90 text-slate-600 ring-orange-100"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">{tr("reviewTrackLabel")}</p>
            <div className="flex flex-wrap gap-1.5">
              {TRACK_VALUES.slice(0, 6).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTrack(t)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 active:scale-95",
                    track === t
                      ? "bg-[#FFF0F5] text-[#FF5C8A] ring-[#FF7AAE]/40"
                      : "bg-white/90 text-slate-600 ring-orange-100"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11px] font-bold text-slate-600">{tr("reviewTierPick")}</p>
            <div className="grid grid-cols-2 gap-2">
              {REVIEW_DATA_TIERS.map((tier) => {
                const selected = tierId === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => pickTier(tier.id, tier.views, tier.likes)}
                    className={cn(
                      "review-tier-pick rounded-2xl p-2.5 text-left ring-2",
                      selected
                        ? "bg-gradient-to-br from-[#FFF0F5] to-orange-50 ring-[#FF7AAE]/50 shadow-sm"
                        : "bg-white/95 ring-orange-100/80"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">{tier.emoji}</span>
                      <span className="text-xs font-black text-slate-800">{tier.label}</span>
                    </div>
                    <p className="mt-0.5 text-[10px] font-bold text-[#FF5C8A]">
                      {tier.views.toLocaleString()}播 · {tier.likes}赞
                    </p>
                    <p className="mt-0.5 line-clamp-1 text-[9px] text-slate-500">{tier.hint}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedTier ? (
            <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-amber-50/50 px-3 py-2 ring-1 ring-[#FF7AAE]/15">
              <p className="text-[10px] font-black text-[#FF5C8A]">
                {selectedTier.emoji} {tr("reviewTierCheer")}：{selectedTier.cheer}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-600">{selectedTier.hint}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500">
                {tr("reviewViews")}
              </label>
              <input
                type="number"
                className="w-full rounded-2xl border-0 bg-white/95 px-3 py-2.5 text-center text-lg font-black text-[#FF5C8A] ring-2 ring-orange-100 outline-none focus:ring-[#FF7AAE]/35"
                value={views}
                onChange={(e) => {
                  setViews(e.target.value);
                  setResult(null);
                }}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-bold text-slate-500">
                {tr("reviewLikes")}
              </label>
              <input
                type="number"
                className="w-full rounded-2xl border-0 bg-white/95 px-3 py-2.5 text-center text-lg font-black text-[#FF5C8A] ring-2 ring-orange-100 outline-none focus:ring-[#FF7AAE]/35"
                value={likes}
                onChange={(e) => {
                  setLikes(e.target.value);
                  setResult(null);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#FFF0F5]/80 to-amber-50/60 px-3 py-2 ring-1 ring-[#FF7AAE]/10">
            <div>
              <span className="text-[10px] font-bold text-slate-600">{tr("reviewEngagement")}</span>
              <p className="text-[9px] text-slate-400">{tr("reviewEngagementHint")}</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-[#FF5C8A]">{engagement}%</span>
              <p className="text-[10px] font-bold text-slate-600">
                {engagementHint.emoji} {engagementHint.text}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <QuotaCostBadge cost={reviewCost} />
            <HintTip
              title={tr("featReviewCard")}
              body={tr("reviewQuotaHint")}
              okLabel={tr("profileHintOk")}
              ariaLabel={tr("profileHintAria")}
            />
          </div>

          <button
            type="button"
            disabled={busy || !title.trim()}
            className={cn(
              "banner-cta-breathe flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl py-3.5",
              "bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B] text-white shadow-[0_8px_24px_rgba(255,107,107,0.35)]",
              "disabled:opacity-50"
            )}
            onClick={onReview}
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <TrendingUp size={18} />
              {busy ? REVIEW_LOADING_LINES[loadingLine] : tr("reviewBtn")}
            </span>
            <span className="text-[9px] font-semibold text-white/90">{tr("reviewBtnSub")}</span>
          </button>
          </div>
        ) : (
          <div id="review-result" className="review-result-reveal space-y-3">
          <div className="flex justify-end">
            <DemoContentBadge show={contentDemo} label={tr("demoContentLabel")} />
          </div>
          <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-orange-100/80">
            <div
              className={cn(
                "px-4 py-4 text-white",
                score >= 80
                  ? "bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400"
                  : score >= 60
                    ? "bg-gradient-to-r from-[#FF9A6B] via-[#FF7AAE] to-[#FFC46B]"
                    : "bg-gradient-to-r from-slate-400 to-slate-500"
              )}
            >
              <ReviewScoreMeter
                score={score}
                label={`${scoreFunBadge(score)} ${label}`}
                title={title.trim() || "未命名内容"}
              />
              {typeof result.engagementRate === "number" ? (
                <p className="mt-2 text-[10px] font-bold text-white/85">
                  {tr("reviewEngagement")} {result.engagementRate}%
                </p>
              ) : null}
            </div>
            <div className="space-y-2 bg-white p-4 text-sm leading-relaxed text-slate-700">
              <p>{displayField(result.summary)}</p>
              {(result.problems as string[])?.length ? (
                <div className="rounded-2xl bg-orange-50/70 p-3 text-xs">
                  <p className="mb-1 font-bold text-[#FF7AAE]">{tr("reviewImprove")}</p>
                  <ul className="list-disc space-y-0.5 pl-4">
                    {(result.problems as string[]).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="rounded-2xl bg-[#FFF0F5]/60 p-3 ring-1 ring-[#FF7AAE]/10">
                <p className="text-[10px] font-black text-[#FF7AAE]">{tr("reviewNextTip")}</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">
                  {displayField(result.nextSuggestion)}
                </p>
                <p className="mt-2 text-[10px] text-slate-500">
                  推荐选题：{displayField(result.nextTopic)}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={`/publish-pack?topic=${encodeURIComponent(displayField(result.nextTopic, ""))}`}
            className={cn(
              "flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-md",
              `bg-gradient-to-r ${theme.primary}`
            )}
          >
            <Sparkles size={18} />
            {tr("reviewNextPack")}
          </Link>
          <Button variant="secondary" className="w-full" onClick={() => setResult(null)}>
            {tr("reviewAgain")}
          </Button>
        </div>
        )}
      </div>
    </AppShell>
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
