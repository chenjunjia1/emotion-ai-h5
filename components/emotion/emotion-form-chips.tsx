"use client";

import {
  EMOTION_GOAL_VALUES,
  EMOTION_STYLE_VALUES,
  RELATIONSHIP_VALUES,
} from "@/lib/emotion-chat-options";
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
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-slate-600">
        <span>{emoji}</span>
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={cn(
              "rounded-full px-2.5 py-1 text-[11px] font-bold transition active:scale-95",
              value === o
                ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-md"
                : "bg-white text-slate-600 ring-1 ring-orange-100"
            )}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EmotionFormChips(props: {
  relationship: string;
  goal: string;
  style: string;
  onRelationship: (v: string) => void;
  onGoal: (v: string) => void;
  onStyle: (v: string) => void;
  labels: {
    relation: string;
    goal: string;
    style: string;
  };
}) {
  return (
    <div className="space-y-3">
      <ChipRow
        emoji="💑"
        label={props.labels.relation}
        value={props.relationship}
        options={RELATIONSHIP_VALUES}
        onChange={props.onRelationship}
      />
      <ChipRow
        emoji="🎯"
        label={props.labels.goal}
        value={props.goal}
        options={EMOTION_GOAL_VALUES}
        onChange={props.onGoal}
      />
      <ChipRow
        emoji="💬"
        label={props.labels.style}
        value={props.style}
        options={EMOTION_STYLE_VALUES}
        onChange={props.onStyle}
      />
    </div>
  );
}
