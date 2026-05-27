"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Copy,
  ImagePlus,
  MessageSquare,
  RefreshCw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { ChatModeSwitcher } from "@/components/expression/chat-mode-switcher";
import { CreamCard } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import {
  CHAT_FAQ_SCENES,
  CHAT_MOCK_ANALYSIS,
  CHAT_MOCK_REPLIES,
  CHAT_REPLY_TYPES,
  CHAT_SCENARIO_SAMPLES,
  CHAT_SCENARIOS,
  type ChatScenarioId,
} from "@/lib/mock/expression-assistant";
import {
  ExpressionApiError,
  apiExpressionGenerate,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

const HERO_STATS = [
  { n: "12w+", label: "高情商回复" },
  { n: "3s", label: "出结果" },
  { n: "12种", label: "语气风格" },
];

export function ChatStrategistContent() {
  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const [paste, setPaste] = useState("");
  const [replyType, setReplyType] = useState("safe");
  const [analyzed, setAnalyzed] = useState(false);
  const [batch, setBatch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiReplies, setApiReplies] = useState<string[] | null>(null);
  const [apiAnalysis, setApiAnalysis] = useState<typeof CHAT_MOCK_ANALYSIS | null>(null);

  const replies =
    apiReplies ?? (CHAT_MOCK_REPLIES[replyType] ?? CHAT_MOCK_REPLIES.safe);
  const analysis = apiAnalysis ?? CHAT_MOCK_ANALYSIS;

  const onAnalyze = useCallback(async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (!paste.trim()) {
      showToast("请先粘贴聊天记录");
      return;
    }
    if (!canAffordQuota(user, "expression_chat_reply")) {
      openQuotaModal({
        need: getQuotaCost("expression_chat_reply"),
        have: getTotalQuota(user),
      });
      showToast("灵感不足，请充值或开通会员");
      return;
    }
    setLoading(true);
    try {
      const res = await apiExpressionGenerate({
        kind: "chat_reply",
        prompt: paste,
        replyTone: replyType,
      });
      if (res.user) setUser(res.user);
      if (res.replies?.length) setApiReplies(res.replies);
      if (res.analysis) {
        setApiAnalysis({
          attitude: { label: res.analysis.attitude ?? "友好", percent: 72 },
          relation: {
            label: res.analysis.relation ?? "熟悉",
            hint: "可自然接话延续话题",
          },
          mood: { label: res.analysis.mood ?? "轻松", hint: "适合轻松接梗" },
        });
      }
      setAnalyzed(true);
      showToast(res.quotaCost ? `已生成（消耗 ${res.quotaCost} 灵感）` : "分析完成");
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("分析失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  }, [
    user,
    paste,
    replyType,
    setLoginOpen,
    showToast,
    openQuotaModal,
    setUser,
  ]);

  const applyScenario = (id: ChatScenarioId) => {
    setPaste(CHAT_SCENARIO_SAMPLES[id] ?? "");
    setAnalyzed(false);
  };

  return (
    <div className="chat-strategist-page space-y-3 pb-2">
      <ChatModeSwitcher active="strategist" />

      <section className="chat-strategist-hero relative overflow-hidden rounded-[20px] p-3.5">
        <div className="chat-strategist-aurora pointer-events-none absolute inset-0" aria-hidden />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="flex items-center gap-1 text-[10px] font-bold text-[#FF4F8B]">
                <Sparkles size={11} />
                微信 / 企微聊天 · 得体又好接
              </p>
              <h1 className="mt-0.5 text-[20px] font-black leading-tight text-[#1F2937]">
                不会回消息？
                <span className="bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] bg-clip-text text-transparent">
                  {" "}
                  我来帮你想
                </span>
              </h1>
            </div>
            <span
              className="chat-strategist-float flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#FF7AAE] to-[#FF9EC4] text-2xl shadow-[0_8px_24px_rgba(255,79,139,0.4)] ring-2 ring-white/60"
              aria-hidden
            >
              💬
            </span>
          </div>

          <div className="mt-3 flex gap-2">
            {HERO_STATS.map((s) => (
              <div
                key={s.label}
                className="flex-1 rounded-[12px] bg-white/70 px-2 py-1.5 text-center ring-1 ring-white/80 backdrop-blur-sm"
              >
                <p className="text-[13px] font-black text-[#FF4F8B]">{s.n}</p>
                <p className="text-[8px] font-medium text-[#9CA3AF]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
        {CHAT_SCENARIOS.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => applyScenario(s.id)}
            className="chat-hero-stagger flex shrink-0 flex-col items-start rounded-[14px] bg-white px-3 py-2 ring-1 ring-[#FFE8F0] active:scale-95"
            style={{ animationDelay: `${0.05 + i * 0.04}s` }}
          >
            <span className="text-lg leading-none">{s.emoji}</span>
            <span className="mt-0.5 text-[11px] font-black text-[#374151]">{s.label}</span>
            <span className="text-[9px] text-[#9CA3AF]">{s.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          className="flex items-center justify-center gap-1.5 rounded-[14px] bg-gradient-to-r from-[#FF7AAE] to-[#FF9EC4] py-2.5 text-[12px] font-bold text-white shadow-[0_4px_14px_rgba(255,79,139,0.35)] active:scale-[0.98]"
          onClick={() => document.getElementById("chat-paste")?.focus()}
        >
          <MessageSquare size={15} />
          粘贴聊天记录
        </button>
        <Link
          href="/expression/chat-screenshot"
          className="flex items-center justify-center gap-1.5 rounded-[14px] bg-white py-2.5 text-[12px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0] active:scale-[0.98]"
        >
          <ImagePlus size={15} />
          上传聊天截图
        </Link>
      </div>

      <div className="rounded-[18px] bg-white p-1 ring-1 ring-[#FFE8F0] shadow-sm">
        <textarea
          id="chat-paste"
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          placeholder="粘贴微信 / 企微聊天记录，每行一条…&#10;例：对方：在吗&#10;我：在的呀"
          rows={5}
          className="w-full resize-none rounded-[14px] bg-[#FFFBFC] p-3 text-[13px] leading-relaxed text-[#374151] outline-none placeholder:text-[#B0B8C4] focus:bg-white focus:ring-2 focus:ring-[#FF4F8B]/25"
        />
        <div className="flex flex-wrap gap-1.5 px-2 pb-2 pt-1">
          {CHAT_REPLY_TYPES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setReplyType(t.id)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold transition",
                replyType === t.id
                  ? "bg-[#FF4F8B] text-white"
                  : "bg-[#FFF0F5] text-[#6B7280]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => void onAnalyze()}
        className="chat-cta-shimmer flex w-full items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-[14px] font-black text-white shadow-[0_6px_20px_rgba(255,79,139,0.4)] disabled:opacity-60 active:scale-[0.98]"
      >
        {loading ? (
          <RefreshCw size={18} className="animate-spin" />
        ) : (
          <Zap size={18} className="fill-white/30" />
        )}
        {loading ? "分析中…" : "开始分析 · 生成高情商回复"}
      </button>

      {analyzed ? (
        <div className="chat-results-enter space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-[#1F2937]">分析结果</h2>
            <span className="flex items-center gap-1 rounded-full bg-[#ECFDF5] px-2 py-0.5 text-[9px] font-bold text-[#059669]">
              <Shield size={10} />
              已识别语境
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: "attitude", data: analysis.attitude, bar: true },
                { key: "relation", data: analysis.relation, bar: false },
                { key: "mood", data: analysis.mood, bar: false },
              ] as const
            ).map(({ key, data, bar }) => (
              <CreamCard key={key} className="p-2.5 text-center">
                <p className="text-[9px] text-[#9CA3AF]">
                  {key === "attitude" ? "对方态度" : key === "relation" ? "当前关系" : "聊天氛围"}
                </p>
                <p className="mt-0.5 text-[11px] font-black text-[#1F2937]">{data.label}</p>
                {bar && "percent" in data ? (
                  <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F3F4F6]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D]"
                      style={{ width: `${data.percent}%` }}
                    />
                  </div>
                ) : (
                  <p className="mt-0.5 text-[8px] text-[#FF4F8B]">
                    {"hint" in data ? data.hint : ""}
                  </p>
                )}
              </CreamCard>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-black text-[#1F2937]">推荐回复</h2>
            <button
              type="button"
              onClick={() => setBatch((b) => b + 1)}
              className="flex items-center gap-0.5 text-[11px] font-bold text-[#FF4F8B]"
            >
              <RefreshCw size={12} />
              换一批
            </button>
          </div>

          <div className="space-y-2">
            {replies.map((text, i) => (
              <CreamCard
                key={`${replyType}-${batch}-${i}`}
                className="relative overflow-hidden p-3 ring-[#FFE8F0]"
              >
                <span className="absolute right-2 top-2 rounded-md bg-[#FFF0F5] px-1.5 py-px text-[8px] font-black text-[#FF4F8B]">
                  {CHAT_REPLY_TYPES.find((t) => t.id === replyType)?.label}
                </span>
                <p className="pr-12 text-[13px] leading-relaxed text-[#374151]">{text}</p>
                <button
                  type="button"
                  className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#FF4F8B]"
                  onClick={() => {
                    void navigator.clipboard?.writeText(text);
                    showToast("已复制");
                  }}
                >
                  <Copy size={12} />
                  复制这条
                </button>
              </CreamCard>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-2 text-[13px] font-black text-[#1F2937]">热门场景 · 点一下填入</h2>
        <div className="space-y-1.5">
          {CHAT_FAQ_SCENES.map((scene, i) => (
            <button
              key={scene.title}
              type="button"
              onClick={() => {
                setPaste(scene.paste);
                setAnalyzed(false);
              }}
              className="chat-faq-row flex w-full items-center gap-2 rounded-[14px] bg-white px-3 py-2.5 text-left ring-1 ring-[#FFE8F0] active:bg-[#FFF0F5]"
              style={{ animationDelay: `${0.1 + i * 0.03}s` }}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FFF0F5] text-sm">
                {scene.emoji}
              </span>
              <span className="min-w-0 flex-1 text-[12px] font-medium text-[#374151]">
                {scene.title}
              </span>
              <ChevronRight size={14} className="shrink-0 text-[#C4C9D4]" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
