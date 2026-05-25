"use client";

import { cn } from "@/lib/utils";
import { aestheticForCategory } from "@/lib/content/cover-visuals";

/** 灵感快选 / 案例卡片 — 渐变 + emoji，零网络依赖 */
export function AestheticCover({
  category,
  title,
  grad,
  emoji,
  className,
}: {
  category?: string;
  title?: string;
  grad?: string;
  emoji?: string;
  className?: string;
}) {
  const preset = aestheticForCategory(category ?? "", title ?? "");
  const g = grad ?? preset.grad;
  const e = emoji ?? preset.emoji;

  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden bg-gradient-to-br",
        g,
        className
      )}
    >
      <div
        className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full bg-white/25 blur-xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-2 -left-2 h-12 w-12 rounded-full opacity-40 blur-lg"
        style={{ backgroundColor: preset.accent }}
        aria-hidden
      />
      <span className="absolute inset-0 flex items-center justify-center text-[28px] drop-shadow-sm">
        {e}
      </span>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/10 to-transparent" />
    </div>
  );
}
