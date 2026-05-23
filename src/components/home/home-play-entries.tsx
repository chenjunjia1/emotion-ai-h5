"use client";

import Link from "next/link";
import { BarChart3, Flame, Heart, Wand2 } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

/** 顺序：爆品 → 发布包 → 情绪聊天 → 复盘（贴合短视频运营主链路） */
const ENTRIES = [
  {
    href: "/hot-topics",
    titleKey: "featHotTopics" as const,
    descKey: "featHotTopicsDesc" as const,
    tagKey: "featHotTopicsTag" as const,
    icon: Flame,
    grad: "from-[#FF9A6B] to-[#FF6B6B]",
    iconAnim: "play-icon-pulse",
  },
  {
    href: "/publish-pack",
    titleKey: "featPublishPack" as const,
    descKey: "featPublishPackDescShort" as const,
    tagKey: "featPublishPackTag" as const,
    icon: Wand2,
    grad: "from-[#FF9EC4] to-[#FF7AAE]",
    iconAnim: "play-icon-spark",
  },
  {
    href: "/emotion-chat",
    titleKey: "featEmotionChat" as const,
    descKey: "featEmotionChatDesc" as const,
    tagKey: "featEmotionChatTag" as const,
    icon: Heart,
    grad: "from-[#FF8EC4] to-[#FF5C8A]",
    iconAnim: "play-icon-bounce",
  },
  {
    href: "/review",
    titleKey: "featReviewCard" as const,
    descKey: "featReviewCardDesc" as const,
    tagKey: "featReviewCardTag" as const,
    icon: BarChart3,
    grad: "from-[#FFC46B] to-[#FF9A6B]",
    iconAnim: "play-icon-wiggle",
  },
] as const;

function PlayCard({
  href,
  title,
  desc,
  tag,
  icon: Icon,
  grad,
  cta,
  index,
  iconAnim,
}: {
  href: string;
  title: string;
  desc: string;
  tag?: string;
  icon: typeof Flame;
  grad: string;
  cta: string;
  index: number;
  iconAnim: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "cream-card play-entry-card play-entry-enter group relative flex flex-col overflow-hidden rounded-[28px] p-3.5",
        "transition-shadow hover:shadow-[0_12px_32px_rgba(255,122,174,0.18)]"
      )}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <span
        className="play-entry-shine pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-[#FF7AAE]/25 to-transparent"
        aria-hidden
      />
      {tag ? (
        <span className="absolute right-3 top-3 rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-black text-[#FF5C8A] ring-1 ring-[#FF7AAE]/25">
          {tag}
        </span>
      ) : null}
      <div
        className={cn(
          "relative mb-2.5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-[0_4px_12px_rgba(255,107,107,0.25)]",
          grad,
          iconAnim
        )}
        style={{ animationDelay: `${index * 0.35}s` }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <h3 className="pr-10 text-[13px] font-black leading-snug text-slate-800">{title}</h3>
      <p className="mt-1 flex-1 text-[10px] leading-[1.45] text-slate-500">{desc}</p>
      <span className="play-cta-nudge mt-2 text-[11px] font-bold text-[#FF7AAE]">{cta}</span>
    </Link>
  );
}

export function HomePlayEntries() {
  const { tr } = useApp();

  return (
    <section className="play-section-enter px-0.5">
      <div className="mb-4 text-center">
        <h2 className="text-lg font-black tracking-tight text-slate-800">
          {tr("homeSectionPlay")}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{tr("homeSectionPlaySub")}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ENTRIES.map((e, i) => (
          <PlayCard
            key={e.href}
            href={e.href}
            title={tr(e.titleKey)}
            desc={tr(e.descKey)}
            tag={e.tagKey ? tr(e.tagKey) : undefined}
            icon={e.icon}
            grad={e.grad}
            cta={tr("homeGoExperience")}
            index={i}
            iconAnim={e.iconAnim}
          />
        ))}
      </div>
    </section>
  );
}
