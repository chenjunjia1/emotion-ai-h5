"use client";

import Link from "next/link";
import { BarChart3, Flame, MessageCircle } from "lucide-react";
import { PublishPackWandIcon } from "@/components/v1/publish-pack-wand-icon";
import { useApp } from "@/contexts/app-context";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const ENTRIES: {
  href: string;
  titleKey: I18nKey;
  tagKey: I18nKey;
  icon: "flame" | "pack" | "buddy" | "review";
  iconBg: string;
  tagClass: string;
}[] = [
  {
    href: "/hot-topics",
    titleKey: "featHotTopics",
    tagKey: "featHotTopicsTag",
    icon: "flame",
    iconBg: "from-[#FF6B6B] to-[#FF8A7A]",
    tagClass: "bg-[#FFF0F5] text-[#FF4F8B]",
  },
  {
    href: "/publish-pack",
    titleKey: "featPublishPackGrid",
    tagKey: "featPublishPackTag",
    icon: "pack",
    iconBg: "from-[#FF9A6B] to-[#FFAB40]",
    tagClass: "bg-[#FFF4E6] text-[#E85D04]",
  },
  {
    href: "/emotion-chat",
    titleKey: "featAiBuddy",
    tagKey: "featAiBuddyTag",
    icon: "buddy",
    iconBg: "from-[#A78BFA] to-[#C4B5FD]",
    tagClass: "bg-[#F3E8FF] text-[#7C3AED]",
  },
  {
    href: "/review",
    titleKey: "featReviewCardShort",
    tagKey: "featReviewCardTag",
    icon: "review",
    iconBg: "from-[#FFC46B] to-[#FFB347]",
    tagClass: "bg-[#FFF8E6] text-[#D97706]",
  },
];

function EntryIcon({ type }: { type: (typeof ENTRIES)[number]["icon"] }) {
  if (type === "pack") return <PublishPackWandIcon size={20} className="text-white" />;
  if (type === "flame") return <Flame size={18} strokeWidth={2.4} />;
  if (type === "buddy") return <MessageCircle size={18} strokeWidth={2.4} />;
  return <BarChart3 size={18} strokeWidth={2.4} />;
}

export function HomePlayEntries() {
  const { tr } = useApp();

  return (
    <section aria-label={tr("homeSectionPlaySub")}>
      <div className="mb-2.5 px-0.5">
        <h2 className="text-[14px] font-black text-[#1F2937]">{tr("homeSectionPlay")}</h2>
        <p className="mt-0.5 text-[10px] text-[#9CA3AF]">{tr("homeSectionPlaySub")}</p>
      </div>
      <div className="grid grid-cols-4 gap-2.5">
        {ENTRIES.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className={cn(
              "flex flex-col items-center rounded-[18px] bg-white px-1 py-3",
              "shadow-[0_2px_14px_rgba(255,120,150,0.06)] ring-1 ring-[#FFE8F0]/80",
              "transition active:scale-[0.97]",
              e.icon === "pack" && "ring-2 ring-[#FF9A4D]/40 shadow-[0_4px_18px_rgba(255,154,77,0.15)]"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white",
                e.iconBg
              )}
            >
              <EntryIcon type={e.icon} />
            </div>
            <p className="mt-2 w-full truncate text-center text-[11px] font-black text-[#1F2937]">
              {tr(e.titleKey)}
            </p>
            <span
              className={cn(
                "mt-1 rounded-full px-2 py-0.5 text-[8px] font-bold",
                e.tagClass
              )}
            >
              {tr(e.tagKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
