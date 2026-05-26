"use client";

import { Camera, MapPin } from "lucide-react";
import {
  PACK_SCENE_PRESETS,
  PACK_SHOT_PRESETS,
  type PackPromptPreset,
} from "@/lib/publish-pack/pack-prompt-presets";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
        active
          ? "border-pink-500 bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-sm"
          : "border-pink-100 bg-white text-slate-600 hover:border-pink-200"
      }`}
    >
      {label}
    </button>
  );
}

type PackPromptChipsProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onPickTopicLine?: (line: string) => void;
  max?: number;
};

function togglePreset(
  list: string[],
  preset: PackPromptPreset,
  max: number,
  onChange: (ids: string[]) => void,
  onPickTopicLine?: (line: string) => void
) {
  const has = list.includes(preset.id);
  const next = has
    ? list.filter((x) => x !== preset.id)
    : [...list, preset.id].slice(-max);
  onChange(next);
  if (!has && onPickTopicLine) onPickTopicLine(preset.topicLine);
}

export function PackPromptChips({
  selectedIds,
  onChange,
  onPickTopicLine,
  max = 3,
}: PackPromptChipsProps) {
  const renderGroup = (
    title: string,
    icon: React.ReactNode,
    presets: PackPromptPreset[]
  ) => (
    <div>
      <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-slate-500">
        {icon}
        {title}
      </div>
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <Chip
            key={p.id}
            label={p.label}
            active={selectedIds.includes(p.id)}
            onClick={() =>
              togglePreset(selectedIds, p, max, onChange, onPickTopicLine)
            }
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4 rounded-[24px] border border-pink-100 bg-gradient-to-br from-white to-pink-50/40 p-4">
      <div>
        <h3 className="font-black text-slate-800">选好画面，出图更真实</h3>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          点选 1～{max} 个标签，Seedream 会按这些场景和拍摄感觉生成，不用自己写英文提示词。
        </p>
      </div>
      {renderGroup(
        "在什么场景？",
        <MapPin size={14} className="text-pink-500" />,
        PACK_SCENE_PRESETS
      )}
      {renderGroup(
        "怎么拍更像真人？",
        <Camera size={14} className="text-pink-500" />,
        PACK_SHOT_PRESETS
      )}
      {selectedIds.length > 0 && (
        <p className="text-[11px] leading-5 text-pink-600/90">
          已选 {selectedIds.length} 项 · 还可再选 {Math.max(0, max - selectedIds.length)} 项
        </p>
      )}
    </div>
  );
}
