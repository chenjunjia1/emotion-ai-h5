"use client";

import { cn } from "@/lib/utils";

/** AI 超时或未配置 key 时走模板，提示用户 */
export function DemoContentBadge({
  show,
  label = "演示内容",
  className,
}: {
  show?: boolean;
  label?: string;
  className?: string;
}) {
  if (!show) return null;
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800 ring-1 ring-amber-200/80",
        className
      )}
    >
      {label}
    </span>
  );
}
