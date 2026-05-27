"use client";

import Link from "next/link";
import { MessageCircle, MessageCircleHeart } from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "treehole" | "strategist";

const MODES: {
  id: Mode;
  label: string;
  href: string;
  icon: typeof MessageCircle;
}[] = [
  { id: "treehole", label: "树洞搭子", href: "/emotion-chat", icon: MessageCircleHeart },
  { id: "strategist", label: "聊天军师", href: "/emotion-chat?mode=strategist", icon: MessageCircle },
];

export function ChatModeSwitcher({ active }: { active: Mode }) {
  return (
    <div
      className="chat-mode-switcher mb-3 grid grid-cols-2 gap-1 rounded-[16px] bg-white/80 p-1 ring-1 ring-[#FFE8F0] shadow-[0_4px_16px_rgba(255,120,150,0.08)] backdrop-blur-sm"
      role="tablist"
      aria-label="聊天模式"
    >
      {MODES.map((m) => {
        const Icon = m.icon;
        const isActive = active === m.id;
        return (
          <Link
            key={m.id}
            href={m.href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-[12px] py-2.5 text-[12px] font-black transition-all duration-200 active:scale-[0.98]",
              isActive
                ? "bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-white shadow-[0_4px_14px_rgba(255,79,139,0.35)]"
                : "text-[#6B7280]"
            )}
          >
            <Icon size={15} strokeWidth={2.2} />
            {m.label}
          </Link>
        );
      })}
    </div>
  );
}
