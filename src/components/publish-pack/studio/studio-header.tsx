"use client";

import Link from "next/link";
import { ChevronLeft, Crown, Sparkles, Zap } from "lucide-react";
import { ProfileUserAvatar } from "@/components/profile/profile-user-avatar";
import { useApp } from "@/contexts/app-context";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

export function StudioHeader({ onBack }: { onBack: () => void }) {
  const { user, setLoginOpen, setQuotaModalOpen } = useApp();
  const quota = user ? getTotalQuota(user) : 0;
  const isPro = user && user.plan !== "free";

  return (
    <header className="sticky top-0 z-40 border-b border-[#FFE8F0]/80 bg-[#FFFBF8]/95 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm ring-1 ring-[#FFE8F0]"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF4F8B] to-[#FF9A4D] shadow-md">
            <Sparkles size={18} className="text-white" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-black text-[#1F2937]">AI 发布包</h1>
            <p className="truncate text-[9px] font-medium text-[#8A94A6]">
              说一句话，出图文
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => (user ? setQuotaModalOpen(true) : setLoginOpen(true))}
            className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#FF4F8B] ring-1 ring-[#FFE8F0] shadow-sm"
          >
            <Zap size={12} className="fill-[#FF4F8B]" />
            灵感 {quota}
          </button>
          <button
            type="button"
            onClick={() => (user ? setQuotaModalOpen(true) : setLoginOpen(true))}
            className={cn(
              "flex items-center gap-0.5 rounded-full px-2 py-1 text-[9px] font-black ring-1",
              isPro
                ? "bg-gradient-to-r from-[#FFC46B] to-[#FF9A4D] text-white ring-[#FFC46B]/50"
                : "bg-white text-[#8A94A6] ring-[#FFE8F0]"
            )}
          >
            <Crown size={11} />
            Pro
          </button>
          {user ? (
            <Link href="/profile" className="shrink-0">
              <ProfileUserAvatar userId={user.id} className="h-9 w-9" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF0F5] text-[10px] font-bold text-[#FF4F8B]"
            >
              登录
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
