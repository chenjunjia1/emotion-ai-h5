"use client";

import { useEffect, useMemo, useState } from "react";
import { useAsyncAction } from "@/hooks/use-async-action";
import Link from "next/link";
import { Copy, RefreshCw, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  BlindBoxStage,
  feedbackForRarity,
  runBlindBoxReveal,
  type BlindBoxPhase,
} from "@/components/play/blind-box-stage";
import { TopicBoxQuickPick } from "@/components/play/topic-box-quick-pick";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { hasSsrBuffToday } from "@/lib/quest-loot";
import {
  displayField,
  normalizeTopicBoxResult,
} from "@/lib/ai/normalize-ai-result";
import { defaultTopicBoxInput } from "@/lib/topic-box/defaults";
import { rollTopicRarity, type DropRarity } from "@/lib/play-rarity";
import { RARITY_META } from "@/lib/play-rarity";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function flattenTopicBox(
  raw: Record<string, unknown> | null,
  input: { platform: string; track: string; goal: string; style: string }
): Record<string, unknown> | null {
  if (!raw) return null;
  const inner =
    raw.output && typeof raw.output === "object"
      ? (raw.output as Record<string, unknown>)
      : raw;
  return normalizeTopicBoxResult(inner, input);
}

export default function TopicBoxPage() {
  const { user, tr, showToast } = useApp();
  const { drawTopicBox, lastTopicBox, growth, dailyUsage, featureLimits } = useProduct();
  const topicBoxUsed = dailyUsage.topicBox;
  const topicBoxLimit = featureLimits.topicBox;
  const topicBoxRemain = Math.max(0, topicBoxLimit - topicBoxUsed);

  const defaults = useMemo(() => defaultTopicBoxInput(user?.id), [user?.id]);
  const [platform, setPlatform] = useState(defaults.platform);
  const [track, setTrack] = useState(defaults.track);
  const goal = defaults.goal;
  const style = defaults.style;

  useEffect(() => {
    setPlatform(defaults.platform);
    setTrack(defaults.track);
  }, [defaults.platform, defaults.track]);

  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [rarity, setRarity] = useState<DropRarity>("N");
  const [phase, setPhase] = useState<BlindBoxPhase>("idle");
  const { run, busy } = useAsyncAction();

  const input = { platform, track, goal, style };

  const onOpen = () =>
    void run(async () => {
      const rolled = rollTopicRarity(growth.streakDays, hasSsrBuffToday());
      const r = await runBlindBoxReveal(() => drawTopicBox(input), setPhase);
      const flat =
        flattenTopicBox((r as Record<string, unknown>) ?? lastTopicBox, input);
      if (!flat?.topic) {
        setPhase("idle");
        setResult(null);
        showToast(tr("generateFailed"));
        return;
      }
      setRarity(rolled);
      setResult({ ...flat, rarity: rolled });
      feedbackForRarity(rolled);
      if (rolled === "SSR") {
        showToast(tr("ssrDropToast"));
      } else if (rolled === "SR") {
        showToast(tr("srDropToast"));
      } else {
        showToast(tr("blindboxSurprise"));
      }
    });

  const onAgain = () => {
    setPhase("idle");
    setResult(null);
    setRarity("N");
  };

  const r =
    flattenTopicBox(result, input) ?? flattenTopicBox(lastTopicBox, input);
  const displayRarity = (result?.rarity as DropRarity) ?? rarity;
  const meta = RARITY_META[displayRarity];
  const isIdle = phase === "idle";

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🎁"
        title={tr("featTopicBox")}
        desc={tr("featTopicBoxDesc")}
      />

      <p className="mb-4 text-center text-[11px] text-slate-500">
        <span
          className={cn(
            "mr-2 inline-block rounded-full px-2.5 py-0.5 font-bold",
            topicBoxRemain > 0
              ? "bg-[#FFF0F5] text-[#FF5C8A] ring-1 ring-[#FF7AAE]/25"
              : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
          )}
        >
          {tr("topicBoxRemain")
            .replace("{remain}", String(topicBoxRemain))
            .replace("{limit}", String(topicBoxLimit))}
        </span>
        {hasSsrBuffToday() && (
          <span className="font-bold text-amber-600">👑 欧气加成</span>
        )}
      </p>

      {isIdle && (
        <TopicBoxQuickPick
          platform={platform}
          onPlatform={(v) => setPlatform(v as typeof platform)}
        />
      )}

      <BlindBoxStage
        embedded={false}
        phase={phase}
        onOpen={onOpen}
        busy={busy}
        openLabel={tr("blindboxOpen")}
        shakingLabel={tr("blindboxShaking")}
        openingLabel={tr("blindboxOpening")}
        surpriseLabel={tr("blindboxSurprise")}
        revealedTopic={
          phase === "revealed" && r ? displayField(r.topic, "") : undefined
        }
        rarity={phase === "revealed" ? displayRarity : "N"}
        idleHint={tr("blindboxIdleHint")}
      />

      {phase === "revealed" && !r && (
        <Card className="mt-4 overflow-hidden border-orange-100/80">
          <CardContent className="py-8 text-center">
            <p className="animate-pulse text-sm font-bold text-[#FF7AAE]">
              {tr("blindboxOpening")}
            </p>
          </CardContent>
        </Card>
      )}

      {phase === "revealed" && r && (
        <Card className="mt-4 overflow-hidden border-orange-100/80">
          <div
            className={cn(
              "px-4 py-3 text-white",
              `bg-gradient-to-r ${meta.gradient}`,
              meta.extra
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-white/85">
                {meta.emoji} {meta.label} · {platform}
              </span>
              <Sparkles size={14} className="text-white/80" />
            </div>
            <p className="mt-1.5 text-base font-black leading-snug">
              {displayField(r.topic)}
            </p>
          </div>
          <CardContent className="space-y-3 pt-3 text-sm leading-6">
            {displayRarity === "SSR" && (
              <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                {tr("ssrDropDesc")}
              </p>
            )}
            <div className="grid gap-2 rounded-2xl bg-orange-50/60 p-3 text-xs">
              <p>
                <span className="font-bold text-[#FF7AAE]">推荐形式</span>
                <br />
                {displayField(r.format)}
              </p>
              <p>
                <span className="font-bold text-[#FF7AAE]">切入角度</span>
                <br />
                {displayField(r.angle)}
              </p>
              <p>
                <span className="font-bold text-[#FF7AAE]">为什么今天适合发</span>
                <br />
                {displayField(r.whyToday)}
              </p>
            </div>
            <div className="grid gap-2">
              <Link
                href={`/publish-pack?topic=${encodeURIComponent(displayField(r.topic, ""))}`}
                className={cn(
                  "flex items-center justify-center gap-1 rounded-2xl py-3 text-sm font-bold text-white",
                  `bg-gradient-to-r ${theme.primary}`
                )}
              >
                <Sparkles size={16} />
                {tr("topicBoxToPack")}
              </Link>
              <Button variant="secondary" onClick={onAgain} disabled={busy}>
                <RefreshCw size={16} /> {tr("blindboxAgain")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  void copyToClipboard(displayField(r.topic, ""));
                  showToast(tr("saved"));
                }}
              >
                <Copy size={16} /> {tr("topicBoxSave")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
