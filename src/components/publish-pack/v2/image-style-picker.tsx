"use client";

import { Camera } from "lucide-react";
import {
  IMAGE_STYLE_PRESETS,
  getStylePreset,
  type ImageStylePreset,
} from "@/lib/publish-pack/image-style-presets";
import { cn } from "@/lib/utils";

const STYLE_UI: Record<
  string,
  { emoji: string; cardClass: string; iconBg: string }
> = {
  ccd: {
    emoji: "📷",
    cardClass: "from-violet-50 via-purple-50/80 to-fuchsia-50/60",
    iconBg: "bg-violet-100/90",
  },
  film: {
    emoji: "🎞️",
    cardClass: "from-amber-50 via-yellow-50/90 to-orange-50/50",
    iconBg: "bg-amber-100/90",
  },
  overexposure: {
    emoji: "☀️",
    cardClass: "from-rose-50 via-pink-50/80 to-orange-50/40",
    iconBg: "bg-rose-100/90",
  },
  portrait: {
    emoji: "🧋",
    cardClass: "from-orange-50 via-amber-50/70 to-rose-50/50",
    iconBg: "bg-orange-100/90",
  },
  polaroid: {
    emoji: "🖼️",
    cardClass: "from-yellow-50 via-amber-50/80 to-lime-50/40",
    iconBg: "bg-yellow-100/90",
  },
  pixel: {
    emoji: "👾",
    cardClass: "from-sky-50 via-cyan-50/80 to-blue-50/50",
    iconBg: "bg-sky-100/90",
  },
  "3d-cartoon": {
    emoji: "🧸",
    cardClass: "from-pink-50 via-rose-50/80 to-fuchsia-50/40",
    iconBg: "bg-pink-100/90",
  },
};

function StyleCard({
  style,
  selected,
  onSelect,
}: {
  style: ImageStylePreset;
  selected: boolean;
  onSelect: () => void;
}) {
  const ui = STYLE_UI[style.id] ?? {
    emoji: "✨",
    cardClass: "from-slate-50 to-pink-50/50",
    iconBg: "bg-pink-100",
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "relative flex min-h-[118px] w-full flex-col items-center rounded-2xl border bg-gradient-to-br px-2.5 py-3 text-center transition-all active:scale-[0.98]",
        ui.cardClass,
        selected
          ? "border-pink-500 shadow-md shadow-pink-100/80 ring-2 ring-pink-200/50"
          : "border-white/90 hover:border-pink-200"
      )}
    >
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl text-[26px]",
          ui.iconBg
        )}
      >
        {ui.emoji}
      </span>
      <span className="mt-2 w-full text-[14px] font-black leading-tight text-slate-800">
        {style.name}
      </span>
      <span className="mt-1 line-clamp-2 w-full px-0.5 text-[11px] leading-[1.45] text-slate-500">
        {style.shortDesc}
      </span>
    </button>
  );
}

export function ImageStylePicker({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const active = getStylePreset(selectedId) ?? IMAGE_STYLE_PRESETS[0]!;
  const activeUi = STYLE_UI[active.id] ?? { emoji: "✨" };

  return (
    <section className="w-full overflow-hidden rounded-[24px] border border-pink-100/90 bg-white p-3 shadow-sm">
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="flex items-center gap-2 text-[15px] font-black text-slate-800">
            <Camera className="shrink-0 text-pink-500" size={18} />
            选择图片风格
          </h3>
          <span className="shrink-0 rounded-full bg-pink-50 px-2 py-0.5 text-[9px] font-bold leading-tight text-pink-500">
            AI 配图
          </span>
        </div>
        <p className="text-[11px] leading-5 text-slate-400">
          点击风格，系统会自动加入对应生图描述
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {IMAGE_STYLE_PRESETS.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            selected={selectedId === style.id}
            onSelect={() => onSelect(style.id)}
          />
        ))}
      </div>

      <div className="mt-3 rounded-2xl border border-amber-100/80 bg-gradient-to-br from-[#fff9f0] to-[#fff5eb] p-3.5">
        <p className="flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="text-lg">{activeUi.emoji}</span>
          已选：{active.name}
        </p>
        <p className="mt-1.5 text-[12px] leading-6 text-slate-600">{active.longDesc}</p>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {active.suitableScenes.map((scene) => (
            <span
              key={scene}
              className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-pink-500 ring-1 ring-pink-100/80"
            >
              {scene}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
