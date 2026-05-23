"use client";

import { useApp } from "@/contexts/app-context";
import {
  labeledGoals,
  labeledPlatforms,
  labeledStyles,
  labeledTracks,
} from "@/lib/i18n/form-options";
import { cn } from "@/lib/utils";

function ChipRow({
  emoji,
  label,
  value,
  options,
  onChange,
}: {
  emoji: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5">
        <span className="text-sm">{emoji}</span>
        <span className="text-[11px] font-bold text-slate-600">{label}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-95",
                active
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-[0_4px_12px_rgba(255,107,107,0.35)]"
                  : "bg-white/90 text-slate-600 ring-1 ring-orange-100/90 hover:ring-[#FF7AAE]/40"
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ContentFormChips(props: {
  platform: string;
  track: string;
  goal: string;
  style: string;
  onPlatform: (v: string) => void;
  onTrack: (v: string) => void;
  onGoal: (v: string) => void;
  onStyle: (v: string) => void;
  compact?: boolean;
}) {
  const { tr } = useApp();

  if (props.compact) {
    const tags = [props.platform, props.track, props.goal, props.style].filter(Boolean);
    return (
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-[#FF7AAE] ring-1 ring-[#FF7AAE]/25"
          >
            {t}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <ChipRow
        emoji="📱"
        label={tr("labelPlatform")}
        value={props.platform}
        options={labeledPlatforms(tr)}
        onChange={props.onPlatform}
      />
      <ChipRow
        emoji="🎯"
        label={tr("labelTrack")}
        value={props.track}
        options={labeledTracks(tr)}
        onChange={props.onTrack}
      />
      <ChipRow
        emoji="🔥"
        label={tr("labelGoal")}
        value={props.goal}
        options={labeledGoals(tr)}
        onChange={props.onGoal}
      />
      <ChipRow
        emoji="💫"
        label={tr("labelStyle")}
        value={props.style}
        options={labeledStyles(tr)}
        onChange={props.onStyle}
      />
    </div>
  );
}
