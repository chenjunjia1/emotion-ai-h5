"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Copy,
  Dices,
  Flame,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { CreateWorkshopHero } from "@/components/create/create-workshop-hero";
import { SectionTitle } from "@/components/section-title";
import { WorkshopTabs } from "@/components/play/workshop-tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { QUOTA_COST } from "@/lib/constants/v1";
import {
  getDailyReplyComments,
  TAB_META,
  VIRAL_PRESETS,
  SCORE_PRESETS,
} from "@/lib/create/workshop-scenarios";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type WorkshopTab = "pack" | "reply" | "viral" | "score";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function CreateInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { tr, generateViral, showToast, user } = useApp();
  const { generateReplies, scoreContent } = useProduct();
  const { run, busy } = useAsyncAction();
  const [tab, setTab] = useState<WorkshopTab>("reply");
  const [comment, setComment] = useState("");
  const [scenarioBatch, setScenarioBatch] = useState(0);
  const [scoreTitle, setScoreTitle] = useState("");
  const [scoreScript, setScoreScript] = useState("");
  const [viralTitle, setViralTitle] = useState<string>(VIRAL_PRESETS[0].title);
  const [viralCopy, setViralCopy] = useState<string>(VIRAL_PRESETS[0].copy);
  const [replyResult, setReplyResult] = useState<Record<string, unknown> | null>(null);
  const [scoreResult, setScoreResult] = useState<Record<string, unknown> | null>(null);
  const [viralResult, setViralResult] = useState<Record<string, unknown> | null>(null);
  const [socialCount, setSocialCount] = useState(() => getTodayInspirationCount());

  const replyComments = useMemo(
    () => getDailyReplyComments(todayKey(), scenarioBatch, 8),
    [scenarioBatch]
  );

  useEffect(() => {
    if (!comment && replyComments[0]) setComment(replyComments[0]);
  }, [comment, replyComments]);

  useEffect(() => {
    const tick = () => setSocialCount(getTodayInspirationCount());
    tick();
    const id = window.setInterval(tick, msUntilNextInspirationTick());
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const t = params.get("tab");
    if (t === "reply" || t === "viral" || t === "score" || t === "pack") {
      if (t === "pack") {
        router.replace("/publish-pack");
        return;
      }
      setTab(t);
      setReplyResult(null);
      setScoreResult(null);
      setViralResult(null);
    }
  }, [params, router]);

  const handleTab = (id: WorkshopTab) => {
    if (id === "pack") {
      router.push("/publish-pack");
      return;
    }
    setTab(id);
    setReplyResult(null);
    setScoreResult(null);
    setViralResult(null);
    router.replace(`/create?tab=${id}`, { scroll: false });
  };

  const tabs = [
    { id: "pack" as const, label: tr("tabPublishPack"), icon: Sparkles, emoji: "⚡" },
    { id: "reply" as const, label: tr("tabReply"), icon: MessageCircle, emoji: "💬" },
    { id: "viral" as const, label: tr("tabViral"), icon: Flame, emoji: "🔥" },
    { id: "score" as const, label: tr("tabScore"), icon: Target, emoji: "📈" },
  ];

  const gradientBtn =
    "banner-cta-breathe flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl py-3.5 text-white bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B] shadow-[0_8px_24px_rgba(255,107,107,0.35)] disabled:opacity-50";

  const scrollToResult = () => {
    setTimeout(() => {
      document.getElementById("create-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const copyReply = useCallback(
    (text: string) => {
      void copyToClipboard(text);
      showToast(tr("copied"));
    },
    [showToast, tr]
  );

  const pickViral = (p: (typeof VIRAL_PRESETS)[number]) => {
    setViralTitle(p.title);
    setViralCopy(p.copy);
    setViralResult(null);
  };

  const pickScore = (p: (typeof SCORE_PRESETS)[number]) => {
    setScoreTitle(p.title);
    setScoreScript(p.script);
    setScoreResult(null);
  };

  return (
    <AppShell>
      <SectionTitle eyebrow="✨" title={tr("createTitle")} desc={tr("createDesc")} />

      {tab !== "pack" ? (
        <CreateWorkshopHero tr={tr} tab={tab} socialCount={socialCount} user={user} />
      ) : null}

      <WorkshopTabs tabs={tabs} active={tab} onChange={handleTab} />

      {tab === "reply" && (
        <div className="cream-card play-section-enter space-y-3 rounded-[28px] p-4 ring-1 ring-orange-100/60">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-sm",
                TAB_META.reply.grad
              )}
            >
              💬
            </span>
            <div>
              <p className="text-sm font-black text-slate-800">{tr("replyTitle")}</p>
              <p className="text-[10px] text-slate-500">{tr("createReplyHint")}</p>
            </div>
          </div>

          {comment.trim() ? (
            <div className="rounded-2xl bg-slate-100/90 px-3 py-2.5 ring-1 ring-slate-200/80">
              <p className="text-[9px] font-bold text-slate-500">{tr("createFanPreview")}</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700">
                <span className="mr-1">👤</span>
                {comment.trim()}
              </p>
            </div>
          ) : null}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-[11px] font-bold text-slate-600">{tr("createScenariosTitle")}</p>
              <button
                type="button"
                onClick={() => {
                  setScenarioBatch((b) => b + 1);
                  showToast(tr("createScenariosShuffleDone"));
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#FF7AAE]"
              >
                <Dices size={12} />
                {tr("createScenariosShuffle")}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {replyComments.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setComment(c);
                    setReplyResult(null);
                  }}
                  className={cn(
                    "max-w-full rounded-full px-2.5 py-1 text-[10px] font-semibold transition active:scale-95",
                    comment === c
                      ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-sm"
                      : "bg-white text-slate-600 ring-1 ring-orange-100"
                  )}
                >
                  {c.length > 18 ? `${c.slice(0, 18)}…` : c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">粉丝说了啥？</p>
            <textarea
              className={cn(
                "w-full resize-none rounded-2xl border-0 bg-white/95 p-3 text-sm",
                "ring-2 ring-[#FF7AAE]/25 outline-none focus:ring-[#FF7AAE]/45"
              )}
              rows={3}
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                setReplyResult(null);
              }}
              placeholder="粘贴一条评论…"
            />
          </div>

          <button
            type="button"
            disabled={busy || !comment.trim()}
            className={gradientBtn}
            onClick={() =>
              void run(async () => {
                const r = await generateReplies(comment.trim());
                if (r) {
                  setReplyResult(r as Record<string, unknown>);
                  showToast("神回复已生成 ✨");
                  scrollToResult();
                } else showToast(tr("generateFailed"));
              })
            }
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <MessageCircle size={18} />
              {busy ? tr("loading") : tr("replyBtn")}
            </span>
            <span className="text-[9px] font-semibold text-white/90">
              {tr("createCostBadge").replace("{cost}", String(QUOTA_COST.reply ?? 1))}
            </span>
          </button>

          {(() => {
            const replies = replyResult?.replies as { style: string; text: string }[] | undefined;
            if (!replies?.length) return null;
            return (
              <div id="create-result" className="space-y-2">
                <p className="text-[11px] font-black text-[#FF7AAE]">挑一条发出去 👇</p>
                {replies.map((r, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => copyReply(r.text)}
                    className={cn(
                      "play-entry-enter w-full rounded-2xl p-3 text-left ring-1 transition active:scale-[0.99]",
                      i === 0
                        ? "bg-gradient-to-r from-[#FFF0F5] to-white ring-[#FF7AAE]/35 shadow-sm"
                        : "bg-white/95 ring-orange-100/80"
                    )}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        {i === 0 ? (
                          <span className="rounded-full bg-[#FF5C8A] px-1.5 py-0.5 text-[9px] font-black text-white">
                            {tr("createReplyBest")}
                          </span>
                        ) : null}
                        <span className="rounded-full bg-[#FF7AAE]/15 px-2 py-0.5 text-[10px] font-black text-[#FF7AAE]">
                          {r.style}
                        </span>
                      </span>
                      <span className="text-[10px] font-bold text-[#FF7AAE]">
                        <Copy size={12} className="inline" /> {tr("copy")}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">{r.text}</p>
                  </button>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {tab === "viral" && (
        <div className="cream-card play-section-enter space-y-3 rounded-[28px] p-4 ring-1 ring-orange-100/60">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-sm",
                TAB_META.viral.grad
              )}
            >
              🔥
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">{tr("tabViral")}</p>
              <p className="text-[10px] text-slate-500">{tr("createViralHint")}</p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">{tr("createViralPresets")}</p>
            <div className="flex flex-wrap gap-1.5">
              {VIRAL_PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => pickViral(p)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 active:scale-95",
                    viralTitle === p.title
                      ? "bg-orange-100 text-orange-800 ring-orange-300"
                      : "bg-white text-slate-600 ring-orange-100"
                  )}
                >
                  {p.title.length > 14 ? `${p.title.slice(0, 14)}…` : p.title}
                </button>
              ))}
            </div>
          </div>

          <label className="block text-[11px] font-bold text-slate-600">爆款标题</label>
          <input
            className="w-full rounded-2xl border-0 bg-white/95 px-3 py-2.5 text-sm ring-2 ring-orange-200/50 outline-none focus:ring-[#FF7AAE]/40"
            value={viralTitle}
            onChange={(e) => {
              setViralTitle(e.target.value);
              setViralResult(null);
            }}
          />
          <label className="block text-[11px] font-bold text-slate-600">文案/脚本片段</label>
          <textarea
            className="w-full resize-none rounded-2xl border-0 bg-white/95 p-3 text-sm ring-2 ring-orange-200/50 outline-none focus:ring-[#FF7AAE]/40"
            rows={4}
            value={viralCopy}
            onChange={(e) => {
              setViralCopy(e.target.value);
              setViralResult(null);
            }}
          />
          <button
            type="button"
            className={gradientBtn}
            disabled={busy || !viralTitle.trim()}
            onClick={() =>
              void run(async () => {
                const { result } = await generateViral(viralTitle, viralCopy);
                if (result) {
                  setViralResult(result as Record<string, unknown>);
                  showToast("拆解完成 ✨");
                  scrollToResult();
                }
              })
            }
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <Flame size={18} />
              {busy ? tr("loading") : tr("createViralBtn")}
            </span>
            <span className="text-[9px] font-semibold text-white/90">
              {tr("createCostBadge").replace("{cost}", String(QUOTA_COST.viral ?? 3))}
            </span>
          </button>

          {viralResult ? (
            <div id="create-result" className="space-y-2 text-xs">
              {viralResult.analysis && typeof viralResult.analysis === "object" ? (
                <Card className="border-orange-100/80 bg-orange-50/50">
                  <CardContent className="p-3">
                    <p className="font-black text-orange-700">为什么能爆</p>
                    <p className="mt-1 leading-relaxed text-slate-600">
                      {displayField((viralResult.analysis as Record<string, unknown>).reason)}
                    </p>
                    <p className="mt-2 rounded-xl bg-white/80 px-2 py-1 text-[10px] text-slate-500">
                      钩子：{displayField((viralResult.analysis as Record<string, unknown>).hook)}
                    </p>
                  </CardContent>
                </Card>
              ) : null}
              {(viralResult.scripts as string[])?.slice(0, 3).map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gradient-to-r from-[#FFF0F5]/80 to-white p-3 ring-1 ring-[#FF7AAE]/15"
                >
                  <span className="text-[10px] font-black text-[#FF7AAE]">可复用脚本 {i + 1}</span>
                  <p className="mt-1 leading-relaxed text-slate-700">{s}</p>
                </div>
              ))}
              <Link
                href={`/publish-pack?topic=${encodeURIComponent(viralTitle)}`}
                className="block text-center text-[11px] font-bold text-[#FF7AAE]"
              >
                {tr("createGoPack")}
              </Link>
            </div>
          ) : null}
        </div>
      )}

      {tab === "score" && (
        <div className="cream-card play-section-enter space-y-3 rounded-[28px] p-4 ring-1 ring-violet-100/60">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br text-lg text-white shadow-sm",
                TAB_META.score.grad
              )}
            >
              📈
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">{tr("scoreTitle")}</p>
              <p className="text-[10px] text-slate-500">{tr("createScoreHint")}</p>
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">{tr("createScorePresets")}</p>
            <div className="flex flex-wrap gap-1.5">
              {SCORE_PRESETS.map((p) => (
                <button
                  key={p.title}
                  type="button"
                  onClick={() => pickScore(p)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 active:scale-95",
                    scoreTitle === p.title
                      ? "bg-violet-100 text-violet-800 ring-violet-200"
                      : "bg-white text-slate-600 ring-orange-100"
                  )}
                >
                  {p.title.length > 12 ? `${p.title.slice(0, 12)}…` : p.title}
                </button>
              ))}
            </div>
          </div>

          <input
            className="w-full rounded-2xl border-0 bg-white/95 px-3 py-2.5 text-sm ring-2 ring-violet-200/50 outline-none focus:ring-[#FF7AAE]/35"
            placeholder="标题（可选）"
            value={scoreTitle}
            onChange={(e) => setScoreTitle(e.target.value)}
          />
          <textarea
            className="w-full resize-none rounded-2xl border-0 bg-white/95 p-3 text-sm ring-2 ring-violet-200/50 outline-none focus:ring-[#FF7AAE]/35"
            rows={4}
            placeholder="口播脚本或正文…"
            value={scoreScript}
            onChange={(e) => {
              setScoreScript(e.target.value);
              setScoreResult(null);
            }}
          />
          <button
            type="button"
            className={gradientBtn}
            disabled={busy || !scoreScript.trim()}
            onClick={() =>
              void run(async () => {
                const r = await scoreContent({ title: scoreTitle, script: scoreScript });
                if (r) {
                  setScoreResult(r as Record<string, unknown>);
                  showToast("打分完成 ✨");
                  scrollToResult();
                }
              })
            }
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <TrendingUp size={18} />
              {busy ? tr("loading") : tr("scoreBtn")}
            </span>
            <span className="text-[9px] font-semibold text-white/90">
              {tr("createCostBadge").replace("{cost}", String(QUOTA_COST.score ?? 1))}
            </span>
          </button>

          {scoreResult ? (
            <div
              id="create-result"
              className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-violet-50 p-4 ring-1 ring-[#FF7AAE]/20"
            >
              <p className="text-center text-[10px] font-bold text-[#FF7AAE]">爆款潜力值</p>
              <p className="mt-1 text-center text-5xl font-black text-[#FF5C8A]">
                {displayField(scoreResult.totalScore, "—")}
                <span className="text-lg">分</span>
              </p>
              <div className="mx-auto mt-2 h-2 max-w-[200px] overflow-hidden rounded-full bg-white/60">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#FF7AAE] to-violet-400 transition-all duration-700"
                  style={{
                    width: `${Math.min(100, Number(scoreResult.totalScore) || 0)}%`,
                  }}
                />
              </div>
              <ul className="mt-3 space-y-1 text-left text-[11px] text-slate-600">
                {(scoreResult.tips as string[])?.map((tip, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-[#FF7AAE]">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-center text-[10px] text-slate-400">{tr("scoreProHint")}</p>
            </div>
          ) : null}
        </div>
      )}

      {tab === "pack" && (
        <Link
          href="/publish-pack"
          className={cn(
            "play-section-enter flex flex-col items-center gap-2 rounded-[28px] py-8 text-center text-white",
            `bg-gradient-to-r ${theme.primary}`,
            "shadow-[0_12px_32px_rgba(255,107,107,0.3)]"
          )}
        >
          <Sparkles size={28} className="play-icon-spark" />
          <span className="text-base font-black">{tr("featPublishPack")}</span>
          <span className="text-xs text-white/85">{tr("createPackHint")} →</span>
        </Link>
      )}
    </AppShell>
  );
}

export default function CreatePage() {
  const { tr } = useApp();
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          {tr("loading")}
        </div>
      }
    >
      <CreateInner />
    </Suspense>
  );
}
