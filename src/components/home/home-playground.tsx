"use client";

import { useState } from "react";
import Link from "next/link";
import { FortuneStick } from "@/components/play/fortune-stick";
import { LuckyWheel } from "@/components/play/lucky-wheel";
import { ScratchCard } from "@/components/play/scratch-card";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "wheel" as const, emoji: "🎡", labelKey: "playTabWheel" as const },
  { id: "scratch" as const, emoji: "🪙", labelKey: "playTabScratch" as const },
  { id: "stick" as const, emoji: "🎋", labelKey: "playTabStick" as const },
];

const QUICK = [
  { href: "/topic-box", emoji: "🎲", title: "灵感盲盒", desc: "开盒抽 SSR 选题" },
  { href: "/hot-topics", emoji: "🔥", title: "每日爆品", desc: "3灵感一键出包" },
  { href: "/invite", emoji: "🎁", title: "邀好友", desc: "双人领灵感" },
];

export function HomePlayground() {
  const { tr, showToast } = useApp();
  const [tab, setTab] = useState<(typeof TABS)[0]["id"]>("wheel");

  return (
    <section className="cream-card overflow-hidden rounded-[28px] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-base font-black text-slate-800">{tr("playgroundTitle")}</h2>
          <p className="mt-0.5 text-xs text-slate-500">{tr("playgroundSub")}</p>
        </div>
        <span className="rounded-full bg-[#FFF0F3] px-2 py-0.5 text-[10px] font-black text-[#FF7AAE]">
          FREE
        </span>
      </div>

      <div className="mt-3 flex gap-1 rounded-2xl bg-[#FFF8F3] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-xl py-2 text-[10px] font-bold transition",
              tab === t.id
                ? "bg-white text-[#FF7AAE] shadow-sm"
                : "text-slate-500"
            )}
          >
            <span className="text-base">{t.emoji}</span>
            {tr(t.labelKey)}
          </button>
        ))}
      </div>

      <div className="mt-3 min-h-[200px]">
        {tab === "wheel" && (
          <LuckyWheel onPrize={(p) => showToast(`转盘：${p}`)} />
        )}
        {tab === "scratch" && (
          <ScratchCard onReveal={(p) => showToast(`刮刮卡：${p}`)} />
        )}
        {tab === "stick" && (
          <FortuneStick onDraw={(p) => showToast(p)} />
        )}
      </div>

      <div className="mt-4 border-t border-orange-100/60 pt-3">
        <p className="text-[10px] font-bold text-slate-500">{tr("playgroundQuick")}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="flex flex-col items-center rounded-[16px] bg-white px-2 py-2.5 text-center shadow-sm ring-1 ring-orange-100/60 active:scale-95"
            >
              <span className="text-xl">{q.emoji}</span>
              <span className="mt-0.5 text-[10px] font-black text-slate-800">{q.title}</span>
              <span className="text-[8px] text-slate-400">{q.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
