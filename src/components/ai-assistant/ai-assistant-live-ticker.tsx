"use client";

import { useEffect, useState } from "react";
import {
  BUDDY_LIVE_ACTIVITIES,
  BUDDY_USAGE_BASE,
  formatActivityTimeAgo,
  getBuddyTodayUsageCount,
  getShuffledBuddyActivities,
  msUntilNextBuddyUsageTick,
  type BuddyLiveActivity,
} from "@/lib/operation-chat/buddy-live-activity";
import { formatInspirationCount } from "@/lib/banner-inspiration-count";
import { cn } from "@/lib/utils";

function ActivityRow({
  item,
  jitter,
  compact,
}: {
  item: BuddyLiveActivity;
  jitter: number;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-2", compact && "opacity-65")}>
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] shadow-sm ring-1 ring-white/80",
          item.avatarBg
        )}
      >
        {item.avatar}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="flex flex-wrap items-center gap-x-1 text-[10px] leading-snug">
          <span className="font-black text-[#374151]">{item.name}</span>
          {item.tag ? (
            <span className="rounded bg-[#F3F4F6] px-1 py-0.5 text-[8px] font-bold text-[#9CA3AF]">
              {item.tag}
            </span>
          ) : null}
          <span className="text-[#D1D5DB]">·</span>
          <span className="font-medium text-[#9CA3AF]">
            {formatActivityTimeAgo(item.minutesAgo, jitter)}
          </span>
        </p>
        <p className="mt-0.5 text-[10px] font-bold leading-snug text-[#6B7280]">
          {item.action}
          {item.highlight ? (
            <span className="text-[#FF4F8B]">「{item.highlight}」</span>
          ) : null}
        </p>
      </div>
    </div>
  );
}

export function AiAssistantLiveTicker({ compact }: { compact?: boolean } = {}) {
  /** 首屏固定列表，避免 SSR 与客户端 shuffle / random 不一致 */
  const [activities, setActivities] = useState<BuddyLiveActivity[]>(
    () => BUDDY_LIVE_ACTIVITIES
  );
  const [todayCount, setTodayCount] = useState(BUDDY_USAGE_BASE);
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [jitter, setJitter] = useState(0);

  useEffect(() => {
    const list = getShuffledBuddyActivities();
    setActivities(list);
    setIdx(Math.floor(Math.random() * list.length));

    const refresh = () => setTodayCount(getBuddyTodayUsageCount());
    refresh();
    let timeoutId: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timeoutId = setTimeout(() => {
        refresh();
        schedule();
      }, msUntilNextBuddyUsageTick());
    };
    schedule();
    const fallbackId = setInterval(refresh, 60_000);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(fallbackId);
    };
  }, []);

  const current = activities[idx % activities.length]!;
  const prev = activities[(idx - 1 + activities.length) % activities.length]!;

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 4800 + Math.floor(Math.random() * 3200);
      timeout = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setIdx((i) => (i + 1) % activities.length);
          setJitter(Math.random() > 0.6 ? 1 : 0);
          setFade(true);
          schedule();
        }, 280);
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, [activities.length]);

  return (
    <section
      className={cn(
        "rounded-[18px] bg-white/95 ring-1 ring-[#FFE8F0] shadow-sm",
        compact ? "px-3 py-2" : "px-3 py-2.5"
      )}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <p className="text-[10px] font-black text-[#374151]">
          {compact ? "🔥 大家都在问" : "最近动态"}
        </p>
        <span className="text-[9px] font-bold text-[#9CA3AF]">
          今天约 <span className="text-[#FF4F8B]">{formatInspirationCount(todayCount)}</span> 人在用
        </span>
      </div>

      <div
        className={cn(
          "transition-opacity duration-300",
          compact ? "" : "space-y-2",
          fade ? "opacity-100" : "opacity-0"
        )}
      >
        <ActivityRow item={current} jitter={jitter} />
        {!compact ? <ActivityRow item={prev} jitter={0} compact /> : null}
      </div>
    </section>
  );
}
