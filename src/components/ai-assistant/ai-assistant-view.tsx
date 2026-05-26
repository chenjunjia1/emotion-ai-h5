"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Bot,
  ChevronRight,
  Flame,
  Loader2,
  Package,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { AiAssistantHeroBanner } from "@/components/ai-assistant/ai-assistant-hero-banner";
import { AiAssistantLiveTicker } from "@/components/ai-assistant/ai-assistant-live-ticker";
import { AiAssistantSceneGrid } from "@/components/ai-assistant/ai-assistant-scene-grid";
import { GeneratingProgressCard } from "@/components/ui/generating-progress-card";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { QUOTA_COST } from "@/lib/constants/v1";
import {
  BUDDY_FEATURED_ID,
  BUDDY_POPULAR_CHIPS,
  BUDDY_QUICK_PROMPTS,
} from "@/lib/operation-chat/buddy-prompts";
import type { OpsConsultantResult } from "@/lib/operation-chat/quick-prompts";
import { loadAiProfile } from "@/lib/onboarding/ai-profile";
import { DEFAULT_AVATAR_ID, normalizeAvatarId } from "@/lib/onboarding/options";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

export function AiAssistantView() {
  const { tr, showToast, user } = useApp();
  const { analyzeEmotionChat } = useProduct();
  const { run, busy } = useAsyncAction();
  const [message, setMessage] = useState("");
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [result, setResult] = useState<OpsConsultantResult | null>(null);
  const [chipSeed, setChipSeed] = useState(0);
  const cost = QUOTA_COST.emotion_chat ?? 5;
  const totalQuota = user ? getTotalQuota(user) : 0;
  const avatarId = user
    ? normalizeAvatarId(loadAiProfile(user.id)?.avatarId ?? DEFAULT_AVATAR_ID)
    : DEFAULT_AVATAR_ID;

  const featured = useMemo(
    () => BUDDY_QUICK_PROMPTS.find((p) => p.id === BUDDY_FEATURED_ID) ?? BUDDY_QUICK_PROMPTS[0]!,
    []
  );

  const popularChips = useMemo(() => {
    const list = [...BUDDY_POPULAR_CHIPS];
    const seed = chipSeed;
    return list.sort((a, b) => ((a.length + seed) % 9) - ((b.length + seed) % 9));
  }, [chipSeed]);

  const submitQuestion = useCallback(
    async (raw: string, promptId?: string) => {
      const q = raw.trim();
      if (!q) {
        showToast(tr("opsChatEmpty"));
        return;
      }
      if (promptId) setActivePromptId(promptId);
      setMessage(q);

      const r = await analyzeEmotionChat({
        chat: q,
        relationship: "想涨粉的素人博主",
        goal: "今天能发出去",
        style: "口语、接地气",
      });
      if (!r) {
        showToast(tr("generateFailed"));
        return;
      }
      const data = r as Record<string, unknown>;
      setResult({
        analysis: String(data.analysis ?? data.insight ?? data.reply ?? ""),
        todayTopics: (data.todayTopics as string[]) ?? [],
        titleSuggestions: (data.titleSuggestions as string[]) ?? [],
        contentStructure: (data.contentStructure as string[]) ?? (data.tips as string[]) ?? [],
        publishTips: (data.publishTips as string[]) ?? [],
        recommendPublishPack: Boolean(data.recommendPublishPack),
        recommendHotTopic: String(data.recommendHotTopic ?? ""),
      });
      showToast(tr("opsChatDone"));
      requestAnimationFrame(() => {
        document.getElementById("ops-result")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    },
    [analyzeEmotionChat, showToast, tr]
  );

  const askNow = useCallback(
    (prompt: string, promptId?: string) => {
      setResult(null);
      void run(async () => {
        await submitQuestion(prompt, promptId);
      });
    },
    [run, submitQuestion]
  );

  const fillPrompt = useCallback((prompt: string, promptId?: string) => {
    setResult(null);
    setMessage(prompt);
    if (promptId) setActivePromptId(promptId);
    requestAnimationFrame(() => {
      const el = document.getElementById("buddy-chat-input");
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }, []);

  const onSubmit = () => {
    const promptId = activePromptId ?? undefined;
    void run(async () => {
      await submitQuestion(message, promptId);
    });
  };

  const onChipPick = (chip: string) => {
    setActivePromptId(null);
    fillPrompt(chip);
  };

  const copyAnswer = useCallback(() => {
    if (!result?.analysis) return;
    void copyToClipboard(result.analysis);
    showToast(tr("copied"));
  }, [result, showToast, tr]);

  const showEmpty = !result && !busy;

  return (
    <div className="flex flex-col gap-3 pb-[9.5rem]">
      <AiAssistantHeroBanner
        tr={tr}
        avatarId={avatarId}
        totalQuota={totalQuota}
        cost={cost}
        featuredLabel={featured.label}
        featuredEmoji={featured.emoji}
        disabled={busy}
        onPrimaryClick={() => askNow(featured.prompt, featured.id)}
      />

      {showEmpty ? <AiAssistantLiveTicker compact /> : null}

      <section className="rounded-[22px] bg-white p-3.5 ring-1 ring-[#FFE8F0] shadow-sm">
        <div className="mb-3 flex items-end justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-[14px] font-black text-[#1F2937]">
              <Sparkles size={15} className="text-[#FF4F8B]" />
              点一下，马上出建议
            </p>
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">点卡片填入下方问题，确认后点发送提问</p>
          </div>
          <span className="shrink-0 rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-black text-[#FF4F8B]">
            消耗 {cost} 灵感/次
          </span>
        </div>

        <AiAssistantSceneGrid
          prompts={BUDDY_QUICK_PROMPTS}
          busy={busy}
          activePromptId={activePromptId}
          hasResult={Boolean(result)}
          onPick={(id, prompt) => fillPrompt(prompt, id)}
        />
      </section>

      {showEmpty ? (
        <section className="rounded-[20px] bg-[#FFFBFC] px-3 py-2.5 ring-1 ring-[#FFE8F0]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-[11px] font-black text-[#6B7280]">换种问法</p>
            <button
              type="button"
              onClick={() => setChipSeed((s) => s + 1)}
              className="flex items-center gap-0.5 text-[10px] font-bold text-[#FF4F8B]"
            >
              <RefreshCw size={11} />
              换一批
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {popularChips.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={busy}
                onClick={() => onChipPick(chip)}
                className={cn(
                  "max-w-full rounded-full px-3 py-2 text-left text-[10px] font-bold leading-snug transition active:scale-95",
                  message.trim() === chip
                    ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm"
                    : "bg-white text-[#4B5563] ring-1 ring-[#FFE8F0] hover:ring-[#FFB8D4]"
                )}
              >
                {chip}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {busy && !result ? (
        <GeneratingProgressCard
          title={tr("buddyChatThinking")}
          subtitle={message.trim() || undefined}
          stages={[
            "读懂你的账号与平台…",
            "匹配选题与标题套路…",
            "整理口播结构与发布建议…",
            "快好了 ✨",
          ]}
        />
      ) : null}

      {result && !busy ? (
        <div
          id="ops-result"
          className="space-y-3 rounded-[22px] bg-white p-4 ring-1 ring-[#FFE8F0] shadow-[0_8px_28px_rgba(255,120,150,0.14)]"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-md">
              <Bot size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-black text-[#1F2937]">{tr("opsChatResultTitle")}</p>
              <p className="text-[10px] text-[#9CA3AF]">可复制 · 可去发布包继续</p>
            </div>
            <button
              type="button"
              onClick={copyAnswer}
              className="shrink-0 rounded-full bg-[#FFF0F5] px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B]"
            >
              {tr("copy")}全文
            </button>
          </div>

          <p className="rounded-2xl bg-[#FAFAFA] p-3.5 text-[13px] leading-7 text-[#374151]">
            {result.analysis}
          </p>

          {result.contentStructure && result.contentStructure.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-black text-[#FF4F8B]">内容结构</p>
              <ul className="rounded-xl bg-[#FFF8FB] p-2.5 text-[11px] text-[#374151]">
                {result.contentStructure.slice(0, 5).map((line) => (
                  <li key={line} className="flex gap-1.5 py-0.5">
                    <span className="text-[#FF4F8B]">·</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.titleSuggestions && result.titleSuggestions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-black text-[#FF4F8B]">{tr("opsChatTitles")}</p>
              {result.titleSuggestions.slice(0, 4).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    void copyToClipboard(t);
                    showToast(tr("copied"));
                  }}
                  className="block w-full rounded-xl bg-[#FFF4F7] px-3 py-2.5 text-left text-[12px] font-bold text-[#1F2937] ring-1 ring-[#FFE8F0] active:bg-[#FFE8F0]"
                >
                  {t}
                </button>
              ))}
            </div>
          ) : null}

          {result.todayTopics && result.todayTopics.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-black text-[#FF4F8B]">{tr("opsChatTopics")}</p>
              <ul className="space-y-1 rounded-xl bg-[#FFF8FB] p-2.5 text-[12px] text-[#374151]">
                {result.todayTopics.slice(0, 4).map((t) => (
                  <li key={t} className="flex gap-1.5">
                    <span className="text-[#FF4F8B]">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.publishTips && result.publishTips.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-black text-[#FF4F8B]">发布小贴士</p>
              <ul className="space-y-1 text-[11px] text-[#6B7280]">
                {result.publishTips.slice(0, 3).map((tip) => (
                  <li key={tip} className="flex gap-1.5 rounded-lg bg-[#FFFBF8] px-2 py-1.5 ring-1 ring-[#FFE8F0]">
                    <span>💡</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <Link
              href="/publish-pack"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-[13px] font-black text-white shadow-md active:scale-[0.98]"
            >
              <Package size={16} />
              {tr("opsChatGoPublishPack")}
            </Link>
            {result.recommendHotTopic ? (
              <Link
                href={`/publish-pack?topic=${encodeURIComponent(result.recommendHotTopic)}`}
                className="flex items-center justify-center gap-1 rounded-full bg-[#FFF0F5] py-2.5 text-[11px] font-bold text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
              >
                <Flame size={14} />
                {tr("opsChatGoHot")}：{result.recommendHotTopic}
              </Link>
            ) : (
              <Link
                href="/hot-topics"
                className="flex items-center justify-center gap-1 rounded-full bg-[#FFF0F5] py-2.5 text-[11px] font-bold text-[#FF4F8B] ring-1 ring-[#FFD0E8]"
              >
                <Flame size={14} />
                {tr("buddyChatGoHot")}
                <ChevronRight size={14} />
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setResult(null);
              setActivePromptId(null);
            }}
            className="w-full py-1 text-center text-[11px] font-bold text-[#9CA3AF]"
          >
            {tr("buddyChatRegenerate")}
          </button>
        </div>
      ) : null}

      <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 mx-auto max-w-lg px-3">
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_-4px_24px_rgba(255,100,140,0.16)] ring-1 ring-[#FFD0E8]">
          <div className="h-0.5 bg-gradient-to-r from-[#FF4F8B] via-[#FF9A4D] to-[#FFB347]" />
          <div className="p-2.5">
            <p className="px-1 text-[10px] font-bold text-[#9CA3AF]">或自己输入问题</p>
            <textarea
              id="buddy-chat-input"
              className="mt-1 w-full resize-none rounded-xl bg-[#FAFAFA] p-2.5 text-[12px] leading-relaxed text-[#1F2937] outline-none ring-1 ring-[#F0F0F0] placeholder:text-[#9CA3AF] focus:bg-[#FFF8FA] focus:ring-[#FFD0E8]"
              rows={2}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setActivePromptId(null);
              }}
              placeholder={tr("opsChatInputPlaceholder")}
              disabled={busy}
            />
            <div className="mt-2 flex items-center gap-2">
              <QuotaCostBadge cost={cost} className="shrink-0 scale-90" />
              <button
                type="button"
                disabled={busy || !message.trim()}
                onClick={onSubmit}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[12px] font-black text-white shadow-md transition active:scale-[0.98]",
                  "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] disabled:opacity-45 disabled:shadow-none"
                )}
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {busy ? tr("buddyChatThinking") : tr("buddyChatSubmit")}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
