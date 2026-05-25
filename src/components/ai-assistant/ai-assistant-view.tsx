"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  Bot,
  ChevronRight,
  Flame,
  Loader2,
  Package,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AiAssistantAnswerPreview } from "@/components/ai-assistant/ai-assistant-answer-preview";
import { AiAssistantHeroBanner } from "@/components/ai-assistant/ai-assistant-hero-banner";
import { AiAssistantLiveTicker } from "@/components/ai-assistant/ai-assistant-live-ticker";
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
  BUDDY_PROMPT_GROUPS,
  BUDDY_QUICK_PROMPTS,
  type BuddyPromptCategory,
  type BuddyQuickPrompt,
} from "@/lib/operation-chat/buddy-prompts";
import type { OpsConsultantResult } from "@/lib/operation-chat/quick-prompts";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

const GROUP_ICON: Record<BuddyPromptCategory, typeof Flame> = {
  topic: Flame,
  write: Sparkles,
  grow: TrendingUp,
};

function SceneCard({
  q,
  busy,
  activePromptId,
  hasResult,
  onPick,
}: {
  q: BuddyQuickPrompt;
  busy: boolean;
  activePromptId: string | null;
  hasResult: boolean;
  onPick: (id: string, prompt: string) => void;
}) {
  const loading = activePromptId === q.id && busy;
  const done = activePromptId === q.id && !busy && hasResult;

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => onPick(q.id, q.prompt)}
      className={cn(
        "relative flex w-[156px] shrink-0 flex-col rounded-[18px] bg-gradient-to-br p-3.5 text-left shadow-sm transition active:scale-[0.97]",
        q.tint,
        done ? "ring-2 ring-[#FF4F8B] shadow-md" : "ring-1 ring-[#FFE8F0]",
        busy && !loading && "opacity-55"
      )}
    >
      {q.hot ? (
        <span className="absolute right-2 top-2 rounded-md bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-1.5 py-0.5 text-[7px] font-black text-white shadow-sm">
          HOT
        </span>
      ) : null}
      {loading ? (
        <Loader2 size={14} className="absolute right-2 top-2 animate-spin text-[#FF4F8B]" />
      ) : null}
      <span className="text-[26px] leading-none drop-shadow-sm">{q.emoji}</span>
      <span className="mt-2 text-[12px] font-black leading-tight text-[#1F2937]">{q.label}</span>
      <span className="mt-0.5 line-clamp-2 text-[9px] leading-snug text-[#8A94A6]">{q.desc}</span>
      <span className="mt-2 inline-flex items-center gap-0.5 self-start rounded-full bg-white/85 px-2 py-0.5 text-[8px] font-black text-[#FF4F8B] ring-1 ring-[#FFE8F0]">
        {q.outcome}
        <ChevronRight size={10} />
      </span>
    </button>
  );
}

export function AiAssistantView() {
  const { tr, showToast, user } = useApp();
  const { analyzeEmotionChat } = useProduct();
  const { run, busy } = useAsyncAction();
  const [message, setMessage] = useState("");
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [result, setResult] = useState<OpsConsultantResult | null>(null);
  const [chipIdx, setChipIdx] = useState(0);
  const cost = QUOTA_COST.emotion_chat ?? 5;
  const totalQuota = user ? getTotalQuota(user) : 0;

  const featured = useMemo(
    () => BUDDY_QUICK_PROMPTS.find((p) => p.id === BUDDY_FEATURED_ID) ?? BUDDY_QUICK_PROMPTS[0]!,
    []
  );

  const grouped = useMemo(() => {
    const map = new Map<BuddyPromptCategory, BuddyQuickPrompt[]>();
    for (const g of BUDDY_PROMPT_GROUPS) map.set(g.id, []);
    for (const p of BUDDY_QUICK_PROMPTS) {
      if (p.id === featured.id) continue;
      map.get(p.category)?.push(p);
    }
    return map;
  }, [featured.id]);

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

  const onSubmit = () => {
    setActivePromptId(null);
    void run(async () => {
      await submitQuestion(message, undefined);
    });
  };

  const onQuickPick = (id: string, prompt: string) => {
    setResult(null);
    void run(async () => {
      await submitQuestion(prompt, id);
    });
  };

  const copyAnswer = useCallback(() => {
    if (!result?.analysis) return;
    void copyToClipboard(result.analysis);
    showToast(tr("copied"));
  }, [result, showToast, tr]);

  const showEmpty = !result && !busy;

  return (
    <div className="flex flex-col gap-3 pb-[10.5rem]">
      <AiAssistantHeroBanner
        tr={tr}
        totalQuota={totalQuota}
        cost={cost}
        featuredLabel={featured.label}
        featuredEmoji={featured.emoji}
        disabled={busy}
        onPrimaryClick={() => onQuickPick(featured.id, featured.prompt)}
      />

      {showEmpty ? <AiAssistantLiveTicker /> : null}

      <section>
        <div className="mb-2.5 flex items-end justify-between px-0.5">
          <div>
            <p className="text-[13px] font-black text-[#1F2937]">{tr("buddyChatQuickTitle")}</p>
            <p className="mt-0.5 text-[10px] text-[#9CA3AF]">选一个场景，30 秒拿可复制建议</p>
          </div>
          <span className="rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-2.5 py-0.5 text-[8px] font-black text-white shadow-sm">
            最多人问
          </span>
        </div>

        {BUDDY_PROMPT_GROUPS.map((group) => {
          const items = grouped.get(group.id) ?? [];
          if (!items.length) return null;
          const Icon = GROUP_ICON[group.id];
          return (
            <section key={group.id} className="mb-3">
              <div className="mb-2 flex items-center gap-2 px-0.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#FFF0F5]">
                  <Icon size={13} className="text-[#FF4F8B]" />
                </span>
                <p className="text-[12px] font-black text-[#1F2937]">{group.label}</p>
                <span className="text-[10px] text-[#B0B8C4]">{group.hint}</span>
              </div>
              <div className="-mx-0.5 flex gap-2.5 overflow-x-auto px-0.5 pb-1 scrollbar-none">
                {items.map((q) => (
                  <SceneCard
                    key={q.id}
                    q={q}
                    busy={busy}
                    activePromptId={activePromptId}
                    hasResult={Boolean(result)}
                    onPick={onQuickPick}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </section>

      {showEmpty ? <AiAssistantAnswerPreview /> : null}

      {showEmpty ? (
        <section>
          <p className="mb-2 px-0.5 text-[11px] font-black text-[#8A94A6]">大家都在问</p>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {BUDDY_POPULAR_CHIPS.map((chip, i) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setChipIdx(i);
                  setMessage(chip);
                }}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-[10px] font-bold transition active:scale-95",
                  chipIdx === i && message === chip
                    ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm"
                    : "bg-white text-[#6B7280] ring-1 ring-[#FFE8F0]"
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
              <p className="text-[10px] text-[#9CA3AF]">结构化建议 · 可复制 · 可续作</p>
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

          <p className="text-center text-[10px] font-bold text-[#9CA3AF]">
            {tr("buddyChatResultHint")}
          </p>

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
        <section className="overflow-hidden rounded-[22px] bg-white shadow-[0_-6px_32px_rgba(255,100,140,0.18)] ring-1 ring-[#FFD0E8]">
          <div className="h-0.5 bg-gradient-to-r from-[#FF4F8B] via-[#FF9A4D] to-[#FFB347]" />
          <div className="p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] text-white shadow-sm">
                <Bot size={16} />
              </span>
              <p className="text-[11px] font-black text-[#1F2937]">{tr("opsChatInputLabel")}</p>
            </div>
            <textarea
              className="mt-2 w-full resize-none rounded-xl bg-[#FAFAFA] p-2.5 text-[12px] leading-relaxed text-[#1F2937] outline-none ring-1 ring-[#F0F0F0] placeholder:text-[#9CA3AF] focus:bg-[#FFF8FA] focus:ring-[#FFD0E8]"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
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
