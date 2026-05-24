"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useAsyncAction } from "@/hooks/use-async-action";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { QUOTA_COST } from "@/lib/constants/v1";
import { OPS_QUICK_PROMPTS, type OpsConsultantResult } from "@/lib/operation-chat/quick-prompts";
import { QuotaCostBadge } from "@/components/ui/quota-cost-badge";
import { cn } from "@/lib/utils";

export default function OperationConsultantPage() {
  const { tr, showToast } = useApp();
  const { analyzeEmotionChat } = useProduct();
  const { run, busy } = useAsyncAction();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<OpsConsultantResult | null>(null);
  const cost = QUOTA_COST.emotion_chat ?? 5;

  const onAsk = (text: string) => {
    setMessage(text);
    setResult(null);
  };

  const onSubmit = () =>
    void run(async () => {
      const q = message.trim();
      if (!q) {
        showToast(tr("opsChatEmpty"));
        return;
      }
      const r = await analyzeEmotionChat({
        chat: q,
        relationship: "新手博主",
        goal: "涨粉起号",
        style: "口语化实用",
      });
      if (!r) {
        showToast(tr("generateFailed"));
        return;
      }
      const raw = r as Record<string, unknown>;
      setResult({
        analysis: String(raw.analysis ?? raw.insight ?? raw.reply ?? ""),
        todayTopics: (raw.todayTopics as string[]) ?? (raw.titleSuggestions as string[]) ?? [],
        titleSuggestions: (raw.titleSuggestions as string[]) ?? [],
        contentStructure: (raw.contentStructure as string[]) ?? (raw.tips as string[]) ?? [],
        publishTips: (raw.publishTips as string[]) ?? [],
        recommendPublishPack: Boolean(raw.recommendPublishPack),
        recommendHotTopic: String(raw.recommendHotTopic ?? ""),
      });
      showToast(tr("opsChatDone"));
    });

  const copyAnswer = useCallback(() => {
    if (!result?.analysis) return;
    void copyToClipboard(result.analysis);
    showToast(tr("copied"));
  }, [result, showToast, tr]);

  return (
    <AppShell>
      <SectionTitle eyebrow="🤖" title={tr("opsChatTitle")} desc={tr("opsChatDesc")} />

      <Card className="mb-4 overflow-hidden border-[#FF4F8B]/25 shadow-lg">
        <div className="bg-gradient-to-br from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] px-4 py-4 text-white">
          <p className="text-sm font-black">{tr("opsChatHeroTitle")}</p>
          <p className="mt-1 text-[11px] text-white/90">{tr("opsChatHeroSub")}</p>
        </div>
      </Card>

      <p className="mb-2 text-xs font-black text-[#1F2937]">{tr("opsChatQuickTitle")}</p>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {OPS_QUICK_PROMPTS.map((q) => (
          <button
            key={q.id}
            type="button"
            onClick={() => onAsk(q.prompt)}
            className="rounded-2xl border border-[#FFE0EC] bg-white p-3 text-left text-[11px] font-bold text-[#1F2937] shadow-sm active:scale-[0.98] hover:border-[#FF4F8B]/40"
          >
            <span className="mr-1">{q.emoji}</span>
            {q.label}
          </button>
        ))}
      </div>

      <div className="cream-card rounded-[22px] p-4">
        <label className="text-[11px] font-bold text-[#8A94A6]">{tr("opsChatInputLabel")}</label>
        <textarea
          className="mt-2 w-full resize-none rounded-2xl border-0 bg-[#FFF4F7] p-3 text-sm text-[#1F2937] ring-2 ring-[#FFE0EC] outline-none focus:ring-[#FF4F8B]/40"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={tr("opsChatInputPlaceholder")}
        />
        <div className="mt-3 flex items-center justify-between gap-2">
          <QuotaCostBadge cost={cost} />
          <Button
            disabled={busy || !message.trim()}
            onClick={onSubmit}
            className="rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] font-black"
          >
            <Send size={16} className="mr-1" />
            {busy ? tr("loading") : tr("opsChatSubmit")}
          </Button>
        </div>
      </div>

      {result ? (
        <Card id="ops-result" className="mt-4 border-[#FF4F8B]/20">
          <CardContent className="space-y-3 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-[#1F2937]">{tr("opsChatResultTitle")}</p>
              <button type="button" onClick={copyAnswer} className="text-[11px] font-bold text-[#FF4F8B]">
                {tr("copy")}
              </button>
            </div>
            <p className="text-sm leading-7 text-[#1F2937]/90">{result.analysis}</p>
            {result.todayTopics && result.todayTopics.length > 0 ? (
              <Section title={tr("opsChatTopics")}>
                <ul className="space-y-1 text-sm text-[#1F2937]">
                  {result.todayTopics.map((t) => (
                    <li key={t}>· {t}</li>
                  ))}
                </ul>
              </Section>
            ) : null}
            {result.titleSuggestions && result.titleSuggestions.length > 0 ? (
              <Section title={tr("opsChatTitles")}>
                <ul className="space-y-1 text-sm text-[#FF4F8B]">
                  {result.titleSuggestions.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </Section>
            ) : null}
            {result.recommendPublishPack ? (
              <Link
                href="/publish-pack"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-2.5 text-sm font-black text-white"
              >
                <Sparkles size={16} />
                {tr("opsChatGoPublishPack")}
              </Link>
            ) : null}
            {result.recommendHotTopic ? (
              <Link
                href={`/publish-pack?topic=${encodeURIComponent(result.recommendHotTopic)}`}
                className="block text-center text-[11px] font-bold text-[#FF9A4D]"
              >
                {tr("opsChatGoHot")}：{result.recommendHotTopic}
              </Link>
            ) : null}
          </CardContent>
        </Card>
      ) : null}
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-[#FFF4F7] p-3">
      <p className="mb-1 text-[11px] font-black text-[#FF4F8B]">{title}</p>
      {children}
    </div>
  );
}

