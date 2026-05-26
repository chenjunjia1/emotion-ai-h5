"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { StudioGenerationOverlay } from "@/components/publish-pack/studio/studio-generation-overlay";
import { StudioHeader } from "@/components/publish-pack/studio/studio-header";
import { StudioInputPanel } from "@/components/publish-pack/studio/studio-input-panel";
import { StudioResultPanel } from "@/components/publish-pack/studio/studio-result-panel";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import {
  apiPublishPackageImages,
  apiPublishPackageRestyle,
  apiQuickPublishPackage,
  isClientServerMode,
} from "@/lib/client/server-api";
import { inferContentGuess } from "@/lib/publish-pack/infer-guess";
import { mockQuickPublishPackage } from "@/lib/publish-pack/mock-quick-package";
import {
  mergeReviewExtraNote,
  parseReviewPackSearchParams,
} from "@/lib/publish-pack/review-bridge";
import type { ContentGuess, QuickPublishPackage, RestyleOption } from "@/lib/publish-pack/quick-package-types";
import { STUDIO_QUOTA } from "@/lib/publish-pack/studio-config";
import { getTotalQuota } from "@/lib/v1/quota";

export function PublishPackStudioPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, showToast, addHistory, setUser, setLoginOpen, openQuotaModal } = useApp();
  const { run, busy } = useAsyncAction();

  const topicParam = params.get("topic");
  const reviewBridge = parseReviewPackSearchParams(params);

  const [topic, setTopic] = useState(topicParam ? decodeURIComponent(topicParam) : "");
  const [mode, setMode] = useState<"quick" | "advanced">("quick");
  const [guess, setGuess] = useState<ContentGuess>(() =>
    inferContentGuess(topicParam ? decodeURIComponent(topicParam) : "")
  );
  const [extraNote, setExtraNote] = useState("");
  const [pkg, setPkg] = useState<QuickPublishPackage | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => {
    if (topicParam) {
      const t = decodeURIComponent(topicParam);
      setTopic(t);
      setGuess(inferContentGuess(t));
    }
    if (reviewBridge.fromReview) {
      setExtraNote((prev) =>
        mergeReviewExtraNote(prev, reviewBridge.reviewHint, reviewBridge.reviewTitle)
      );
    }
  }, [topicParam, reviewBridge.fromReview, reviewBridge.reviewHint, reviewBridge.reviewTitle]);

  const quotaTotal = user ? getTotalQuota(user) : 0;
  const isPro = Boolean(user && user.plan !== "free");

  const ensureLogin = () => {
    if (user) return true;
    setLoginOpen(true);
    return false;
  };

  const ensureQuota = (cost: number) => {
    if (!user) return false;
    if (getTotalQuota(user) >= cost) return true;
    openQuotaModal({ need: cost, have: getTotalQuota(user) });
    return false;
  };

  const runGenerate = useCallback(() => {
    if (!ensureLogin()) return;
    if (!ensureQuota(STUDIO_QUOTA.fullPackage)) return;
    const trimmed = topic.trim();
    if (trimmed.length < 2) {
      showToast("先说一句话，比如「今日份快乐已到账」");
      return;
    }

    setShowSteps(true);
    void run(async () => {
      let next: QuickPublishPackage | null = null;

      if (isClientServerMode()) {
        const res = await apiQuickPublishPackage({
          topic: trimmed,
          guess,
          mode,
          extraNote: extraNote.trim() || undefined,
        });
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          return;
        }
        if (res.user) setUser(res.user);
        if (res.package) {
          next = res.package as QuickPublishPackage;
          addHistory("AI发布包", trimmed, next as unknown as Record<string, unknown>, {
            id: res.generationId,
          });
        } else if (res.error) {
          showToast("生成失败，请重试");
          return;
        }
      }

      if (!next) {
        next = mockQuickPublishPackage({ topic: trimmed, guess, mode });
        showToast("演示模式：已生成可发布图文包");
      } else if (!isClientServerMode()) {
        addHistory("AI发布包", trimmed, next as unknown as Record<string, unknown>);
        showToast("生成完成！右侧为完整发布包");
      } else {
        showToast("生成完成！右侧为完整发布包，已同步到生成记录");
      }

      setPkg(next);
      setTimeout(() => {
        document.getElementById("studio-pack-result")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    });
    setTimeout(() => setShowSteps(false), 4200);
  }, [
    addHistory,
    extraNote,
    guess,
    mode,
    openQuotaModal,
    run,
    setLoginOpen,
    setUser,
    showToast,
    topic,
    user,
  ]);

  const regenImages = () => {
    if (!pkg || !ensureLogin() || !ensureQuota(STUDIO_QUOTA.regenImages)) return;
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageImages({
          action: "regenerate_set",
          topic: pkg.topic,
          guess: pkg.guess,
        });
        if (res.error === "quota_insufficient") openQuotaModal();
        else if (res.images) {
          setPkg({ ...pkg, images: res.images });
          if (res.user) setUser(res.user);
          showToast("已换一组 AI 配图");
        }
      } else {
        const m = mockQuickPublishPackage({ topic: pkg.topic, guess: pkg.guess });
        setPkg({ ...pkg, images: m.images });
        showToast("已换一组配图（演示）");
      }
    });
  };

  const regenOneImage = (imageId: string, asCover?: boolean) => {
    if (!pkg || !ensureLogin()) return;
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageImages({
          action: "regenerate_one",
          topic: pkg.topic,
          guess: pkg.guess,
          imageId,
          asCover,
        });
        if (res.images?.[0]) {
          const img = res.images[0];
          setPkg({
            ...pkg,
            images: pkg.images.map((i) => (i.id === imageId ? img : i)),
          });
          if (res.user) setUser(res.user);
          showToast("已换一张图");
        }
      }
    });
  };

  const restyle = (style: RestyleOption) => {
    if (!pkg || !ensureLogin() || !ensureQuota(STUDIO_QUOTA.regenCopy)) return;
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageRestyle({
          topic: pkg.topic,
          guess: pkg.guess,
          style,
          bodies: pkg.bodies,
        });
        if (res.bodies) {
          setPkg({ ...pkg, bodies: res.bodies });
          if (res.user) setUser(res.user);
          showToast(`已按「${style}」改写`);
        }
      } else {
        setPkg({
          ...pkg,
          bodies: pkg.bodies.map((b) => ({
            ...b,
            text: `【${style}】\n${b.text}`,
          })),
        });
      }
    });
  };

  const premiumCover = () => {
    if (!pkg || !ensureLogin() || !ensureQuota(STUDIO_QUOTA.premiumCover)) return;
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageImages({
          action: "premium_cover",
          topic: pkg.topic,
          guess: pkg.guess,
        });
        if (res.images) {
          setPkg({ ...pkg, images: res.images });
          if (res.user) setUser(res.user);
          showToast("高级封面已生成");
        }
      } else {
        showToast("请配置服务端后使用高级封面");
      }
    });
  };

  const copyAll = () => {
    if (!pkg) return;
    const text = [
      pkg.titles.map((t) => t.text).join("\n"),
      "",
      pkg.bodies.map((b) => b.text).join("\n\n---\n\n"),
      "",
      pkg.tags.join(" "),
      "",
      `发布建议：${pkg.publishAdvice.platform} · ${pkg.publishAdvice.bestTime}`,
    ].join("\n");
    void navigator.clipboard.writeText(text);
    showToast("已复制全文");
  };

  const savePack = () => {
    if (!pkg) return;
    addHistory("AI发布包", pkg.topic, pkg as unknown as Record<string, unknown>);
    showToast("已保存到素材库");
  };

  return (
    <AppShell showHeader={false} homePage wide>
      <StudioHeader onBack={() => (pkg ? setPkg(null) : router.back())} />
      <p className="mx-4 mt-2 rounded-2xl border border-pink-100 bg-pink-50 px-4 py-2 text-center text-[11px] font-bold text-pink-700">
        Studio 能力正在并入新版发布包，建议优先使用
        <button
          type="button"
          onClick={() => router.push("/publish-pack")}
          className="mx-1 text-pink-600 underline"
        >
          默认发布包
        </button>
      </p>
      <StudioGenerationOverlay active={showSteps || (busy && !pkg)} />

      <div className="mx-auto grid max-w-5xl gap-4 px-4 pb-28 pt-4 lg:grid-cols-2 lg:items-start">
        <div className={pkg ? "lg:sticky lg:top-20" : ""}>
          {reviewBridge.fromReview && !pkg ? (
            <div className="mb-3 rounded-[16px] bg-[#FFF0F5] px-3 py-2 text-[11px] font-bold text-[#FF4F8B] ring-1 ring-[#FFD0E8]">
              已带入复盘推荐选题，生成内容将与复盘一致
            </div>
          ) : null}
          <StudioInputPanel
            topic={topic}
            onTopicChange={setTopic}
            mode={mode}
            onModeChange={setMode}
            guess={guess}
            onGuessChange={setGuess}
            extraNote={extraNote}
            onExtraNoteChange={setExtraNote}
            busy={busy}
            onGenerate={runGenerate}
            quotaTotal={quotaTotal}
            isPro={isPro}
            onOpenPro={() => openQuotaModal()}
          />
        </div>

        <div className="min-h-[200px]">
          {pkg ? (
            <StudioResultPanel
              pkg={pkg}
              busy={busy}
              favorites={favorites}
              onToggleFavorite={(id) =>
                setFavorites((prev) => {
                  const n = new Set(prev);
                  if (n.has(id)) n.delete(id);
                  else n.add(id);
                  return n;
                })
              }
              onRegenerate={runGenerate}
              onSave={savePack}
              onRegenImages={regenImages}
              onRegenOneImage={regenOneImage}
              onRestyle={restyle}
              onPremiumCover={premiumCover}
              onCopyAll={copyAll}
              showToast={showToast}
            />
          ) : (
            <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#FFD0E8] bg-white/60 p-8 text-center">
              <p className="text-[14px] font-black text-[#1F2937]">生成结果会出现在这里</p>
              <p className="mt-2 max-w-[240px] text-[11px] leading-relaxed text-[#8A94A6]">
                输入一句话，点「帮我直接出图文」，AI 会陪你完成标题、正文、标签、配图和发布建议
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
