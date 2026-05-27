"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Image as ImageIcon,
  Sparkles,
  WandSparkles,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { InspirationSourceBar } from "@/components/inspiration/inspiration-source-bar";
import { StudioHeader } from "@/components/publish-pack/studio/studio-header";
import { PackPromptChips } from "@/components/publish-pack/v2/pack-prompt-chips";
import { PackV2PayModal, type PayModalKind } from "@/components/publish-pack/v2/pack-v2-pay-modal";
import { PackV2LoadingProgress } from "@/components/publish-pack/v2/pack-v2-loading-progress";
import { PackV2Result } from "@/components/publish-pack/v2/pack-v2-result";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import {
  apiEnhancePublishInput,
  apiPublishPackageImages,
  apiPublishPackageQuotaPreview,
  apiPublishPackageRestyle,
  apiQuickPublishPackage,
  apiUpgradePublishPackage,
  isClientServerMode,
} from "@/lib/client/server-api";
import { isDevMockPayEnabled } from "@/lib/client/pay-env";
import { calcCompleteness } from "@/lib/publish-pack/completeness";
import { inferContentGuess } from "@/lib/publish-pack/infer-guess";
import {
  GROUPED_INSPIRATION,
  IMAGE_COUNT_OPTIONS,
  DEFAULT_PUBLISH_INPUT,
  INPUT_PLACEHOLDERS,
} from "@/lib/publish-pack/pack-inspiration";

const SIMPLE_PLATFORMS = ["小红书", "朋友圈", "抖音图文", "视频号"] as const;
const SIMPLE_FEELINGS = [
  "温柔治愈",
  "高级松弛",
  "真实碎碎念",
  "深夜emo",
  "打工人嘴替",
  "发疯文学感",
  "i人日常感",
] as const;
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import {
  getAdvancedPackCostPoints,
  getPackGenerateButtonLabel,
  getPackSummaryTitle,
  getQuickPackCostLabel,
  PACK_PRICING,
} from "@/lib/publish-pack/quota-display";
import { mockQuickPublishPackage } from "@/lib/publish-pack/mock-quick-package";
import {
  mergeReviewExtraNote,
  parseReviewPackSearchParams,
} from "@/lib/publish-pack/review-bridge";
import { buildScenePreviewZh } from "@/lib/publish-pack/scene-preview";
import { ImageStylePicker } from "@/components/publish-pack/v2/image-style-picker";
import type {
  AdvancedPreferences,
  ContentGuess,
  PackageImage,
  QuickPublishPackage,
  RestyleOption,
} from "@/lib/publish-pack/quick-package-types";
import { applyProDiscountPrice } from "@/services/pricingService";
import { applyQuotaDeduct, getTotalQuota } from "@/lib/v1/quota";
import type { ProductDef } from "@/lib/types/v1";

const PublishSharePoster = dynamic(
  () =>
    import("@/components/publish-pack/publish-share-poster").then((m) => ({
      default: m.PublishSharePoster,
    })),
  { ssr: false }
);

function Pill({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-2 text-sm font-bold transition ${
        active
          ? "border-pink-500 bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-md shadow-pink-100"
          : "border-pink-100 bg-white text-slate-600"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

export function PublishPackV2Page() {
  const router = useRouter();
  const params = useSearchParams();
  const {
    user,
    showToast,
    addHistory,
    setUser,
    setLoginOpen,
    openQuotaModal,
    createOrder,
  } = useApp();
  const { run, busy } = useAsyncAction();
  const { completeTask } = useProduct();

  const topicParam = params.get("topic");
  const modeParam = params.get("mode");
  const imageCountParam = params.get("imageCount");
  const fromInspiration =
    params.get("from") === "inspiration" || Boolean(params.get("inspiration_id"));
  const inspirationReturnTo = params.get("returnTo") ?? "/inspiration";
  const inspirationHint = params.get("inspiration_hint");
  const reviewBridge = parseReviewPackSearchParams(params);

  const initialImageCount = ([1, 2, 4] as const).includes(
    Number(imageCountParam) as ImageCountOption
  )
    ? (Number(imageCountParam) as ImageCountOption)
    : 1;

  const [mode, setMode] = useState<"quick" | "advanced">(
    modeParam === "advanced" ? "advanced" : "quick"
  );
  const [input, setInput] = useState(
    topicParam ? decodeURIComponent(topicParam) : DEFAULT_PUBLISH_INPUT
  );
  const [guess, setGuess] = useState<ContentGuess>(() =>
    inferContentGuess(
      topicParam ? decodeURIComponent(topicParam) : DEFAULT_PUBLISH_INPUT
    )
  );
  const [imageCount, setImageCount] = useState<ImageCountOption>(initialImageCount);
  const [advancedExpanded, setAdvancedExpanded] = useState(modeParam === "advanced");
  const [loadingStartedAt, setLoadingStartedAt] = useState<number | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [quotaPreview, setQuotaPreview] = useState<{
    cost: number;
    canProceed: boolean;
    freeRemaining?: number;
    isPro?: boolean;
    reason?: string;
  } | null>(null);
  const [quotaPreviewLoading, setQuotaPreviewLoading] = useState(false);
  const [quotaPreviewError, setQuotaPreviewError] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [chipSeed, setChipSeed] = useState(0);
  const topicInputRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [pkg, setPkg] = useState<QuickPublishPackage | null>(null);
  const [loading, setLoading] = useState(false);
  const [payKind, setPayKind] = useState<PayModalKind>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [prefs, setPrefs] = useState<AdvancedPreferences>({
    platforms: ["小红书"],
    feelings: ["温柔治愈"],
    goals: ["想被更多人看见"],
    imageStyleIds: ["ccd"],
    avoidStyles: ["不要AI感", "不要影楼风", "不要太鸡汤"],
    scenePresetIds: [],
  });

  useEffect(() => {
    const t = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % INPUT_PLACEHOLDERS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (topicParam) {
      const t = decodeURIComponent(topicParam);
      setInput(t);
      setGuess(inferContentGuess(t));
    }
    if (reviewBridge.fromReview) {
      setInput((prev) =>
        mergeReviewExtraNote(prev, reviewBridge.reviewHint, reviewBridge.reviewTitle)
      );
    }
  }, [topicParam, reviewBridge.fromReview, reviewBridge.reviewHint, reviewBridge.reviewTitle]);

  useEffect(() => {
    setGuess(inferContentGuess(input));
  }, [input]);

  const isPro = Boolean(user && user.plan !== "free");
  const quota = user ? getTotalQuota(user) : 0;
  const plan = user?.plan ?? "free";

  const advancedPrice = useMemo(
    () => getAdvancedPackCostPoints(imageCount, plan),
    [imageCount, plan]
  );

  const refreshQuotaPreview = useCallback(() => {
    if (!user || !isClientServerMode()) {
      setQuotaPreview(null);
      setQuotaPreviewLoading(false);
      setQuotaPreviewError(false);
      return;
    }
    setQuotaPreviewLoading(true);
    setQuotaPreviewError(false);
    void apiPublishPackageQuotaPreview(
      mode,
      mode === "advanced" ? imageCount : undefined
    ).then((r) => {
      setQuotaPreviewLoading(false);
      if (r.error) {
        setQuotaPreview(null);
        setQuotaPreviewError(true);
        return;
      }
      setQuotaPreview({
        cost: r.cost ?? 0,
        canProceed: Boolean(r.canProceed),
        freeRemaining: r.freeRemaining,
        isPro: r.isPro,
        reason: r.reason,
      });
    });
  }, [user, mode, imageCount]);

  useEffect(() => {
    refreshQuotaPreview();
  }, [refreshQuotaPreview]);

  useEffect(() => {
    if (!isClientServerMode()) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshQuotaPreview();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refreshQuotaPreview]);

  const completeness = useMemo(
    () => calcCompleteness(input, mode, prefs),
    [input, mode, prefs]
  );

  const scenePreview = useMemo(
    () => buildScenePreviewZh(input, guess, prefs),
    [input, guess, prefs]
  );

  const flatInspiration = useMemo(() => {
    const all = Object.values(GROUPED_INSPIRATION).flat();
    const seed = chipSeed;
    return [...all].sort((a, b) => ((a.length + seed) % 11) - ((b.length + seed) % 11));
  }, [chipSeed]);

  const applyTopicLine = useCallback((line: string) => {
    setInput((prev) => {
      const t = prev.trim();
      if (t.length < 6 || t === DEFAULT_PUBLISH_INPUT) return line;
      if (t.includes(line.slice(0, 4))) return prev;
      return `${t}。${line}`;
    });
  }, []);

  const pickInspiration = useCallback(
    (text: string) => {
      setInput(text);
      setGuess(inferContentGuess(text));
      showToast("已填入主题");
      requestAnimationFrame(() => {
        topicInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        topicInputRef.current?.focus();
      });
    },
    [showToast]
  );

  const isInspirationActive = useCallback(
    (text: string) => {
      const t = input.trim();
      return t === text || t.startsWith(`${text}。`) || t.startsWith(`${text},`);
    },
    [input]
  );

  const ensureLogin = () => {
    if (user) return true;
    setLoginOpen(true);
    return false;
  };

  const goPricing = useCallback(() => {
    setPayKind(null);
    router.push("/profile?pricing=1");
  }, [router]);

  const canAfford = (cost: number) => {
    if (!user) return false;
    if (cost === 0) return true;
    if (quotaPreview && !quotaPreview.canProceed && cost === quotaPreview.cost) {
      return false;
    }
    if (getTotalQuota(user) >= cost) return true;
    openQuotaModal({ need: cost, have: getTotalQuota(user) });
    return false;
  };

  const handleBuyProduct = (product: ProductDef) => {
    if (!ensureLogin()) return;
    setPayKind(null);
    createOrder(product);
  };

  const handleEnhance = () => {
    if (input.trim().length < 2) {
      showToast("先随便说一句话～");
      return;
    }
    void run(async () => {
      if (isClientServerMode() && ensureLogin()) {
        const res = await apiEnhancePublishInput({
          topic: input.trim(),
          mode,
          guess,
          preferences: mode === "advanced" ? prefs : undefined,
        });
        if (res.enhanced) {
          setInput(res.enhanced);
          showToast("已帮你补充成更完整的创作想法");
          return;
        }
      }
      const enhanced =
        mode === "quick"
          ? `${input.trim()}。想表达慢下来、治愈自己、生活还有一点光的感觉。适合小红书或朋友圈，语气温柔真实，不要太鸡汤。`
          : `${input.trim()}。适合小红书/朋友圈，语气真实有生活感；图片像 iPhone 随手拍，暖光生活细节，不要 AI 感。`;
      setInput(enhanced);
      showToast("已帮你补充成更完整的创作想法");
    });
  };

  const runGenerate = useCallback(() => {
    if (!ensureLogin()) return;
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      showToast("先说一句话，比如「今日份快乐已到账」");
      return;
    }
    if (trimmed.length > 180) {
      showToast("最多 180 字哦");
      return;
    }

    const cost =
      quotaPreview?.cost ??
      (mode === "quick"
        ? isPro
          ? 0
          : PACK_PRICING.quick.overagePoints
        : advancedPrice);

    if (isClientServerMode() && quotaPreview && !quotaPreview.canProceed) {
      if (mode === "quick") setPayKind("quota");
      else setPayKind("advanced");
      return;
    }

    if (!isClientServerMode() && !canAfford(cost)) {
      if (mode === "quick" && cost > 0) setPayKind("quota");
      else if (mode === "advanced") setPayKind("advanced");
      return;
    }

    setLoading(true);
    setLoadingStartedAt(Date.now());
    setPkg(null);

    void run(async () => {
      let next: QuickPublishPackage | null = null;

      if (isClientServerMode()) {
        const res = await apiQuickPublishPackage({
          topic: trimmed,
          guess,
          mode,
          imageCount: mode === "advanced" ? imageCount : undefined,
          preferences: mode === "advanced" ? prefs : undefined,
          scenePreviewZh: mode === "advanced" ? scenePreview : undefined,
        });
        if (res.error === "quota_insufficient") {
          if (res.quotaHint === "quick_free_exhausted") setPayKind("quota");
          else setPayKind("advanced");
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        }
        if (res.error === "unauthorized") {
          setLoginOpen(true);
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        }
        if (
          res.error === "ark_image_failed" ||
          res.error === "xinghui_image_failed" ||
          res.error === "image_not_configured" ||
          res.error === "xinghui_not_configured"
        ) {
          showToast(
            res.message ??
              "高级配图暂时不可用，请检查星绘 API 配置，或开启 XINGHUI_MOCK=1 演示模式"
          );
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        }
        if (res.user) setUser(res.user);
        if (res.package) {
          next = res.package as QuickPublishPackage;
          addHistory("AI发布包", trimmed, next as unknown as Record<string, unknown>, {
            id: res.generationId,
          });
        } else if (res.error === "timeout") {
          showToast("生成超时：配图较慢，请稍后重试（建议先选 1 张图）");
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        } else if (res.error) {
          showToast(res.message ?? "生成失败，请重试");
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        }
      }

      if (!next) {
        if (mode === "advanced" && isClientServerMode()) {
          showToast("高级图文包配图失败，请检查服务端星绘配置");
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        }
        if (mode === "advanced") {
          showToast("演示模式不支持高级 AI 配图，请使用 server 模式");
          setLoading(false);
          setLoadingStartedAt(null);
          return;
        } else {
          next = mockQuickPublishPackage({ topic: trimmed, guess, mode: "quick" });
        }
        if (user && cost > 0) {
          const u = applyQuotaDeduct(user, cost);
          if (u) setUser(u);
        }
        showToast(isClientServerMode() ? "生成失败，已用演示数据" : "演示模式：已生成内容");
      } else {
        showToast(mode === "quick" ? "文案已生成！" : "高级图文包已生成！");
        void completeTask("pack");
      }

      setPkg(next);
      setLoadingStartedAt(null);
      refreshQuotaPreview();
      setLoading(false);
      setTimeout(() => {
        document.getElementById("pack-v2-result")?.scrollIntoView({ behavior: "smooth" });
      }, 200);
    });
  }, [
    addHistory,
    advancedPrice,
    guess,
    imageCount,
    input,
    isPro,
    mode,
    openQuotaModal,
    prefs,
    run,
    scenePreview,
    setLoginOpen,
    setUser,
    showToast,
    user,
    quotaPreview,
    completeTask,
    refreshQuotaPreview,
  ]);

  const shareSnippet = useMemo(() => {
    if (!pkg) return "";
    const title = pkg.titles[0]?.text ?? pkg.topic;
    const body = pkg.bodies[0]?.text ?? "";
    return [title, body].filter(Boolean).join("\n");
  }, [pkg]);

  const handleRestyle = (bodyId: string, style: RestyleOption) => {
    if (!pkg || !ensureLogin()) return;
    const body = pkg.bodies.find((b) => b.id === bodyId);
    if (!body) return;
    setActionBusy(true);
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageRestyle({
          topic: pkg.topic,
          guess: pkg.guess,
          style,
          bodies: pkg.bodies,
        });
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return;
        }
        if (res.user) setUser(res.user);
        if (res.bodies?.length) {
          setPkg({
            ...pkg,
            bodies: res.bodies.map((b: (typeof pkg.bodies)[number], i: number) => ({
              ...b,
              id: pkg.bodies[i]?.id ?? b.id,
            })),
          });
          showToast(`已按「${style}」改写`);
          return;
        }
      }
      showToast(`已按「${style}」改写（演示）`);
      setPkg({
        ...pkg,
        bodies: pkg.bodies.map((b) =>
          b.id === bodyId ? { ...b, text: `【${style}】\n${b.text}` } : b
        ),
      });
    }).finally(() => setActionBusy(false));
  };

  const handleRegenImage = (imageId: string, asCover: boolean) => {
    if (!pkg || !ensureLogin()) return;
    setActionBusy(true);
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiPublishPackageImages({
          action: "regenerate_one",
          topic: pkg.topic,
          guess: pkg.guess,
          imageId,
          asCover,
        });
        if (res.error === "quota_insufficient") {
          openQuotaModal();
          return;
        }
        if (res.user) setUser(res.user);
        const newImg = res.images?.[0] as PackageImage | undefined;
        if (newImg) {
          setPkg({
            ...pkg,
            images: pkg.images.map((img) => (img.id === imageId ? newImg : img)),
          });
          showToast("已换一张图");
          return;
        }
        showToast("换图失败，请重试");
        return;
      }
      showToast("演示模式不支持换图");
    }).finally(() => setActionBusy(false));
  };

  const handleUpgrade = (target: ImageCountOption) => {
    if (!pkg || !ensureLogin()) return;
    const diff = applyProDiscountPrice(
      PACK_PRICING.advanced[target] - PACK_PRICING.advanced[imageCount],
      plan
    );
    if (!canAfford(diff)) {
      setPayKind("upgrade");
      return;
    }
    void run(async () => {
      if (isClientServerMode()) {
        const res = await apiUpgradePublishPackage({
          package: pkg,
          targetCount: target,
        });
        if (res.error === "quota_insufficient") {
          setPayKind("upgrade");
          return;
        }
        if (res.user) setUser(res.user);
        if (res.package) {
          setPkg(res.package as QuickPublishPackage);
          setImageCount(target);
          showToast(`已升级到 ${target} 张图`);
          return;
        }
      }
      const m = mockQuickPublishPackage({
        topic: pkg.topic,
        guess: pkg.guess,
        mode: "advanced",
      });
      setPkg({ ...pkg, images: m.images.slice(0, target), imageCount: target });
      setImageCount(target);
      if (user) {
        const u = applyQuotaDeduct(user, diff);
        if (u) setUser(u);
      }
      showToast(`已升级到 ${target} 张图（演示）`);
    });
  };

  const handleDevMockPay = (productId: string) => {
    if (!isDevMockPayEnabled() || !user) return;
    setUser({ ...user, bonusQuota: user.bonusQuota + 50 });
    showToast("开发演示：已加 50 灵感");
    setPayKind(null);
  };

  const togglePref = (
    key: "platforms" | "feelings" | "goals" | "avoidStyles",
    value: string,
    max = 6
  ) => {
    setPrefs((p) => {
      const arr = p[key] ?? [];
      const has = arr.includes(value);
      const next = has ? arr.filter((x) => x !== value) : [...arr, value].slice(0, max);
      return { ...p, [key]: next.length ? next : [value] };
    });
  };

  const selectImageStyle = (id: string) => {
    setPrefs((p) => ({ ...p, imageStyleIds: [id] }));
  };

  const selectedStyleId = prefs.imageStyleIds?.[0] ?? "ccd";

  return (
    <AppShell showHeader={false} wide>
      <StudioHeader onBack={() => router.back()} />

      {fromInspiration && topicParam ? (
        <div className="mx-auto max-w-6xl px-3 sm:px-6">
          <InspirationSourceBar
            headline={decodeURIComponent(topicParam).slice(0, 56)}
            subline={
              inspirationHint
                ? "结构参考已带入，生成内容为 AI 原创改写"
                : "结构参考已带入，可直接生成你的版本"
            }
            returnTo={inspirationReturnTo}
            createHref="/create?from=inspiration"
          />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-5 px-3 pb-8 pt-2 sm:px-6 lg:grid-cols-[470px_1fr]">
        <section className="h-fit rounded-[36px] border border-white bg-white/70 p-5 shadow-sm backdrop-blur lg:sticky lg:top-20">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-full bg-pink-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("quick");
                setPkg(null);
              }}
              className={`h-12 rounded-full font-black transition ${
                mode === "quick" ? "bg-white text-pink-500 shadow-sm" : "text-slate-400"
              }`}
            >
              ⚡ 快速出文案
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("advanced");
                setPkg(null);
                setAdvancedExpanded(false);
              }}
              className={`h-12 rounded-full font-black transition ${
                mode === "advanced" ? "bg-white text-pink-500 shadow-sm" : "text-slate-400"
              }`}
            >
              👑 高级图文包
            </button>
          </div>

          <h2 className="text-3xl font-black text-slate-900">
            {mode === "quick" ? "今天想发什么？" : "生成高级图文发布包"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            {mode === "quick"
              ? "随便说一句，AI会帮你补成能发的内容。"
              : "写一句主题，再点选下面画面标签，AI 会按你的选择生成生活感配图。"}
          </p>

          <textarea
            ref={topicInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value.slice(0, 180))}
            className="mt-5 h-36 w-full resize-none rounded-[28px] border border-pink-100 bg-[#fff8f1] p-4 outline-none focus:ring-2 focus:ring-pink-200"
            placeholder={INPUT_PLACEHOLDERS[placeholderIdx]}
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleEnhance}
              disabled={busy}
              className="flex items-center gap-1 text-sm font-black text-pink-500"
            >
              <WandSparkles size={16} />
              让AI更懂我
            </button>
            <span className="text-xs text-slate-400">{input.length}/180</span>
          </div>

          <div className="relative z-10 mt-4 rounded-[24px] border border-pink-100 bg-white/90 p-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-600">一句话灵感</h3>
              <button
                type="button"
                onClick={() => setChipSeed((s) => s + 1)}
                className="text-xs font-bold text-pink-500"
              >
                换一批
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">点一下填入上方主题框</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {flatInspiration.slice(0, 8).map((x) => {
                const active = isInspirationActive(x);
                return (
                  <button
                    key={x}
                    type="button"
                    disabled={busy}
                    onClick={() => pickInspiration(x)}
                    className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-bold transition active:scale-95 ${
                      active
                        ? "border-pink-500 bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm"
                        : "border-pink-100 bg-white text-slate-600 hover:border-pink-300"
                    }`}
                  >
                    {x}
                  </button>
                );
              })}
            </div>
          </div>

          {mode === "advanced" && (
            <>
              <div className="mt-4">
                <PackPromptChips
                  selectedIds={prefs.scenePresetIds ?? []}
                  onChange={(ids) =>
                    setPrefs((p) => ({ ...p, scenePresetIds: ids }))
                  }
                  onPickTopicLine={applyTopicLine}
                />
              </div>
              <button
                type="button"
                onClick={() => setAdvancedExpanded((v) => !v)}
                className="mt-3 flex w-full items-center justify-between rounded-2xl border border-pink-100 bg-white px-4 py-3 text-sm font-black text-slate-700"
              >
                <span>平台 · 风格 · 张数</span>
                <ChevronDown
                  size={18}
                  className={`text-pink-500 transition ${advancedExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </>
          )}

          {mode === "advanced" && advancedExpanded && (
            <div className="mt-4 space-y-4">
              <div className="rounded-[24px] border border-pink-100 bg-white p-4">
                <div className="mb-2 text-xs font-black text-slate-400">发到哪里 · 什么感觉</div>
                <div className="flex flex-wrap gap-2">
                  {SIMPLE_PLATFORMS.map((x) => (
                    <Pill
                      key={x}
                      active={prefs.platforms.includes(x)}
                      onClick={() => togglePref("platforms", x, 2)}
                    >
                      {x}
                    </Pill>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SIMPLE_FEELINGS.map((x) => (
                    <Pill
                      key={x}
                      active={prefs.feelings.includes(x)}
                      onClick={() => togglePref("feelings", x, 2)}
                    >
                      {x}
                    </Pill>
                  ))}
                </div>
              </div>

              <ImageStylePicker
                selectedId={selectedStyleId}
                onSelect={selectImageStyle}
              />

              <div>
                <h3 className="mb-2 text-sm font-black">几张图？</h3>
                <div className="grid grid-cols-3 gap-2">
                  {IMAGE_COUNT_OPTIONS.map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setImageCount(item.count)}
                      className={`rounded-2xl border-2 p-3 text-center transition ${
                        imageCount === item.count
                          ? "border-pink-500 bg-pink-50"
                          : "border-pink-100 bg-white"
                      }`}
                    >
                      <ImageIcon
                        size={18}
                        className={`mx-auto mb-1 ${
                          imageCount === item.count ? "text-pink-500" : "text-slate-300"
                        }`}
                      />
                      <div className="text-sm font-black">{item.count}张</div>
                      <div className="mt-1 flex items-center justify-center gap-0.5 text-[11px] font-bold text-pink-500">
                        <Zap size={10} />
                        {applyProDiscountPrice(item.price, plan)}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-slate-400">
                  建议先选 1～2 张体验；配图约 30～60 秒/张。
                </p>
              </div>

              {completeness.score < 70 && (
                <p className="text-xs text-orange-500">
                  再选 1 个「画面场景」标签，出图会更贴近你想要的样子。
                </p>
              )}
            </div>
          )}

          <p className="mt-3 text-center text-[11px] text-slate-400">
            AI 理解为：{guess.platform} · {guess.personality}
            {mode === "advanced" && (prefs.scenePresetIds?.length ?? 0) > 0
              ? ` · 已选 ${prefs.scenePresetIds!.length} 个画面标签`
              : ""}
          </p>

          {mode === "quick" && !advancedExpanded && (
            <button
              type="button"
              onClick={() => {
                setMode("advanced");
                setImageCount(1);
                setAdvancedExpanded(true);
                showToast("已切换高级模式，默认 1 张真实感配图");
              }}
              className="mt-4 w-full rounded-2xl border border-dashed border-pink-200 bg-pink-50/60 px-4 py-3 text-left"
            >
              <p className="text-sm font-black text-pink-600">想要真实配图？</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-500">
                展开高级模式 · 默认 1 张图 · 约 {getAdvancedPackCostPoints(1, plan)} 灵感
              </p>
            </button>
          )}

          <div className="mt-5 flex items-center justify-between gap-3 rounded-[28px] border border-orange-100 bg-white p-4">
            <div className="min-w-0 flex-1">
              <b>{getPackSummaryTitle(mode, imageCount)}</b>
              <p className="mt-1 text-xs text-slate-400">
                {mode === "quick"
                  ? getQuickPackCostLabel(plan, {
                      isPro: quotaPreview?.isPro ?? isPro,
                      freeRemaining: quotaPreview?.freeRemaining,
                      loading: isClientServerMode() && !!user && quotaPreviewLoading,
                      needsLogin: isClientServerMode() && !user,
                      demo: !isClientServerMode(),
                      error: quotaPreviewError,
                    })
                  : `真实感配图 · ${advancedPrice} 灵感`}
                {mode === "quick" &&
                isClientServerMode() &&
                user &&
                quotaPreview &&
                !quotaPreviewLoading &&
                !quotaPreviewError ? (
                  <span className="ml-1 text-emerald-600">· 已同步</span>
                ) : null}
              </p>
            </div>
            <Sparkles className="shrink-0 text-pink-500" />
          </div>

          {quotaPreviewError && isClientServerMode() && user ? (
            <button
              type="button"
              onClick={refreshQuotaPreview}
              className="mt-2 w-full text-center text-xs font-bold text-pink-500"
            >
              重新同步额度
            </button>
          ) : null}

          <button
            type="button"
            disabled={busy || loading || (isClientServerMode() && !!user && quotaPreviewLoading)}
            onClick={runGenerate}
            className="mt-5 flex h-14 w-full items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-orange-400 text-lg font-black text-white shadow-lg shadow-pink-200 disabled:opacity-60"
          >
            {getPackGenerateButtonLabel(mode, imageCount, plan)}
          </button>
          <p className="mt-3 text-center text-xs text-slate-400">
            {mode === "quick"
              ? "快速模式不生成图片，成本低，先轻松体验。"
              : "选好画面标签 + 图片风格，AI 会生成更真实的生活感配图。"}
          </p>
          <p className="mt-1 text-center text-[10px] text-slate-300">
            灵感余额 {quota}
            {isPro ? " · Pro 已激活" : ""}
          </p>
        </section>

        <section id="pack-v2-result" className="min-h-[640px]">
          {!pkg && !loading && (
            <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-[36px] border-2 border-dashed border-pink-200 bg-white/45 p-10 text-center">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-gradient-to-br from-pink-500 to-orange-400 text-white shadow-lg shadow-pink-200">
                <Sparkles size={36} />
              </div>
              <h2 className="text-2xl font-black">生成结果会出现在这里</h2>
              <p className="mt-2 max-w-md leading-6 text-slate-400">
                快速模式先出标题文案；高级模式可选 1/2/4 张真实感图片，像博主随手拍。
              </p>
            </div>
          )}
          {loading && loadingStartedAt !== null && (
            <PackV2LoadingProgress mode={mode} startedAt={loadingStartedAt} />
          )}
          {pkg && !loading && (
            <PackV2Result
              pkg={pkg}
              mode={mode}
              imageCount={imageCount}
              plan={plan}
              favorites={favorites}
              isPro={isPro}
              onShare={() => setShareOpen(true)}
              onToast={(msg) => showToast(msg)}
              onCopy={(text, msg) => {
                void navigator.clipboard.writeText(text);
                showToast(msg ?? "已复制");
              }}
              onFavorite={(id) => {
                setFavorites((s) => {
                  const n = new Set(s);
                  if (n.has(id)) n.delete(id);
                  else n.add(id);
                  return n;
                });
                showToast("已收藏");
              }}
              onUpgrade={handleUpgrade}
              onPay={(k) => setPayKind(k)}
              onSwitchAdvanced={(count) => {
                setMode("advanced");
                setImageCount(count);
                setPkg(null);
                setAdvancedExpanded(true);
                showToast(`已切换高级模式：${count}张图`);
              }}
              onRestyle={handleRestyle}
              onRegenImage={mode === "advanced" ? handleRegenImage : undefined}
              actionBusy={actionBusy}
            />
          )}
        </section>
      </div>

      <PackV2PayModal
        open={payKind !== null}
        kind={payKind}
        onClose={() => setPayKind(null)}
        onBuy={handleBuyProduct}
        onGoPricing={goPricing}
        onMockPay={isDevMockPayEnabled() ? handleDevMockPay : undefined}
      />

      {pkg ? (
        <PublishSharePoster
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          pack={pkg as unknown as Record<string, unknown>}
          snippet={shareSnippet}
        />
      ) : null}
    </AppShell>
  );
}
