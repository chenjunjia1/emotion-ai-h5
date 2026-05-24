"use client";

import { useState } from "react";
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
import { TopicBoxSetup } from "@/components/play/topic-box-setup";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { hasSsrBuffToday } from "@/lib/quest-loot";
import {
  displayField,
  normalizeTopicBoxResult,
} from "@/lib/ai/normalize-ai-result";
import {
  GOAL_VALUES,
  PLATFORM_VALUES,
  STYLE_VALUES,
  TRACK_VALUES,
} from "@/lib/i18n/form-options";
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
  const { tr, showToast } = useApp();
  const { drawTopicBox, lastTopicBox, growth, dailyUsage, featureLimits } = useProduct();
  const topicBoxUsed = dailyUsage.topicBox;
  const topicBoxLimit = featureLimits.topicBox;
  const topicBoxRemain = Math.max(0, topicBoxLimit - topicBoxUsed);
  const [platform, setPlatform] = useState<string>(PLATFORM_VALUES[0]);
  const [track, setTrack] = useState<string>(TRACK_VALUES[3]);
  const [goal, setGoal] = useState<string>(GOAL_VALUES[0]);
  const [style, setStyle] = useState<string>(STYLE_VALUES[0]);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [rarity, setRarity] = useState<DropRarity>("N");
  const [phase, setPhase] = useState<BlindBoxPhase>("idle");
  const { run, busy } = useAsyncAction();

  const onOpen = () =>
    void run(async () => {
      const rolled = rollTopicRarity(growth.streakDays, hasSsrBuffToday());
      const input = { platform, track, goal, style };
      const r = await runBlindBoxReveal(
        () => drawTopicBox(input),
        setPhase
      );
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
    flattenTopicBox(result, { platform, track, goal, style }) ??
    flattenTopicBox(lastTopicBox, { platform, track, goal, style });
  const displayRarity = (result?.rarity as DropRarity) ?? rarity;
  const meta = RARITY_META[displayRarity];
  const isIdle = phase === "idle";

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🎲"
        title={tr("featTopicBox")}
        desc={tr("featTopicBoxDesc")}
      />

      <div
        className={cn(
          "mb-3 flex flex-wrap items-center justify-center gap-1.5 rounded-2xl px-3 py-2 text-[10px]",
          "bg-gradient-to-r from-[#FFF0F5] to-[#FFF8EE] ring-1 ring-[#FF7AAE]/20"
        )}
      >
        <span className="font-bold text-[#FF7AAE]">✨ {tr("ssrHint")}</span>
        <span className="text-slate-500">
          · {tr("streakDays")} <b className="text-slate-700">{growth.streakDays}</b>{" "}
          {tr("ssrBonusDays")}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-bold",
            topicBoxRemain > 0
              ? "bg-white text-[#FF5C8A] ring-1 ring-[#FF7AAE]/25"
              : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
          )}
        >
          {tr("topicBoxRemain")
            .replace("{remain}", String(topicBoxRemain))
            .replace("{limit}", String(topicBoxLimit))}
        </span>
        {hasSsrBuffToday() && (
          <span className="font-bold text-amber-600">· 👑 欧气符</span>
        )}
      </div>

      {isIdle ? (
        <div className="cream-card overflow-hidden rounded-[28px] p-4 shadow-[0_10px_28px_rgba(255,122,174,0.1)] ring-1 ring-orange-100/60">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF7AAE] to-[#FFC46B] text-xs">
              🎯
            </span>
            <div>
              <p className="text-xs font-black text-slate-800">开盒前选赛道</p>
              <p className="text-[10px] text-slate-500">点一下胶囊，AI 更懂你要发啥</p>
            </div>
          </div>
          <TopicBoxSetup
            platform={platform}
            track={track}
            goal={goal}
            style={style}
            onPlatform={setPlatform}
            onTrack={setTrack}
            onGoal={setGoal}
            onStyle={setStyle}
          />
          <div className="my-3 h-px bg-gradient-to-r from-transparent via-[#FF7AAE]/20 to-transparent" />
          <BlindBoxStage
            embedded
            phase={phase}
            onOpen={onOpen}
            busy={busy}
            openLabel={tr("blindboxOpen")}
            shakingLabel={tr("blindboxShaking")}
            openingLabel={tr("blindboxOpening")}
            surpriseLabel={tr("blindboxSurprise")}
            idleHint={tr("blindboxIdleHint")}
          />
        </div>
      ) : (
        <BlindBoxStage
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
      )}

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
                {meta.emoji} {meta.label} · 今日选题
              </span>
              <Sparkles size={14} className="text-white/80" />
            </div>
            <p className="mt-1.5 text-base font-black leading-snug">
              {displayField(r.topic)}
            </p>
          </div>
          <CardContent className="space-y-3 pt-3 text-sm leading-6">
            <TopicBoxSetup
              compact
              platform={platform}
              track={track}
              goal={goal}
              style={style}
              onPlatform={setPlatform}
              onTrack={setTrack}
              onGoal={setGoal}
              onStyle={setStyle}
            />
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
