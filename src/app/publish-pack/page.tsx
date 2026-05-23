"use client";

import { Suspense, useCallback, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, FileText, MessageCircle, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { ContentFormChips } from "@/components/v1/content-form-chips";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { apiGetInspirationTitles } from "@/lib/client/server-api";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { STORAGE_DAILY_INSPIRATION } from "@/lib/constants/v1";
import { readInspirationTitlesForToday, todayKey } from "@/lib/publish-pack/read-inspiration-cached";
import {
  GOAL_VALUES,
  PLATFORM_VALUES,
  STYLE_VALUES,
  TRACK_VALUES,
} from "@/lib/i18n/form-options";
import { QUOTA_COST } from "@/lib/constants/v1";
import { HintTip } from "@/components/ui/hint-tip";
import { cn } from "@/lib/utils";

const PACK_ITEMS = [
  { icon: "📝", label: "爆款标题" },
  { icon: "🎬", label: "口播脚本" },
  { icon: "📕", label: "小红书图文" },
  { icon: "💬", label: "首评+神回复" },
];

function PublishPackInner() {
  const params = useSearchParams();
  const { tr, showToast, addHistory } = useApp();
  const { generatePublishPack } = useProduct();
  const [inspirationTitles, setInspirationTitles] = useState<string[]>(() =>
    readInspirationTitlesForToday(0)
  );
  const [inspirationBatch, setInspirationBatch] = useState(0);
  const [inspirationMeta, setInspirationMeta] = useState<{
    updatedAt: string;
    note: string;
  } | null>(null);
  const [shufflingInspiration, setShufflingInspiration] = useState(false);
  const [topic, setTopic] = useState(() => readInspirationTitlesForToday(0)[0] ?? "");
  const [platform, setPlatform] = useState<string>(PLATFORM_VALUES[0]);
  const [track, setTrack] = useState<string>(TRACK_VALUES[3]);
  const [goal, setGoal] = useState<string>(GOAL_VALUES[0]);
  const [style, setStyle] = useState<string>(STYLE_VALUES[0]);
  const [withXhs, setWithXhs] = useState(true);
  const [pack, setPack] = useState<Record<string, unknown> | null>(null);
  const { run, busy } = useAsyncAction();
  const cost = QUOTA_COST.publish_pack ?? 5;

  const loadInspiration = useCallback(async (nextBatch: number) => {
    const key = todayKey();
    try {
      const r = await apiGetInspirationTitles(nextBatch);
      if (r.titles?.length) {
        setInspirationTitles(r.titles);
        if (r.meta) {
          setInspirationMeta({
            updatedAt: r.meta.updatedAt,
            note: r.meta.note,
          });
        }
        localStorage.setItem(
          STORAGE_DAILY_INSPIRATION,
          JSON.stringify({ date: key, titles: r.titles, batch: nextBatch })
        );
        return;
      }
    } catch {
      /* 本地池 */
    }
    const local = readInspirationTitlesForToday(nextBatch);
    setInspirationTitles(local);
    setInspirationMeta({
      updatedAt: `${key} 08:00`,
      note: "每日 8 点更新，点选即可当今日主题",
    });
  }, []);

  useEffect(() => {
    void loadInspiration(0);
  }, [loadInspiration]);

  useEffect(() => {
    const t = params.get("topic");
    if (t) setTopic(decodeURIComponent(t));
  }, [params]);

  const onShuffleInspiration = useCallback(async () => {
    setShufflingInspiration(true);
    try {
      const next = inspirationBatch + 1;
      await loadInspiration(next);
      setInspirationBatch(next);
      showToast(tr("dailyInspirationShuffleDone"));
    } finally {
      setShufflingInspiration(false);
    }
  }, [inspirationBatch, loadInspiration, showToast, tr]);

  const onGen = () =>
    void run(async () => {
      const trimmed = topic.trim();
      if (!trimmed) {
        showToast("先写一个今日主题吧");
        return;
      }
      try {
        const r = await generatePublishPack({
          topic: trimmed,
          platform,
          track,
          goal,
          style,
          withXhs,
        });
        if (r && typeof r === "object" && "recommendedTitle" in r) {
          setPack(r as Record<string, unknown>);
        } else {
          showToast(tr("generateFailed"));
        }
      } catch {
        showToast(tr("generateFailed"));
      }
    });

  const copyAll = () => {
    if (!pack) return;
    const text = [
      `【推荐标题】${displayField(pack.recommendedTitle, "")}`,
      `【口播脚本】\n${displayField(pack.script30s, "")}`,
      pack.xhsNote ? `【小红书】\n${displayField(pack.xhsNote, "")}` : "",
      `【首评】${displayField(pack.firstComment, "")}`,
      `【回复】\n${((pack.commentReplies as string[]) ?? []).join("\n")}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    void copyToClipboard(text);
    showToast(tr("copied"));
  };

  return (
    <AppShell>
      <SectionTitle
        eyebrow="⚡"
        title={tr("publishPackTitle")}
        desc={tr("publishPackDesc")}
      />

      {/* 发布包包含什么 */}
      <div className="mb-3 flex flex-wrap gap-2">
        {PACK_ITEMS.map((item) => (
          <span
            key={item.label}
            className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-orange-100"
          >
            {item.icon} {item.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-2.5 py-1 text-[10px] font-black text-white">
            {cost} 灵感/次
          </span>
          <HintTip
            title={tr("profileHintQuotaTitle")}
            body={tr("profileHintQuotaBody")}
            okLabel={tr("profileHintOk")}
            ariaLabel={tr("profileHintAria")}
          />
        </span>
      </div>

      {!pack ? (
        <div className="cream-card rounded-[28px] p-4 shadow-[0_10px_28px_rgba(255,122,174,0.1)] ring-1 ring-orange-100/60">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9EC4] to-[#FF7AAE] text-white">
              <Wand2 size={18} />
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">{tr("publishPackHeroTitle")}</p>
              <p className="text-[10px] text-slate-500">标题、脚本、图文、评论全套带走</p>
            </div>
          </div>

          <div className="mb-3">
            <p className="mb-1.5 text-[11px] font-bold text-slate-600">✏️ {tr("labelTodayTopic")}</p>
            <textarea
              className={cn(
                "w-full resize-none rounded-2xl border-0 bg-white/95 p-3 text-sm font-medium text-slate-800",
                "shadow-inner ring-2 ring-[#FF7AAE]/25 outline-none focus:ring-[#FF7AAE]/50"
              )}
              rows={3}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：新手第一周怎么发内容…"
            />
            <p className="mt-1 text-right text-[10px] text-slate-400">{topic.length} 字</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div>
                <p className="flex items-center gap-1 text-[11px] font-black text-[#FF5C8A]">
                  <Sparkles size={12} />
                  {tr("dailyInspirationTitles")}
                </p>
                <p className="mt-0.5 text-[9px] text-slate-500">
                  {tr("dailyInspirationSub")
                    .replace("{time}", inspirationMeta?.updatedAt?.split(" ")[1] ?? "08:00")
                    .replace("{count}", String(inspirationTitles.length))}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void onShuffleInspiration()}
                disabled={shufflingInspiration}
                className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/30 disabled:opacity-50"
              >
                <RefreshCw size={11} className={shufflingInspiration ? "animate-spin" : ""} />
                {tr("dailyInspirationShuffle")}
              </button>
            </div>
            <div className="relative mt-1.5">
              <div className="max-h-[132px] overflow-y-auto overscroll-contain rounded-xl border border-orange-100/80 bg-gradient-to-b from-white to-orange-50/30 p-1.5 pr-0.5">
                <div className="flex flex-wrap gap-1.5">
                  {inspirationTitles.map((t) => (
                    <button
                      key={`${inspirationBatch}-${t}`}
                      type="button"
                      onClick={() => setTopic(t)}
                      className={cn(
                        "rounded-full px-2.5 py-1 text-left text-[10px] font-semibold leading-snug transition active:scale-95",
                        topic === t
                          ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-sm"
                          : "bg-white/95 text-slate-600 ring-1 ring-orange-100/80"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {inspirationTitles.length > 8 ? (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-orange-50/95 to-transparent pb-0.5 pt-4 text-center text-[8px] font-bold text-slate-400">
                  {tr("hotTopicsScrollHint")}
                </p>
              ) : null}
            </div>
            {inspirationMeta?.note ? (
              <p className="mt-1 text-[9px] text-slate-400">{inspirationMeta.note}</p>
            ) : null}
          </div>

          <div className="mb-3 h-px bg-gradient-to-r from-transparent via-[#FF7AAE]/20 to-transparent" />

          <ContentFormChips
            platform={platform}
            track={track}
            goal={goal}
            style={style}
            onPlatform={setPlatform}
            onTrack={setTrack}
            onGoal={setGoal}
            onStyle={setStyle}
          />

          <button
            type="button"
            onClick={() => setWithXhs((v) => !v)}
            className={cn(
              "mt-3 flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.99]",
              withXhs
                ? "bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] ring-2 ring-[#FF7AAE]/35"
                : "bg-white/80 ring-1 ring-orange-100"
            )}
          >
            <span className="text-xs font-bold text-slate-700">📕 {tr("withXhs")}</span>
            <span
              className={cn(
                "relative h-6 w-11 rounded-full transition",
                withXhs ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE]" : "bg-slate-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition",
                  withXhs ? "left-[22px]" : "left-0.5"
                )}
              />
            </span>
          </button>

          <button
            type="button"
            disabled={busy || !topic.trim()}
            onClick={onGen}
            className={cn(
              "banner-cta-breathe mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white",
              "bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B] shadow-[0_8px_24px_rgba(255,107,107,0.4)]",
              "disabled:opacity-50"
            )}
          >
            <Sparkles size={18} className={busy ? "animate-spin" : ""} />
            {busy ? tr("loading") : tr("publishPackBtn")}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="overflow-hidden rounded-[28px] shadow-lg ring-1 ring-orange-100/80">
            <div className="bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B] px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white/90">✨ 完整发布包已就绪</span>
                <span className="rounded-full bg-white/25 px-2 py-0.5 text-[10px] font-bold">
                  安全分 {displayField(pack.safetyScore, "—")}
                </span>
              </div>
              <p className="mt-1.5 text-base font-black leading-snug">
                {displayField(pack.recommendedTitle)}
              </p>
            </div>

            <div className="space-y-2 bg-white p-3">
              <ContentFormChips
                compact
                platform={platform}
                track={track}
                goal={goal}
                style={style}
                onPlatform={setPlatform}
                onTrack={setTrack}
                onGoal={setGoal}
                onStyle={setStyle}
              />

              <PackBlock
                icon={<FileText size={14} />}
                title="30秒口播脚本"
                text={displayField(pack.script30s)}
                onCopy={() => {
                  void copyToClipboard(displayField(pack.script30s, ""));
                  showToast(tr("copied"));
                }}
              />
              {pack.xhsNote ? (
                <PackBlock
                  icon={<span className="text-sm">📕</span>}
                  title="小红书图文"
                  text={displayField(pack.xhsNote)}
                  tone="rose"
                  onCopy={() => {
                    void copyToClipboard(displayField(pack.xhsNote, ""));
                    showToast(tr("copied"));
                  }}
                />
              ) : null}
              <PackBlock
                icon={<MessageCircle size={14} />}
                title="首评 + 回复话术"
                text={[
                  displayField(pack.firstComment, ""),
                  ...((pack.commentReplies as string[]) ?? []),
                ]
                  .filter(Boolean)
                  .join("\n")}
                onCopy={() => copyAll()}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={copyAll}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] py-3 text-sm font-bold text-white shadow-md active:scale-[0.98]"
          >
            <Copy size={16} />
            {tr("publishPackCopy")}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                setPack(null);
              }}
            >
              再生成一条
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                addHistory("完整发布包", topic, pack);
                showToast(tr("savedToHistory"));
              }}
            >
              {tr("publishPackSave")}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function PackBlock({
  title,
  text,
  icon,
  tone = "orange",
  onCopy,
}: {
  title: string;
  text: string;
  icon: ReactNode;
  tone?: "orange" | "rose";
  onCopy: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-3",
        tone === "rose" ? "bg-rose-50/80" : "bg-orange-50/70"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 text-[11px] font-bold text-[#FF7AAE]">
          {icon} {title}
        </span>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/30 active:scale-95"
        >
          复制
        </button>
      </div>
      <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-slate-700">
        {text}
      </pre>
    </div>
  );
}

export default function PublishPackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          加载中…
        </div>
      }
    >
      <PublishPackInner />
    </Suspense>
  );
}
