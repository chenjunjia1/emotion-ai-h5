"use client";

import { Camera } from "lucide-react";
import {
  IMAGE_STYLE_PRESETS,
  getStylePreset,
  type ImageStylePreset,
} from "@/lib/publish-pack/image-style-presets";

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
      className={`relative flex w-full items-start gap-3 rounded-[22px] border-2 bg-gradient-to-br p-3.5 text-left transition-all ${
        ui.cardClass
      } ${
        selected
          ? "border-pink-500 shadow-md shadow-pink-100/80 ring-2 ring-pink-200/50"
          : "border-white/80 hover:border-pink-200"
      }`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${ui.iconBg}`}
      >
        {ui.emoji}
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block text-[15px] font-black text-slate-800">{style.name}</span>
        <span className="mt-1 block text-[12px] leading-snug text-slate-500">
          {style.shortDesc}
        </span>
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

  return (
    <section className="overflow-hidden rounded-[28px] border-2 border-pink-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-black text-slate-800">
            <Camera className="text-pink-500" size={20} />
            选择图片风格
          </h3>
          <p className="mt-1 text-[12px] leading-5 text-slate-400">
            点击风格，系统会自动加入对应生图描述
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-500">
          火山方舟 Seedream
        </span>
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

      <div className="mt-4 rounded-[22px] border border-amber-100/80 bg-gradient-to-br from-[#fff9f0] to-[#fff5eb] p-4">
        <p className="flex items-center gap-2 text-sm font-black text-slate-800">
          <span className="text-base">📷</span>
          已选：{active.name}
        </p>
        <p className="mt-2 text-[13px] leading-6 text-slate-600">{active.longDesc}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {active.suitableScenes.map((scene) => (
            <span
              key={scene}
              className="rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-bold text-pink-500"
            >
              适合：{scene}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
