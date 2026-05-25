"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { useApp } from "@/contexts/app-context";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { cn } from "@/lib/utils";

export function PublishSharePoster({
  open,
  onClose,
  pack,
  snippet,
}: {
  open: boolean;
  onClose: () => void;
  pack: Record<string, unknown>;
  snippet: string;
}) {
  const { tr, showToast } = useApp();
  if (!open) return null;

  const title = displayField(pack.recommendedTitle, "今日发布灵感");
  const slogan = tr("sharePosterSlogan");

  const copyPoster = () => {
    const text = [
      tr("appName"),
      title,
      snippet.slice(0, 120),
      slogan,
      typeof window !== "undefined" ? window.location.origin : "",
    ].join("\n");
    void copyToClipboard(text);
    showToast(tr("copied"));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 pb-[calc(5rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[430px] animate-in fade-in slide-in-from-bottom-4 duration-200">
        <div className="overflow-hidden rounded-[24px] bg-white shadow-2xl ring-1 ring-[#FFE8F0]">
          <div className="flex items-center justify-between border-b border-[#FFE8F0] px-4 py-3">
            <p className="text-sm font-black text-[#1F2937]">{tr("sharePosterTitle")}</p>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF4F7] text-[#8A94A6]"
              aria-label={tr("close")}
            >
              <X size={16} />
            </button>
          </div>

          <div
            className={cn(
              "mx-4 mt-4 overflow-hidden rounded-[20px] bg-gradient-to-br p-5 text-white",
              "from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D]"
            )}
          >
            <div className="flex items-center gap-2">
              <Image
                src="/brand-avatar.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl ring-2 ring-white/30"
              />
              <span className="text-[11px] font-black">{tr("appName")}</span>
            </div>
            <h3 className="mt-3 text-base font-black leading-snug">{title}</h3>
            <p className="mt-2 line-clamp-4 text-[11px] leading-relaxed text-white/90">{snippet}</p>
            <p className="mt-4 text-[10px] font-bold text-white/80">{slogan}</p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="min-w-0 flex-1 rounded-xl bg-white/15 px-3 py-2 text-[9px] text-white/85">
                扫码体验 · 每天帮你找到能发的内容
              </div>
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-[8px] font-bold text-[#FF4F8B]">
                QR
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-4">
            <button
              type="button"
              onClick={copyPoster}
              className="rounded-2xl bg-[#FFF4F7] py-3 text-[12px] font-black text-[#FF4F8B]"
            >
              {tr("sharePosterCopy")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3 text-[12px] font-black text-white"
            >
              {tr("sharePosterDone")}
            </button>
          </div>
          <p className="px-4 pb-3 text-center text-[9px] text-[#8A94A6]">{tr("shareRewardHint")}</p>
        </div>
      </div>
    </div>
  );
}
