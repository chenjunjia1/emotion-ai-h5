"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MultiSelectCardGrid } from "@/components/publish-pack/multi-select-card-grid";
import { MomentsResultView } from "@/components/publish-pack/moments-result-view";
import { PlatformSelectGrid } from "@/components/publish-pack/platform-select-grid";
import { PublishPackEmptyTopic } from "@/components/publish-pack/publish-pack-empty-topic";
import { PublishPackResultTabs } from "@/components/publish-pack/publish-pack-result-tabs";
import { SelectedHotTopicCard } from "@/components/publish-pack/selected-hot-topic-card";
import { GeneratingProgressCard } from "@/components/ui/generating-progress-card";
import { WizardStepBar } from "@/components/publish-pack/wizard-step-bar";
import { StepChipGrid } from "@/components/v1/step-chip-grid";
import { PublishPackSuccessBanner } from "@/components/publish-pack/publish-pack-success-banner";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { QuotaPlayMeter } from "@/components/ui/quota-play-meter";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { apiGetHotTopicDetail } from "@/lib/client/server-api";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { enrichHotTopic, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { QUOTA_COST } from "@/lib/constants/v1";
import {
  ACCOUNT_TYPE_VALUES,
  PUBLISH_GOAL_VALUES,
  PUBLISH_STYLE_VALUES,
} from "@/lib/i18n/publish-form-options";
import {
  MOMENTS_CONTENT_TYPES,
  MOMENTS_DIRECTIONS,
} from "@/lib/publish-pack/moments-options";
import { formatMomentsCopyAll, isMomentsPack } from "@/lib/publish-pack/moments-result";
import { claimDailyShareReward } from "@/lib/v1/share-reward";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

const PublishSharePoster = dynamic(
  () =>
    import("@/components/publish-pack/publish-share-poster").then((m) => ({
      default: m.PublishSharePoster,
    })),
  { ssr: false }
);

const PACK_GENERATE_STAGES = [
  "正在理解选题与平台…",
  "撰写标题与正文结构…",
  "润色口播与发布建议…",
  "快好了，马上出包 ✨",
] as const;

function PublishPackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { tr, showToast, addHistory, user, setUser, openQuotaModal } = useApp();
  const { generatePublishPack } = useProduct();
  const { run, busy } = useAsyncAction();

  const [wizardStep, setWizardStep] = useState<1 | 2>(1);
  const [platform, setPlatform] = useState("朋友圈");
  const [momentsTypes, setMomentsTypes] = useState<string[]>(["生活分享"]);
  const [momentsDirections, setMomentsDirections] = useState<string[]>(["日常分享"]);
  const [accountType, setAccountType] = useState<string>(ACCOUNT_TYPE_VALUES[0]);
  const [style, setStyle] = useState<string>(PUBLISH_STYLE_VALUES[0]);
  const [goal, setGoal] = useState<string>(PUBLISH_GOAL_VALUES[0]);
  const [extraNote, setExtraNote] = useState("");
  const [manualTopic, setManualTopic] = useState("");
  const [pack, setPack] = useState<Record<string, unknown> | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [shareOpen, setShareOpen] = useState(false);
  const generatingRef = useRef<HTMLDivElement>(null);

  const topicParam = params.get("topic");
  const topicIdParam = params.get("topic_id") ?? params.get("hotId");
  const platformParam = params.get("platform");
  const inspirationMode = params.get("inspiration_mode");
  const inspirationHint = params.get("inspiration_hint");
  const inspirationCategory = params.get("inspiration_category");
  const [hotTopic, setHotTopic] = useState<HotTopicDisplay | null>(null);

  useEffect(() => {
    if (platformParam) setPlatform(platformParam);
    if (inspirationMode === "xhs" && inspirationHint) {
      setExtraNote((prev) => prev || inspirationHint);
    }
    if (inspirationCategory && inspirationMode === "xhs") {
      setAccountType(inspirationCategory.includes("职场") ? "职场号" : "生活号");
    }
  }, [platformParam, inspirationMode, inspirationHint, inspirationCategory]);

  const loadHotTopic = useCallback(async () => {
    try {
      if (topicIdParam) {
        const detail = await apiGetHotTopicDetail(topicIdParam);
        if (detail.item) {
          setHotTopic(enrichHotTopic(detail.item));
          return;
        }
      }
      if (topicParam) {
        setHotTopic(
          enrichHotTopic({
            id: topicIdParam ?? "custom",
            title: decodeURIComponent(topicParam),
            desc: "来自热点/自定义选题",
            heat: "高",
            track: "生活",
            format: "短视频",
          })
        );
      }
    } catch {
      /* ignore */
    }
  }, [topicIdParam, topicParam]);

  useEffect(() => {
    void loadHotTopic();
  }, [loadHotTopic]);

  useEffect(() => {
    if (busy && !pack) {
      generatingRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [busy, pack]);

  const isMoments = platform === "朋友圈";
  const generateCost = QUOTA_COST.publish_pack ?? 30;
  const regenAllCost = QUOTA_COST.publish_regen ?? 10;
  const regenOneCost = QUOTA_COST.moments_regen_one ?? 5;
  const quotaTotal = useMemo(() => (user ? getTotalQuota(user) : 0), [user]);
  const stepBar = pack ? 3 : wizardStep;

  const topicSource = useMemo(() => {
    return (
      hotTopic?.title.trim() ||
      manualTopic.trim() ||
      extraNote.trim().slice(0, 40) ||
      (isMoments ? "朋友圈日常分享" : "")
    );
  }, [hotTopic, manualTopic, extraNote, isMoments]);

  const buildInput = (quotaAction?: keyof typeof QUOTA_COST) => ({
    topic: topicSource,
    platform,
    track: isMoments ? momentsDirections[0] ?? "日常分享" : accountType,
    goal: isMoments ? momentsTypes.join("、") : goal,
    style: isMoments ? momentsDirections.join("、") : style,
    withXhs: platform === "小红书",
    extraNote: extraNote.trim(),
    accountType: isMoments ? momentsTypes.join("、") : accountType,
    topicId: hotTopic?.id,
    hotTopicSummary: hotTopic?.summary ?? hotTopic?.desc,
    hotTopicAngles: hotTopic?.recommendAngles,
    hotTopicTargetUsers: hotTopic?.targetUsers,
    inspirationRewriteOnly: inspirationMode === "xhs",
    momentsContentTypes: isMoments ? momentsTypes : undefined,
    momentsDirections: isMoments ? momentsDirections : undefined,
    quotaAction,
  });

  const runGenerate = (quotaAction?: keyof typeof QUOTA_COST) =>
    void run(async () => {
      if (!topicSource && !extraNote.trim()) {
        showToast(isMoments ? "请简单描述你想发的内容" : "请先选择热点或输入主题");
        return;
      }
      if (isMoments && momentsTypes.length === 0) {
        showToast("请至少选择一种朋友圈内容类型");
        return;
      }
      if (isMoments && momentsDirections.length === 0) {
        showToast("请至少选择一个内容方向");
        return;
      }

      const cost =
        quotaAction === "moments_regen_one"
          ? regenOneCost
          : quotaAction === "publish_regen"
            ? regenAllCost
            : generateCost;

      if (user && getTotalQuota(user) < cost) {
        openQuotaModal({ need: cost, have: getTotalQuota(user) });
        return;
      }

      try {
        const r = await generatePublishPack(buildInput(quotaAction ?? "publish_pack"));
        if (r?.result && typeof r.result === "object") {
          setPack(r.result as Record<string, unknown>);
          setWizardStep(2);
          showToast(quotaAction === "publish_regen" ? "已重新生成" : "生成完成");
          setTimeout(() => {
            document.getElementById("pack-result")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          showToast(tr("generateFailed"));
        }
      } catch {
        showToast(tr("generateFailed"));
      }
    });

  const onRegenOne = (copyId: string) =>
    void run(async () => {
      if (user && getTotalQuota(user) < regenOneCost) {
        openQuotaModal({ need: regenOneCost, have: getTotalQuota(user) });
        return;
      }
      const r = await generatePublishPack({
        ...buildInput("moments_regen_one"),
        extraNote: `${extraNote}\n请只换一条文案，风格保持，copyId=${copyId}`,
      });
      if (!r?.result || !pack) return;
      const next = r.result as Record<string, unknown>;
      const newCopies = (next.momentsCopies as { id: string; content: string }[]) ?? [];
      const replacement = newCopies.find((c) => c.id === copyId) ?? newCopies[0];
      if (!replacement) return;
      setPack({
        ...pack,
        momentsCopies: ((pack.momentsCopies as { id: string }[]) ?? []).map((c) =>
          c.id === copyId ? { ...c, ...replacement } : c
        ),
      });
      showToast(`已换一条 · 消耗 ${regenOneCost} 灵感`);
    });

  const saveToLibrary = () => {
    if (!pack) return;
    const label = isMomentsPack(pack) ? "朋友圈文案" : "完整发布包";
    addHistory(label, topicSource, pack);
    showToast("已保存到素材库");
  };

  const copyAll = () => {
    if (!pack) return;
    const text = isMomentsPack(pack)
      ? formatMomentsCopyAll(pack)
      : [
          `【推荐标题】${displayField(pack.recommendedTitle, "")}`,
          `【口播脚本】\n${displayField(pack.script30s, "")}`,
          `【封面】${displayField(pack.coverCopy, "")}`,
          `【首评】${displayField(pack.firstComment, "")}`,
          `【标签】${((pack.tags as string[]) ?? []).join(" ")}`,
        ].join("\n\n");
    void copyToClipboard(text);
    showToast(tr("copied"));
  };

  const shareSnippet = useMemo(() => {
    if (!pack) return "";
    if (isMomentsPack(pack)) {
      const copies = (pack.momentsCopies as { content: string }[]) ?? [];
      return copies[0]?.content ?? formatMomentsCopyAll(pack).slice(0, 200);
    }
    return [
      displayField(pack.recommendedTitle, ""),
      displayField(pack.script30s, "").slice(0, 120),
    ]
      .filter(Boolean)
      .join("\n");
  }, [pack]);

  const grantShareReward = () => {
    if (!user) return;
    const { granted, user: next } = claimDailyShareReward(user);
    if (granted) {
      setUser(next);
      showToast(tr("shareRewardGranted"));
    }
  };

  const openSharePoster = () => {
    grantShareReward();
    setShareOpen(true);
  };

  return (
    <AppShell showHeader={false}>
      <header className="sticky top-0 z-40 border-b border-[#FFE8F0] bg-[#FFF4F7]/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => (pack ? setPack(null) : router.back())}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm"
            aria-label="返回"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-base font-black text-[#1F2937]">创建发布包</h1>
          <Link
            href="/history?filter=pack"
            className="text-[11px] font-bold text-[#FF4F8B]"
          >
            生成记录
          </Link>
        </div>
        {!pack ? <WizardStepBar current={stepBar} /> : null}
        <div className="px-4 pb-2">
          <QuotaPlayMeter action="publish_pack" compact={!!pack} />
        </div>
      </header>

      <div className="space-y-4 px-4 pb-36 pt-4">
        {busy && !pack ? (
          <div ref={generatingRef}>
            <GeneratingProgressCard
              title={isMoments ? "正在生成朋友圈文案" : "正在生成发布包"}
              subtitle={topicSource || undefined}
              stages={PACK_GENERATE_STAGES}
            />
          </div>
        ) : null}

        {pack ? (
          <div id="pack-result" className="space-y-3">
            <PublishPackSuccessBanner onShare={openSharePoster} />
            {isMomentsPack(pack) ? (
              <MomentsResultView
                pack={pack}
                busy={busy}
                favorites={favorites}
                onToggleFavorite={(id) =>
                  setFavorites((prev) => {
                    const next = new Set(prev);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                  })
                }
                onCopy={(text, isMomentsCopy) => {
                  void copyToClipboard(text);
                  showToast(isMomentsCopy ? tr("momentsCopyToast") : tr("copied"));
                }}
                onSave={saveToLibrary}
                onRegenOne={onRegenOne}
                onRegenAll={() => runGenerate("publish_regen")}
                onCopyAll={copyAll}
                onShare={openSharePoster}
              />
            ) : (
              <div className="space-y-3 pb-24">
                <PublishPackResultTabs
                  pack={pack}
                  busy={busy}
                  favorites={favorites}
                  onToggleFavorite={(id) =>
                    setFavorites((prev) => {
                      const next = new Set(prev);
                      if (next.has(id)) next.delete(id);
                      else next.add(id);
                      return next;
                    })
                  }
                  onCopy={(text) => {
                    void copyToClipboard(text);
                    showToast(tr("copied"));
                  }}
                  onShare={openSharePoster}
                  onRegen={() => runGenerate("publish_regen")}
                />
                <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 mx-auto max-w-lg px-4">
                  <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-[#FFE8F0] backdrop-blur">
                    <button
                      type="button"
                      onClick={saveToLibrary}
                      className="rounded-xl bg-white py-3 text-[12px] font-black text-[#5A6478] ring-1 ring-[#FFE8F0]"
                    >
                      保存到素材库
                    </button>
                    <button
                      type="button"
                      onClick={copyAll}
                      className="rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3 text-[12px] font-black text-white"
                    >
                      复制全部内容
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : wizardStep === 1 ? (
          <div className="space-y-4">
            {hotTopic ? (
              <SelectedHotTopicCard topic={hotTopic} />
            ) : (
              <>
                <PublishPackEmptyTopic />
                <div className="rounded-[18px] bg-white p-3 ring-1 ring-[#FFE8F0]">
                  <p className="mb-1.5 text-[11px] font-black text-[#1F2937]">想拍/想发的主题（选填）</p>
                  <input
                    className="w-full rounded-xl bg-[#FFF8FB] px-3 py-2.5 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                    placeholder="例如：下班后的治愈时刻、今日好物分享…"
                    value={manualTopic}
                    onChange={(e) => setManualTopic(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="cream-card space-y-4 rounded-[24px] p-4 ring-1 ring-[#FFE8F0]">
              <PlatformSelectGrid value={platform} onChange={setPlatform} />

              {isMoments ? (
                <MultiSelectCardGrid
                  title="朋友圈内容类型"
                  subtitle="选择你需要的方向（可多选）"
                  options={MOMENTS_CONTENT_TYPES}
                  value={momentsTypes}
                  onChange={setMomentsTypes}
                />
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => {
                if (isMoments && momentsTypes.length === 0) {
                  showToast("请至少选择一种内容类型");
                  return;
                }
                setWizardStep(2);
              }}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-sm font-black text-white shadow-[0_8px_24px_rgba(255,79,139,0.35)]"
            >
              下一步：选择内容方向
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="cream-card space-y-4 rounded-[24px] p-4 ring-1 ring-[#FFE8F0]">
              {isMoments ? (
                <>
                  <section>
                    <p className="text-[14px] font-black text-[#1F2937]">选择内容方向</p>
                    <p className="mt-1 text-[11px] text-[#8A94A6]">
                      AI 会根据你的用途生成不同语气的朋友圈文案
                    </p>
                  </section>
                  <MultiSelectCardGrid
                    title=""
                    options={MOMENTS_DIRECTIONS.map((d) => ({ id: d }))}
                    value={momentsDirections}
                    onChange={setMomentsDirections}
                  />
                  <section>
                    <p className="mb-2 text-[12px] font-black text-[#1F2937]">补充说明</p>
                    <textarea
                      className="w-full resize-none rounded-2xl bg-white p-3 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                      rows={4}
                      maxLength={200}
                      value={extraNote}
                      onChange={(e) => setExtraNote(e.target.value)}
                      placeholder={`请简单描述你想发的内容，比如：\n今天想分享一款护肤品，语气自然一点，不要太像广告。`}
                    />
                    <p className="mt-1 text-right text-[10px] text-[#8A94A6]">{extraNote.length}/200</p>
                  </section>
                </>
              ) : (
                <>
                  <StepChipGrid
                    step={2}
                    title="选择账号类型"
                    options={ACCOUNT_TYPE_VALUES}
                    value={accountType}
                    onChange={setAccountType}
                  />
                  <StepChipGrid
                    step={3}
                    title="选择内容风格"
                    options={PUBLISH_STYLE_VALUES}
                    value={style}
                    onChange={setStyle}
                    columns={4}
                  />
                  <StepChipGrid
                    step={4}
                    title="选择生成目标"
                    options={PUBLISH_GOAL_VALUES}
                    value={goal}
                    onChange={setGoal}
                    columns={4}
                  />
                  <section>
                    <p className="mb-2 text-[12px] font-black text-[#1F2937]">补充说明（选填）</p>
                    <textarea
                      className="w-full resize-none rounded-2xl bg-white p-3 text-[12px] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                      rows={3}
                      maxLength={200}
                      value={extraNote}
                      onChange={(e) => setExtraNote(e.target.value)}
                      placeholder="粉丝数、拍摄场景、想要的语气…"
                    />
                  </section>
                </>
              )}

              <div className="flex justify-center">
                <QuotaCostBadge cost={generateCost} />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => runGenerate()}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 rounded-2xl py-3.5 text-white",
                  "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] shadow-[0_8px_24px_rgba(255,79,139,0.35)] disabled:opacity-50"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-black">
                  <Sparkles size={18} className={busy ? "animate-spin" : ""} />
                  {busy
                    ? tr("loading")
                    : isMoments
                      ? "一键生成朋友圈文案"
                      : "一键生成发布包 ✨"}
                </span>
                <span className="text-[9px] font-semibold text-white/90">
                  消耗 {generateCost} 灵感 · 当前 {quotaTotal} 灵感
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWizardStep(1)}
              className="w-full rounded-2xl bg-white py-3 text-sm font-bold text-[#5A6478] ring-1 ring-[#FFE8F0]"
            >
              上一步
            </button>
          </div>
        )}
      </div>
      {pack ? (
        <PublishSharePoster
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          pack={pack}
          snippet={shareSnippet}
        />
      ) : null}
    </AppShell>
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
