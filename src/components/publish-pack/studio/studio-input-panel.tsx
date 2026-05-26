"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { StudioGuessCard } from "@/components/publish-pack/studio/studio-guess-card";
import { StepChipGrid } from "@/components/v1/step-chip-grid";
import type { ContentGuess } from "@/lib/publish-pack/quick-package-types";
import {
  INSPIRATION_CHIP_POOL,
  PRO_DAILY_IMAGE_GRANTS,
  STUDIO_QUOTA,
} from "@/lib/publish-pack/studio-config";
import {
  ACCOUNT_TYPE_VALUES,
  PUBLISH_GOAL_VALUES,
  PUBLISH_STYLE_VALUES,
} from "@/lib/i18n/publish-form-options";
import { inferContentGuess } from "@/lib/publish-pack/infer-guess";
import { cn } from "@/lib/utils";

function shuffleChips(seed: number) {
  const arr = [...INSPIRATION_CHIP_POOL];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr.slice(0, 8);
}

export function StudioInputPanel({
  topic,
  onTopicChange,
  mode,
  onModeChange,
  guess,
  onGuessChange,
  extraNote,
  onExtraNoteChange,
  busy,
  onGenerate,
  quotaTotal,
  isPro,
  onOpenPro,
}: {
  topic: string;
  onTopicChange: (v: string) => void;
  mode: "quick" | "advanced";
  onModeChange: (m: "quick" | "advanced") => void;
  guess: ContentGuess;
  onGuessChange: (g: ContentGuess) => void;
  extraNote: string;
  onExtraNoteChange: (v: string) => void;
  busy: boolean;
  onGenerate: () => void;
  quotaTotal: number;
  isPro: boolean;
  onOpenPro: () => void;
}) {
  const [chipSeed, setChipSeed] = useState(0);
  const [providerHint, setProviderHint] = useState<string | null>(null);
  const chips = useMemo(() => shuffleChips(chipSeed), [chipSeed]);
  const showGuess = topic.trim().length >= 2;

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    void fetch("/api/dev/image-providers")
      .then((r) => r.json())
      .then((d) => {
        const parts: string[] = [];
        if (d.fal) parts.push("AI配图 fal.ai");
        else if (d.pexels) parts.push("Pexels 实景");
        else parts.push("本地占位图");
        if (d.openai) parts.push("高级封面 OpenAI");
        setProviderHint(parts.join(" · "));
      })
      .catch(() => setProviderHint(null));
  }, []);

  return (
    <div className="space-y-4">
      {providerHint ? (
        <p className="rounded-xl bg-[#FFF8FB] px-3 py-2 text-[10px] font-bold text-[#8A94A6] ring-1 ring-inset ring-[#FFE8F0]">
          本地配图通道：{providerHint}
          {!providerHint.includes("fal") ? (
            <span className="text-[#FF4F8B]"> · 在 .env.local 填 FAL_KEY 可启用真 AI 生图</span>
          ) : null}
        </p>
      ) : null}
      <div>
        <h2 className="text-[20px] font-black text-[#1F2937]">今天想发什么？</h2>
        <p className="mt-1 text-[12px] text-[#8A94A6]">
          说一句话，AI 帮你出标题、文案和配图
        </p>
      </div>

      <div className="flex rounded-2xl bg-[#FFF0F5]/60 p-1 ring-1 ring-inset ring-[#FFE8F0]">
        {(["quick", "advanced"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1 rounded-xl py-2 text-[11px] font-black transition-all duration-200",
              mode === m
                ? "bg-white text-[#FF4F8B] shadow-sm"
                : "text-[#8A94A6]"
            )}
          >
            {m === "quick" ? <Sparkles size={13} /> : <Wand2 size={13} />}
            {m === "quick" ? "快速模式" : "高级模式"}
          </button>
        ))}
      </div>

      <div className="rounded-[20px] bg-white p-3 ring-1 ring-inset ring-[#FFE8F0] shadow-sm">
        <textarea
          className="min-h-[88px] w-full resize-none bg-transparent text-[14px] leading-relaxed text-[#1F2937] outline-none placeholder:text-[#B0B8C4]"
          placeholder="例如：今天下班好累，想发一条有松弛感的内容"
          maxLength={100}
          value={topic}
          onChange={(e) => {
            onTopicChange(e.target.value);
            if (e.target.value.trim().length >= 2) {
              onGuessChange(inferContentGuess(e.target.value));
            }
          }}
        />
        <p className="text-right text-[10px] font-bold text-[#8A94A6]">{topic.length}/100</p>
      </div>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-black text-[#1F2937]">灵感一下</p>
          <button
            type="button"
            onClick={() => setChipSeed((s) => s + 1)}
            className="text-[10px] font-bold text-[#FF4F8B]"
          >
            换一批
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => {
                onTopicChange(chip);
                onGuessChange(inferContentGuess(chip));
              }}
              className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0] active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>
      </section>

      {showGuess ? (
        <StudioGuessCard
          guess={guess}
          onChange={onGuessChange}
          onShuffle={() => onGuessChange(inferContentGuess(`${topic}-${Date.now()}`))}
        />
      ) : null}

      {mode === "advanced" ? (
        <div className="space-y-3 rounded-[20px] bg-white p-3 ring-1 ring-inset ring-[#FFE8F0]">
          <StepChipGrid
            step={1}
            title="账号类型"
            options={ACCOUNT_TYPE_VALUES}
            value={guess.personality.includes("干货") ? "职场号" : "生活号"}
            onChange={() => {}}
          />
          <StepChipGrid
            step={2}
            title="内容风格"
            options={PUBLISH_STYLE_VALUES}
            value={guess.contentStyle}
            onChange={(v) => onGuessChange({ ...guess, contentStyle: v })}
            columns={3}
          />
          <StepChipGrid
            step={3}
            title="生成目标"
            options={PUBLISH_GOAL_VALUES}
            value={guess.goal}
            onChange={(v) => onGuessChange({ ...guess, goal: v })}
            columns={3}
          />
          <textarea
            className="w-full resize-none rounded-xl bg-[#FFF8FB] p-2.5 text-[11px] ring-1 ring-inset ring-[#FFE8F0] outline-none"
            rows={2}
            maxLength={200}
            placeholder="补充说明（选填）"
            value={extraNote}
            onChange={(e) => onExtraNoteChange(e.target.value)}
          />
        </div>
      ) : null}

      <button
        type="button"
        disabled={busy || topic.trim().length < 2}
        onClick={onGenerate}
        className="flex w-full flex-col items-center gap-0.5 rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-4 text-white shadow-[0_10px_28px_rgba(255,79,139,0.35)] disabled:opacity-45"
      >
        <span className="flex items-center gap-2 text-[15px] font-black">
          <Sparkles size={18} className={busy ? "animate-spin" : ""} />
          {busy ? "生成中…" : "✨ 帮我直接出图文"}
        </span>
        <span className="text-[10px] font-semibold text-white/90">
          消耗 {STUDIO_QUOTA.fullPackage} 灵感 · 当前 {quotaTotal} 灵感
        </span>
      </button>

      <div className="flex items-center justify-between rounded-2xl bg-[#FFF8FB] px-3 py-2.5 ring-1 ring-inset ring-[#FFE8F0]">
        <div className="text-[10px] font-bold text-[#5A6478]">
          <p>今日免费 · 普通配图 {isPro ? `1/${PRO_DAILY_IMAGE_GRANTS.regularImages}` : "0/1"}</p>
          <p className="mt-0.5">高级封面 {isPro ? `0/${PRO_DAILY_IMAGE_GRANTS.premiumCovers}` : "0/0"}</p>
        </div>
        <button
          type="button"
          onClick={onOpenPro}
          className="shrink-0 rounded-full bg-gradient-to-r from-[#FFC46B] to-[#FF9A4D] px-3 py-1.5 text-[10px] font-black text-white"
        >
          开通 Pro
        </button>
      </div>
    </div>
  );
}
