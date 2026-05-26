"use client";

import { RefreshCw } from "lucide-react";
import type { ContentGuess } from "@/lib/publish-pack/quick-package-types";
import {
  GUESS_GOALS,
  GUESS_IMAGE_STYLES,
  GUESS_PERSONALITIES,
  GUESS_PLATFORMS,
  GUESS_STYLES,
} from "@/lib/publish-pack/studio-config";
import { cn } from "@/lib/utils";

const FIELDS: { key: keyof ContentGuess; label: string; options: readonly string[] }[] = [
  { key: "platform", label: "发布平台", options: GUESS_PLATFORMS },
  { key: "personality", label: "人格感觉", options: GUESS_PERSONALITIES },
  { key: "contentStyle", label: "内容风格", options: GUESS_STYLES },
  { key: "goal", label: "生成目标", options: GUESS_GOALS },
  { key: "imageStyle", label: "图片风格", options: GUESS_IMAGE_STYLES },
];

export function StudioGuessCard({
  guess,
  onChange,
  onShuffle,
}: {
  guess: ContentGuess;
  onChange: (g: ContentGuess) => void;
  onShuffle: () => void;
}) {
  return (
    <section className="rounded-[22px] bg-gradient-to-br from-[#FFF8FB] to-white p-4 ring-1 ring-inset ring-[#FFE8F0] transition-opacity duration-300">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-black text-[#1F2937]">AI 猜你适合</p>
        <button
          type="button"
          onClick={onShuffle}
          className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] ring-1 ring-[#FFE8F0]"
        >
          <RefreshCw size={11} />
          换一换
        </button>
      </div>
      <div className="space-y-2.5">
        {FIELDS.map(({ key, label, options }) => (
          <div key={key}>
            <p className="mb-1 text-[10px] font-bold text-[#8A94A6]">{label}</p>
            <div className="flex flex-wrap gap-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ...guess, [key]: opt })}
                  className={cn(
                    "rounded-full px-2 py-1 text-[10px] font-bold transition active:scale-95",
                    guess[key] === opt
                      ? "bg-[#FF4F8B] text-white shadow-sm"
                      : "bg-white text-[#5A6478] ring-1 ring-inset ring-[#FFE8F0]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
