"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Flame, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PublishPackResultTabs } from "@/components/publish-pack/publish-pack-result-tabs";
import { SelectedHotTopicCard } from "@/components/publish-pack/selected-hot-topic-card";
import { PlatformIconRow } from "@/components/v1/platform-icon-row";
import { StepChipGrid } from "@/components/v1/step-chip-grid";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
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
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

function PublishPackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { tr, showToast, addHistory, user } = useApp();
  const { generatePublishPack } = useProduct();
  const { run, busy } = useAsyncAction();
  const cost = QUOTA_COST.publish_pack ?? 30;

  const [platform, setPlatform] = useState("抖音");
  const [accountType, setAccountType] = useState<string>(ACCOUNT_TYPE_VALUES[0]);
  const [style, setStyle] = useState<string>(PUBLISH_STYLE_VALUES[0]);
  const [goal, setGoal] = useState<string>(PUBLISH_GOAL_VALUES[0]);
  const [extraNote, setExtraNote] = useState("");
  const [pack, setPack] = useState<Record<string, unknown> | null>(null);

  const topicParam = params.get("topic");
  const topicIdParam = params.get("topic_id") ?? params.get("hotId");
  const accountTypeParam = params.get("account_type") ?? params.get("track");
  const styleParam = params.get("style");
  const platformParam = params.get("platform");

  useEffect(() => {
    if (accountTypeParam && (ACCOUNT_TYPE_VALUES as readonly string[]).includes(accountTypeParam)) {
      setAccountType(accountTypeParam);
    }
    if (styleParam && (PUBLISH_STYLE_VALUES as readonly string[]).includes(styleParam)) {
      setStyle(styleParam);
    }
    if (platformParam) setPlatform(platformParam);
  }, [accountTypeParam, styleParam, platformParam]);

  const [hotTopic, setHotTopic] = useState<HotTopicDisplay | null>(null);

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
      /* keep null */
    }
  }, [topicIdParam, topicParam]);

  useEffect(() => {
    void loadHotTopic();
  }, [loadHotTopic]);

  const quotaTotal = useMemo(() => (user ? getTotalQuota(user) : 0), [user]);

  const onGen = () =>
    void run(async () => {
      if (!hotTopic) {
        showToast("请先选择热点选题");
        return;
      }
      const topic = hotTopic.title.trim();
      if (!topic) {
        showToast("请先选择热点选题");
        return;
      }
      try {
        const r = await generatePublishPack({
          topic,
          platform,
          track: accountType,
          goal,
          style,
          withXhs: platform === "小红书",
          extraNote: extraNote.trim(),
          accountType,
          topicId: hotTopic.id,
          hotTopicSummary: hotTopic.summary ?? hotTopic.desc,
          hotTopicAngles: hotTopic.recommendAngles,
          hotTopicTargetUsers: hotTopic.targetUsers,
        });
        if (r && typeof r === "object" && "recommendedTitle" in r) {
          setPack(r as Record<string, unknown>);
          showToast("发布包已生成");
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

  const copyAll = () => {
    if (!pack) return;
    const text = [
      `【推荐标题】${displayField(pack.recommendedTitle, "")}`,
      `【口播脚本】\n${displayField(pack.script30s, "")}`,
      `【封面】${displayField(pack.coverCopy, "")}`,
      `【首评】${displayField(pack.firstComment, "")}`,
      `【标签】${((pack.tags as string[]) ?? []).join(" ")}`,
    ].join("\n\n");
    void copyToClipboard(text);
    showToast(tr("copied"));
  };

  return (
    <AppShell showHeader={false}>
      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-[#FFE8F0] bg-[#FFF4F7]/95 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-black text-[#1F2937]">{tr("publishPackTitle")}</h1>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#FF4F8B] ring-1 ring-[#FFE0EC]">
          <Flame size={12} />
          {quotaTotal} 灵感
        </span>
      </div>

      <div className="space-y-4 px-4 pb-32 pt-4">
        {!pack ? (
          <>
            {hotTopic ? (
              <SelectedHotTopicCard topic={hotTopic} />
            ) : (
              <p className="text-center text-sm text-[#8A94A6]">今日热点正在更新中，请稍后再来看看。</p>
            )}

            <div className="cream-card space-y-4 rounded-[24px] p-4 ring-1 ring-[#FFE8F0]">
              <PlatformIconRow value={platform} onChange={setPlatform} step={1} />
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
                <p className="mb-2 text-[12px] font-black text-[#1F2937]">
                  <span className="mr-1 text-[#FF4F8B]">5.</span>
                  补充说明（选填）
                </p>
                <textarea
                  className="w-full resize-none rounded-2xl border-0 bg-white p-3 text-[12px] text-[#1F2937] ring-1 ring-[#FFE8F0] outline-none focus:ring-[#FF4F8B]/40"
                  rows={4}
                  maxLength={200}
                  value={extraNote}
                  onChange={(e) => setExtraNote(e.target.value)}
                  placeholder="请输入你的账号情况或想要的内容方向…"
                />
                <p className="mt-1 text-right text-[10px] text-[#8A94A6]">{extraNote.length}/200</p>
              </section>

              <div className="flex items-center justify-center">
                <QuotaCostBadge cost={cost} />
              </div>

              <button
                type="button"
                disabled={busy}
                onClick={onGen}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white",
                  "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] shadow-[0_8px_24px_rgba(255,79,139,0.35)] disabled:opacity-50"
                )}
              >
                <Sparkles size={18} className={busy ? "animate-spin" : ""} />
                {busy ? tr("loading") : "一键生成发布包 ✨"}
              </button>
            </div>
          </>
        ) : (
          <div id="pack-result" className="space-y-3">
            {hotTopic ? <SelectedHotTopicCard topic={hotTopic} /> : null}
            <PublishPackResultTabs
              pack={pack}
              onCopy={(text) => {
                void copyToClipboard(text);
                showToast(tr("copied"));
              }}
            />
            <button
              type="button"
              onClick={copyAll}
              className="w-full rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3 text-sm font-black text-white"
            >
              复制全部内容
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPack(null)}
                className="rounded-2xl bg-white py-3 text-sm font-bold text-[#5A6478] ring-1 ring-[#FFE8F0]"
              >
                再生成一条
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!hotTopic) return;
                  addHistory("完整发布包", hotTopic.title, pack);
                  showToast(tr("savedToHistory"));
                }}
                className="rounded-2xl bg-[#FFF0F5] py-3 text-sm font-bold text-[#FF4F8B] ring-1 ring-[#FF4F8B]/20"
              >
                {tr("publishPackSave")}
              </button>
            </div>
            <Link
              href="/hot-topics"
              className="block text-center text-[11px] font-bold text-[#8A94A6]"
            >
              换个热点继续生成 →
            </Link>
          </div>
        )}
      </div>
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
