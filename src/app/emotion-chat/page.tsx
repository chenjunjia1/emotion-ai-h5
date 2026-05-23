"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Copy, Dices, Heart, MessageCircle, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmotionHeartbeatMeter } from "@/components/emotion/emotion-heartbeat-meter";
import { EmotionFormChips } from "@/components/emotion/emotion-form-chips";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  formatInspirationCount,
  getTodayInspirationCount,
  msUntilNextInspirationTick,
} from "@/lib/banner-inspiration-count";
import { getDailyEmotionScenarios, RELATIONSHIP_MOOD } from "@/lib/emotion-chat/scenarios";
import {
  EMOTION_GOAL_VALUES,
  EMOTION_STYLE_VALUES,
  RELATIONSHIP_VALUES,
} from "@/lib/emotion-chat-options";
import { QUOTA_COST } from "@/lib/constants/v1";
import { DemoContentBadge } from "@/components/ui/demo-content-badge";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { HintTip } from "@/components/ui/hint-tip";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type EmotionResult = {
  stage?: string;
  heartbeat?: number;
  heartbeatLabel?: string;
  insight?: string;
  tips?: string[];
  replies?: { tone: string; text: string }[];
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function EmotionChatPage() {
  const { tr, showToast } = useApp();
  const { analyzeEmotionChat } = useProduct();
  const { run, busy } = useAsyncAction();
  const [chat, setChat] = useState("");
  const [relationship, setRelationship] = useState<string>(RELATIONSHIP_VALUES[0]);
  const [goal, setGoal] = useState<string>(EMOTION_GOAL_VALUES[0]);
  const [style, setStyle] = useState<string>(EMOTION_STYLE_VALUES[0]);
  const [result, setResult] = useState<EmotionResult | null>(null);
  const [scenarioBatch, setScenarioBatch] = useState(0);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [socialCount, setSocialCount] = useState(() => getTodayInspirationCount());
  const [contentDemo, setContentDemo] = useState(false);
  const emotionCost = QUOTA_COST.emotion_chat ?? 2;

  const scenarios = useMemo(
    () => getDailyEmotionScenarios(todayKey(), scenarioBatch, 12),
    [scenarioBatch]
  );

  const mood = RELATIONSHIP_MOOD[relationship] ?? { emoji: "💗", hint: "先接住情绪，再表达你的想法" };

  useEffect(() => {
    const tick = () => setSocialCount(getTodayInspirationCount());
    tick();
    const id = window.setInterval(tick, msUntilNextInspirationTick());
    return () => window.clearInterval(id);
  }, []);

  const onAnalyze = () =>
    void run(async () => {
      const text = chat.trim();
      if (!text) {
        showToast(tr("emotionChatInputPlaceholder"));
        return;
      }
      const r = await analyzeEmotionChat({
        chat: text,
        relationship,
        goal,
        style,
      });
      if (r) {
        const row = r as EmotionResult & { usedMock?: boolean };
        setContentDemo(Boolean(row.usedMock));
        setResult(row);
        showToast(tr("emotionChatDone"));
        setTimeout(() => {
          document.getElementById("emotion-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      } else showToast(tr("generateFailed"));
    });

  const onShuffleScenarios = () => {
    setScenarioBatch((b) => b + 1);
    showToast(tr("emotionChatScenariosShuffleDone"));
  };

  const pickScenario = (text: string) => {
    setChat(text);
    setResult(null);
  };

  const copyReply = useCallback(
    (text: string) => {
      void copyToClipboard(text);
      showToast(tr("copied"));
    },
    [showToast, tr]
  );

  return (
    <AppShell>
      <SectionTitle
        eyebrow="💗"
        title={tr("emotionChatTitle")}
        desc={tr("emotionChatDesc")}
      />

      <Card className="mb-3 overflow-hidden border-[#FF7AAE]/30 shadow-[0_8px_28px_rgba(255,122,174,0.15)]">
        <div className="bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-4 py-3.5 text-white">
          <p className="inline-flex rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black backdrop-blur-sm">
            {tr("emotionChatHeroTag")}
          </p>
          <p className="mt-2 text-[11px] font-semibold text-white/90">
            {tr("emotionChatSocialProof").replace("{count}", formatInspirationCount(socialCount))}
          </p>
          <div className="mt-3 flex gap-2">
            {[
              { n: "1", label: tr("emotionChatStep1") },
              { n: "2", label: tr("emotionChatStep2") },
              { n: "3", label: tr("emotionChatStep3") },
            ].map((s) => (
              <div
                key={s.n}
                className="flex flex-1 flex-col items-center rounded-xl bg-white/15 px-1 py-1.5 backdrop-blur-sm"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#FF5C8A]">
                  {s.n}
                </span>
                <span className="mt-0.5 text-[9px] font-bold">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="flex items-center gap-1 text-[11px] font-black text-[#FF5C8A]">
            <MessageCircle size={13} />
            {tr("emotionChatScenariosTitle")}
          </p>
          <button
            type="button"
            onClick={onShuffleScenarios}
            className="inline-flex items-center gap-0.5 rounded-full bg-white px-2 py-1 text-[9px] font-bold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/25 active:scale-95"
          >
            <Dices size={11} />
            {tr("emotionChatScenariosShuffle")}
          </button>
        </div>
        <div className="max-h-[88px] overflow-y-auto overscroll-contain rounded-xl border border-orange-100/80 bg-white/70 p-1.5">
          <div className="flex flex-wrap gap-1.5">
            {scenarios.map((s) => (
              <button
                key={`${scenarioBatch}-${s}`}
                type="button"
                onClick={() => pickScenario(s)}
                className={cn(
                  "rounded-full px-2 py-1 text-left text-[10px] font-semibold leading-snug transition active:scale-95",
                  chat === s
                    ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white"
                    : "bg-orange-50/90 text-slate-600 ring-1 ring-orange-100"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="cream-card rounded-[28px] p-4 shadow-[0_10px_28px_rgba(255,122,174,0.1)] ring-1 ring-orange-100/60">
        {chat.trim() ? (
          <div className="mb-3 flex justify-start">
            <div className="max-w-[88%] rounded-2xl rounded-tl-md bg-white px-3 py-2 shadow-sm ring-1 ring-orange-100/80">
              <p className="text-[9px] font-bold text-slate-400">{tr("emotionChatTaSays")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-800">{chat.trim()}</p>
            </div>
          </div>
        ) : (
          <p className="mb-2 text-center text-[10px] text-slate-400">{tr("emotionEmptyHint")}</p>
        )}

        <label className="block text-xs font-bold text-slate-700">
          {tr("emotionChatInputLabel")}
          <textarea
            value={chat}
            onChange={(e) => {
              setChat(e.target.value);
              if (result) setResult(null);
            }}
            placeholder={tr("emotionChatInputPlaceholder")}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border-0 bg-white px-3 py-2.5 text-sm leading-relaxed text-slate-800 shadow-inner ring-2 ring-[#FF7AAE]/20 outline-none focus:ring-[#FF7AAE]/45"
          />
        </label>
        <p className="mt-1 text-right text-[10px] text-slate-400">{chat.length} 字</p>

        <div className="mt-2 rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-orange-50/50 px-3 py-2">
          <p className="text-[10px] font-bold text-[#FF5C8A]">
            {tr("emotionMoodHint")} {mood.emoji} {relationship}
          </p>
          <p className="mt-0.5 text-[10px] leading-relaxed text-slate-600">{mood.hint}</p>
        </div>

        <div className="mt-3">
          <EmotionFormChips
            relationship={relationship}
            goal={goal}
            style={style}
            onRelationship={setRelationship}
            onGoal={setGoal}
            onStyle={setStyle}
            labels={{
              relation: tr("emotionChatRelation"),
              goal: tr("emotionChatGoal"),
              style: tr("emotionChatStyle"),
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setRulesOpen((v) => !v)}
          className="mt-2 text-[10px] font-bold text-orange-600"
        >
          {rulesOpen ? "▲" : "▼"} {tr("emotionChatRulesTitle")}
        </button>
        {rulesOpen ? (
          <ul className="mt-1 space-y-0.5 text-[10px] text-slate-500">
            <li>· {tr("emotionChatRule1")}</li>
            <li>· {tr("emotionChatRule2")}</li>
            <li>· {tr("emotionChatRule3")}</li>
          </ul>
        ) : null}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <QuotaCostBadge cost={emotionCost} />
          <HintTip
            title={tr("featEmotionChat")}
            body={tr("emotionQuotaHint")}
            okLabel={tr("profileHintOk")}
            ariaLabel={tr("profileHintAria")}
          />
        </div>
        <Button
          className={cn("mt-4 w-full rounded-2xl py-3.5 font-black text-white shadow-lg", theme.primary)}
          disabled={busy || !chat.trim()}
          onClick={onAnalyze}
        >
          <Sparkles size={16} className="mr-1" />
          {busy ? tr("loading") : tr("emotionChatBtn")}
        </Button>
        <p className="mt-1.5 text-center text-[9px] text-slate-400">{tr("emotionChatBtnSub")}</p>
      </div>

      {result ? (
        <Card id="emotion-result" className="mt-4 overflow-hidden border-[#FF7AAE]/30 shadow-lg">
          <div className="bg-gradient-to-br from-[#FF6B6B] via-[#FF7AAE] to-[#FF9EC4] px-4 py-4">
            <div className="mb-2 flex justify-end">
              <DemoContentBadge show={contentDemo} label={tr("demoContentLabel")} />
            </div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold text-white/80">{tr("emotionChatStage")}</p>
                <p className="text-lg font-black leading-tight">{result.stage}</p>
              </div>
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-lg">{mood.emoji}</span>
            </div>
            <div className="mt-3">
              <EmotionHeartbeatMeter
                value={result.heartbeat ?? 50}
                label={result.heartbeatLabel}
              />
            </div>
          </div>

          <CardContent className="space-y-3 pt-3">
            <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-3">
              <p className="flex items-center gap-1 text-xs font-black text-[#FF5C8A]">
                <Heart size={12} className="fill-[#FF7AAE] text-[#FF7AAE]" />
                {tr("emotionInsight")}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-700">{result.insight}</p>
            </div>

            {result.tips?.length ? (
              <div className="rounded-xl bg-orange-50/60 p-2.5">
                <p className="text-[10px] font-black text-orange-800">{tr("emotionTips")}</p>
                <ul className="mt-1 space-y-0.5">
                  {result.tips.map((t) => (
                    <li key={t} className="text-[10px] leading-relaxed text-slate-600">
                      · {t}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="text-xs font-black text-slate-800">{tr("emotionReplies")}</p>
            {result.replies?.map((r, idx) => (
              <button
                key={r.tone}
                type="button"
                onClick={() => copyReply(r.text)}
                className={cn(
                  "w-full rounded-2xl border p-3 text-left transition active:scale-[0.99]",
                  idx === 0
                    ? "border-[#FF7AAE] bg-[#FFF0F5] ring-2 ring-[#FF7AAE]/25"
                    : "border-orange-100/80 bg-white"
                )}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF7AAE]">
                    {idx === 0 ? (
                      <span className="rounded bg-[#FF7AAE] px-1 py-0.5 text-[8px] text-white">
                        {tr("emotionReplyBest")}
                      </span>
                    ) : null}
                    {r.tone}
                  </span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-orange-600">
                    <Copy size={11} />
                    {tr("emotionCopyReply")}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-slate-700">{r.text}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}
