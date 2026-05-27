"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const HINT_KEY = "emotion-treehole-night-hint-dismissed";

function isEveningHours() {
  const h = new Date().getHours();
  return h >= 18 || h < 6;
}

type Props = {
  night: boolean;
  ready: boolean;
  children: React.ReactNode;
};

/** 首次进入日间树洞时，轻提示可切换深夜陪伴模式 */
export function TreeholeNightHint({ night, ready, children }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready) return;

    if (night) {
      setVisible(false);
      return;
    }

    try {
      if (localStorage.getItem(HINT_KEY) === "1") return;
      if (localStorage.getItem("emotion-treehole-night") === "1") return;
    } catch {
      /* ignore */
    }
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [ready, night]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const evening = isEveningHours();

  return (
    <div className="relative flex flex-col items-end gap-1.5">
      {visible ? (
        <div
          className={cn(
            "treehole-night-hint absolute right-0 top-full z-30 mt-1.5 w-[min(72vw,220px)] rounded-[14px] p-2.5 shadow-[0_8px_28px_rgba(255,79,139,0.22)] ring-1 ring-[#FFE8F0]",
            "bg-gradient-to-br from-white via-[#FFFBFC] to-[#FFF5EB]"
          )}
          role="status"
        >
          <button
            type="button"
            onClick={dismiss}
            className="absolute right-1.5 top-1.5 rounded-full p-0.5 text-[#C4C9D4] active:bg-[#FFF0F5]"
            aria-label="关闭提示"
          >
            <X size={12} />
          </button>
          <p className="pr-4 text-[11px] font-black leading-snug text-[#1F2937]">
            {evening ? "夜深了，试试深夜模式" : "还有另一种氛围"}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-[#9CA3AF]">
            {evening
              ? "暗色界面 + 温柔陪聊，更适合此刻的心情"
              : "点「变深夜」切换暗色陪伴，随时可切回"}
          </p>
          <span
            className="pointer-events-none absolute -top-1.5 right-6 h-3 w-3 rotate-45 bg-white ring-1 ring-[#FFE8F0]"
            aria-hidden
          />
        </div>
      ) : null}
      <div className={cn(visible && "treehole-night-hint-pulse")}>{children}</div>
    </div>
  );
}

export function dismissTreeholeNightHint() {
  try {
    localStorage.setItem(HINT_KEY, "1");
  } catch {
    /* ignore */
  }
}
