"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const QUICK_SEC = 18;
const ADVANCED_SEC = 95;

export function PackV2LoadingProgress({
  mode,
  startedAt,
}: {
  mode: "quick" | "advanced";
  startedAt: number;
}) {
  const totalSec = mode === "advanced" ? ADVANCED_SEC : QUICK_SEC;
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = () => {
      setElapsed(Math.max(0, (Date.now() - startedAt) / 1000));
    };
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const pct = Math.min(96, Math.round((elapsed / totalSec) * 100));
  const remain = Math.max(0, Math.ceil(totalSec - elapsed));

  const steps =
    mode === "quick"
      ? ["理解主题", "匹配平台", "生成文案", "整理建议"]
      : ["理解主题", "生成文案", "Seedream 配图", "整理发布建议"];

  const activeStep = Math.min(
    steps.length - 1,
    Math.floor((elapsed / totalSec) * steps.length)
  );

  return (
    <div className="space-y-4 rounded-[30px] border border-pink-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Loader2 size={18} className="animate-spin text-pink-500" />
          <span className="text-sm font-black text-slate-800">
            {mode === "advanced" ? "图文生成中" : "文案生成中"}
          </span>
        </div>
        <span className="text-xs font-bold text-pink-500">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-pink-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-orange-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-center text-[11px] text-slate-500">
        {mode === "advanced"
          ? `真实感配图约 30–90 秒，预计还需约 ${remain} 秒 · 请勿重复点击`
          : `预计还需约 ${remain} 秒 · 请勿重复点击`}
      </p>
      <div className="grid grid-cols-4 gap-1.5">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`rounded-xl px-1 py-2 text-center text-[9px] font-bold leading-tight ${
              i <= activeStep
                ? "bg-pink-50 text-pink-600"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
