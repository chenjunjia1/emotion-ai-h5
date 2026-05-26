"use client";

import Link from "next/link";
import { PartyPopper, Share2 } from "lucide-react";
import { ConfettiBurst } from "@/components/play/confetti-burst";
import { hapticSuccess } from "@/lib/play-feedback";
import { useApp } from "@/contexts/app-context";
import { useEffect } from "react";

export function PublishPackSuccessBanner({
  onShare,
}: {
  onShare?: () => void;
}) {
  const { tr } = useApp();

  useEffect(() => {
    hapticSuccess();
  }, []);

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] px-4 py-3 text-white shadow-lg">
      <ConfettiBurst active />
      <div className="relative flex items-center gap-3">
        <PartyPopper size={28} className="shrink-0 opacity-95" />
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black">{tr("publishPackWinTitle")}</p>
          <p className="mt-0.5 text-[10px] text-white/90">{tr("publishPackWinSub")}</p>
          <p className="mt-1 text-[9px] font-bold text-white/80">
            内容在下方卡片 · 已同步到「生成记录」
          </p>
        </div>
      </div>
      <div className="relative mt-2.5 flex gap-2">
        {onShare ? (
          <button
            type="button"
            onClick={onShare}
            className="flex flex-1 items-center justify-center gap-1 rounded-full bg-white/20 py-2 text-[10px] font-black"
          >
            <Share2 size={12} />
            {tr("publishPackWinShare")}
          </button>
        ) : null}
        <Link
          href="/history?filter=pack"
          className="flex flex-1 items-center justify-center rounded-full bg-white py-2 text-[10px] font-black text-[#FF4F8B]"
        >
          查看生成记录
        </Link>
      </div>
    </div>
  );
}
