"use client";

import { Fragment, useRef, useState } from "react";
import { ChevronRight, CircleHelp, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type HintStageItem = { name: string; current?: boolean };

interface HintTipProps {
  title: string;
  body: string;
  okLabel?: string;
  ariaLabel?: string;
  className?: string;
  /** popover：屏幕居中小卡；sheet：大号说明卡 */
  variant?: "popover" | "sheet";
  /** popover 宽度：wide 适合等级阶梯等较长说明 */
  popoverSize?: "default" | "wide";
  /** 横排阶段名（如陪跑等级 5 档） */
  stages?: HintStageItem[];
}

function HintBody({ body, compact }: { body: string; compact?: boolean }) {
  const parts = body.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return (
      <p
        className={cn(
          "text-slate-600",
          compact ? "text-[11px] leading-[1.45]" : "text-sm leading-6"
        )}
      >
        {body}
      </p>
    );
  }
  return (
    <ul className={cn("space-y-1 text-slate-600", compact ? "text-[11px] leading-[1.45]" : "text-sm leading-6")}>
      {parts.map((line) => (
        <li key={line} className="flex gap-1.5">
          <span className="mt-[0.35em] h-1 w-1 shrink-0 rounded-full bg-[#FF7AAE]/70" aria-hidden />
          <span className="min-w-0 flex-1">{line}</span>
        </li>
      ))}
    </ul>
  );
}

function HintStagesRow({ stages, compact }: { stages: HintStageItem[]; compact?: boolean }) {
  return (
    <div className={cn("rounded-lg bg-slate-50/90 px-2 py-2 ring-1 ring-slate-100/80", compact ? "mt-2" : "mt-3")}>
      <p
        className={cn(
          "mb-1.5 text-center font-bold text-slate-500",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        共 {stages.length} 个阶段
      </p>
      <div
        className={cn(
          "flex items-center gap-0.5 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          compact ? "text-[9px]" : "text-[10px]"
        )}
      >
        {stages.map((stage, i) => (
          <Fragment key={stage.name}>
            {i > 0 ? (
              <ChevronRight
                className="shrink-0 text-[#FF7AAE]/45"
                size={compact ? 10 : 11}
                aria-hidden
              />
            ) : null}
            <span
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-1.5 py-0.5 font-semibold leading-tight",
                stage.current
                  ? "bg-[#FF7AAE]/18 text-[#FF5C8A] ring-1 ring-[#FF7AAE]/25"
                  : "text-slate-500"
              )}
            >
              {stage.name}
            </span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function HintLevelBody({
  body,
  stages,
  compact,
}: {
  body: string;
  stages: HintStageItem[];
  compact?: boolean;
}) {
  const lines = body.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const textCls = cn("text-slate-600", compact ? "text-[11px] leading-[1.45]" : "text-sm leading-6");

  return (
    <div className={cn("space-y-1.5", textCls)}>
      {lines[0] ? <p>{lines[0]}</p> : null}
      {lines[1] ? <p className="font-medium text-slate-700">{lines[1]}</p> : null}
      <HintStagesRow stages={stages} compact={compact} />
      {lines[2] ? <p>{lines[2]}</p> : null}
    </div>
  );
}

/** 指标旁「?」说明 */
export function HintTip({
  title,
  body,
  okLabel = "知道了",
  ariaLabel = "查看说明",
  className,
  variant = "sheet",
  popoverSize = "default",
  stages,
}: HintTipProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  const trigger = (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setOpen((v) => !v);
      }}
      className={cn(
        "inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100/90 text-slate-400 ring-1 ring-slate-200/60 transition hover:bg-[#FFF0F5] hover:text-[#FF7AAE] active:scale-95",
        open && variant === "popover" && "bg-[#FFF0F5] text-[#FF7AAE]",
        className
      )}
      aria-label={ariaLabel}
      aria-expanded={open}
    >
      <CircleHelp size={12} strokeWidth={2.2} />
    </button>
  );

  if (variant === "popover") {
    return (
      <>
        <span ref={wrapRef} className="inline-flex align-middle">
          {trigger}
        </span>
        {open ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-[79] bg-black/25"
              aria-label="关闭说明"
              onClick={() => setOpen(false)}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="hint-popover-title"
              className={cn(
                "hint-popover-enter fixed left-1/2 top-1/2 z-[80] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-3.5 py-3 shadow-[0_12px_32px_rgba(15,23,42,0.14)] ring-1 ring-[#FF7AAE]/12",
                popoverSize === "wide"
                  ? "w-[min(19.5rem,calc(100vw-1.5rem))]"
                  : "w-[min(15rem,calc(100vw-1.75rem))]"
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2">
                <p id="hint-popover-title" className="text-xs font-bold text-slate-800">
                  {title}
                </p>
                <button
                  type="button"
                  className="shrink-0 text-slate-400 active:opacity-60"
                  onClick={() => setOpen(false)}
                  aria-label="关闭"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="mt-1.5 max-h-[38vh] overflow-y-auto">
                {stages?.length ? (
                  <HintLevelBody body={body} stages={stages} compact />
                ) : (
                  <HintBody body={body} compact />
                )}
              </div>
              <button
                type="button"
                className="mt-2.5 w-full rounded-lg bg-[#FF7AAE]/12 py-2 text-[11px] font-bold text-[#FF5C8A] active:bg-[#FF7AAE]/20"
                onClick={() => setOpen(false)}
              >
                {okLabel}
              </button>
            </div>
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      {trigger}
      {open ? (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/35 p-4 sm:items-center"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="hint-tip-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 id="hint-tip-title" className="text-base font-bold text-slate-900">
                {title}
              </h3>
              <button
                type="button"
                className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-50"
                onClick={() => setOpen(false)}
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-3">
              {stages?.length ? (
                <HintLevelBody body={body} stages={stages} />
              ) : (
                <HintBody body={body} />
              )}
            </div>
            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] py-3 text-sm font-bold text-white active:scale-[0.98]"
              onClick={() => setOpen(false)}
            >
              {okLabel}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
