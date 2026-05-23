"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, RefreshCw, Sparkles, TrendingUp, Wand2, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import type { I18nKey } from "@/lib/i18n";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const QUEST_TOTAL = 3;

type FortuneItem = {
  id: string;
  emoji: string;
  tag: string;
  tip: string;
  href: string;
  hotBase: number;
};

const FORTUNE_POOL: FortuneItem[] = [
  {
    id: "emotion",
    emoji: "💗",
    tag: "易互动",
    tip: "情绪共鸣类内容",
    href: "/publish-pack",
    hotBase: 90,
  },
  {
    id: "list",
    emoji: "📋",
    tag: "易收藏",
    tip: "干货清单类内容",
    href: "/publish-pack",
    hotBase: 88,
  },
  {
    id: "story",
    emoji: "🎬",
    tag: "易完播",
    tip: "真实故事 vlog 类",
    href: "/topic-box",
    hotBase: 86,
  },
  {
    id: "contrast",
    emoji: "⚡",
    tag: "易爆款",
    tip: "反差对比类短视频",
    href: "/hot-topics",
    hotBase: 92,
  },
  {
    id: "heal",
    emoji: "🌸",
    tag: "治愈向",
    tip: "治愈系日常记录",
    href: "/topic-box",
    hotBase: 84,
  },
];

function pickFortune(excludeId?: string) {
  const pool = excludeId
    ? FORTUNE_POOL.filter((f) => f.id !== excludeId)
    : FORTUNE_POOL;
  return pool[Math.floor(Math.random() * pool.length)] ?? FORTUNE_POOL[0];
}

function levelLabel(hot: number, tr: (k: I18nKey) => string) {
  if (hot >= 90) return { text: tr("fortuneLevelGreat"), emoji: "👑", bg: "from-amber-400 to-orange-400" };
  if (hot >= 86) return { text: tr("fortuneLevelGood"), emoji: "✨", bg: "from-[#FF7AAE] to-[#FF9EC4]" };
  return { text: tr("fortuneLevelOk"), emoji: "🌸", bg: "from-violet-300 to-[#FF8EC4]" };
}

export function HomeFortuneCard() {
  const { tr } = useApp();
  const { growth } = useProduct();
  const done = Math.min(
    QUEST_TOTAL,
    ["topic", "pack", "review"].filter((id) => growth.tasksDone.includes(id)).length
  );

  const [fortune, setFortune] = useState(FORTUNE_POOL[0]);
  const [hotScore, setHotScore] = useState(92);
  const [inspire, setInspire] = useState(18);
  const [spinning, setSpinning] = useState(false);
  const [pop, setPop] = useState(false);
  const level = useMemo(() => levelLabel(hotScore, tr), [hotScore, tr]);

  const onRefresh = useCallback(() => {
    setSpinning(true);
    setPop(true);
    setFortune((prev) => {
      const next = pickFortune(prev.id);
      setHotScore(
        Math.min(98, Math.max(82, next.hotBase + Math.floor(Math.random() * 8) - 2))
      );
      return next;
    });
    setInspire(12 + Math.floor(Math.random() * 14));
    window.setTimeout(() => setSpinning(false), 450);
    window.setTimeout(() => setPop(false), 550);
  }, []);

  const progressPct = Math.round((done / QUEST_TOTAL) * 100);

  const stats = [
    {
      label: tr("fortuneHot"),
      hint: tr("fortuneHotHint"),
      value: String(hotScore),
      icon: TrendingUp,
      color: "text-[#FF6B6B]",
      bg: "bg-[#FFF0F0]",
    },
    {
      label: tr("fortuneInspire"),
      hint: tr("fortuneInspireHint"),
      value: `+${inspire}`,
      icon: Zap,
      color: "text-[#FF7AAE]",
      bg: "bg-[#FFF0F5]",
    },
    {
      label: tr("fortuneProgress"),
      hint: tr("fortuneProgressHint"),
      value: `${done}/${QUEST_TOTAL}`,
      icon: Sparkles,
      color: "text-[#E8A04A]",
      bg: "bg-[#FFF8EE]",
    },
  ];

  return (
    <section className="cream-card fortune-card-enter overflow-hidden rounded-[28px] ring-1 ring-[#FF7AAE]/10">
      <div className="bg-gradient-to-r from-[#FFF0F5] via-white to-[#FFF8EE] px-4 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h2 className="text-base font-black text-slate-800">
                🔮 {tr("fortuneTitle")}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r px-2 py-0.5 text-[9px] font-black text-white shadow-sm",
                  level.bg
                )}
              >
                {level.emoji} {level.text}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={spinning}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-bold text-[#FF5C8A] shadow-sm ring-1 ring-[#FF7AAE]/20 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw size={12} className={spinning ? "animate-spin" : ""} />
            {tr("fortuneRefresh")}
          </button>
        </div>

        <div
          className={cn(
            "mt-3 flex items-center gap-3 rounded-2xl bg-white/90 p-3 ring-1 ring-[#FF7AAE]/15",
            pop && "fortune-tip-flip"
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl shadow-inner",
              spinning && "play-box-shake"
            )}
          >
            {fortune.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <span className="rounded-full bg-[#FFF0F5] px-2 py-0.5 text-[9px] font-bold text-[#FF7AAE]">
              今日宜发 · {fortune.tag}
            </span>
            <p className="mt-1 text-sm font-black leading-snug text-slate-800">
              {fortune.tip}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 pt-3">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className={cn(
                  "flex flex-col items-center rounded-[18px] px-1.5 py-2",
                  s.bg,
                  pop && "fortune-stat-bump"
                )}
                style={{ animationDelay: `${i * 0.06}s` }}
                title={s.hint}
              >
                <Icon size={14} className={cn("mb-0.5", s.color)} />
                <span className={cn("text-lg font-black leading-none", s.color)}>
                  {s.value}
                </span>
                <span className="mt-0.5 text-[9px] font-bold text-slate-600">
                  {s.label}
                </span>
                <span className="mt-0.5 text-center text-[7px] leading-tight text-slate-400">
                  {s.hint}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-orange-100/80">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6B6B] to-[#FFC46B] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-1">
        <Link
          href={fortune.href}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white shadow-md active:scale-[0.98]",
            `bg-gradient-to-r ${theme.primary}`
          )}
        >
          <Wand2 size={16} />
          {tr("fortuneCta")}
          <ChevronRight size={16} />
        </Link>
      </div>
    </section>
  );
}
