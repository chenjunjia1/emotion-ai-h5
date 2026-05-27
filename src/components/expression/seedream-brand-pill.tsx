import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/** 高级图文包 · AI 配图品牌标（浅色底 / 渐变 Hero） */
export function SeedreamBrandPill({
  variant = "light",
  className,
}: {
  variant?: "light" | "on-gradient";
  className?: string;
}) {
  if (variant === "on-gradient") {
    return (
      <span
        className={cn(
          "create-seedream-badge inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white ring-1 ring-white/30 backdrop-blur-sm",
          className
        )}
      >
        <Sparkles size={9} className="fill-white/30 text-white" strokeWidth={2.5} />
        AI 配图
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-[#FFF0F5] to-[#FFF3E8] px-2 py-1 text-[8px] font-black tracking-wide text-[#FF4F8B] ring-1 ring-[#FFE8F0] shadow-sm",
        className
      )}
    >
      <Sparkles size={9} className="text-[#FF9A4D]" strokeWidth={2.5} />
      AI 配图
    </span>
  );
}
