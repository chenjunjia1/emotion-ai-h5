"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** 树洞 · 星光灯笼（路由动效 + 页内装饰共用） */
export function TreeholeNightLantern({
  className,
  size = "lg",
  hanging = true,
}: {
  className?: string;
  size?: "sm" | "lg";
  hanging?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const dim = size === "sm" ? 48 : 88;
  const cap = `thLanternCap-${uid}`;
  const glass = `thLanternGlass-${uid}`;
  const core = `thLanternCore-${uid}`;
  const soft = `thLanternSoft-${uid}`;

  return (
    <div
      className={cn(
        "treehole-night-lantern",
        size === "sm" && "treehole-night-lantern--sm",
        !hanging && "treehole-night-lantern--inline",
        className
      )}
      aria-hidden
    >
      {hanging ? (
        <div className="treehole-lamp-cord treehole-night-lantern-cord">
          <span className="treehole-lamp-cord-line treehole-night-lantern-cord-line" />
          <span className="treehole-lamp-cord-bead treehole-night-lantern-cord-bead" />
        </div>
      ) : null}

      <div className="treehole-lamp-fixture treehole-night-lantern-body">
        <span className="treehole-night-lantern-halo" />
        <svg
          width={dim}
          height={Math.round(dim * 1.18)}
          viewBox="0 0 80 94"
          fill="none"
          className="treehole-night-lantern-svg"
        >
          <defs>
            <linearGradient id={cap} x1="28" y1="8" x2="52" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5FD" />
              <stop offset="1" stopColor="#7C3AED" />
            </linearGradient>
            <linearGradient id={glass} x1="18" y1="24" x2="62" y2="78" gradientUnits="userSpaceOnUse">
              <stop stopColor="rgba(167,139,250,0.55)" />
              <stop offset="0.45" stopColor="rgba(124,58,237,0.28)" />
              <stop offset="1" stopColor="rgba(49,46,129,0.5)" />
            </linearGradient>
            <radialGradient
              id={core}
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(40 52) rotate(90) scale(22 18)"
            >
              <stop stopColor="#FFF7D6" />
              <stop offset="0.45" stopColor="#FCD34D" />
              <stop offset="1" stopColor="#F59E0B" stopOpacity="0" />
            </radialGradient>
            <filter id={soft} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M40 6c-3 0-5.5 2-5.5 4.5V11h11V10.5C45.5 8 43 6 40 6Z"
            fill={`url(#${cap})`}
          />
          <rect x="36" y="10" width="8" height="5" rx="2" fill="#A78BFA" opacity="0.9" />

          <path
            d="M24 22h32c6 0 11 5 11 11v28c0 10-7 18-16 20l-11 4-11-4c-9-2-16-10-16-20V33c0-6 5-11 11-11Z"
            fill={`url(#${glass})`}
            stroke="rgba(221,214,254,0.55)"
            strokeWidth="1.2"
          />

          <ellipse
            className="treehole-lamp-shade-glow treehole-night-lantern-core"
            cx="40"
            cy="50"
            rx="18"
            ry="14"
            fill={`url(#${core})`}
            filter={`url(#${soft})`}
          />

          <circle cx="32" cy="42" r="1.2" fill="#FEF9C3" opacity="0.9" />
          <circle cx="48" cy="46" r="0.9" fill="#FDE68A" opacity="0.85" />
          <circle cx="36" cy="58" r="1" fill="#FFF7ED" opacity="0.75" />
          <circle cx="50" cy="56" r="1.1" fill="#FCD34D" opacity="0.8" />

          <path
            d="M28 78c4 2 8 3 12 3s8-1 12-3"
            stroke="rgba(196,181,253,0.45)"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>

        <span className="treehole-night-lantern-spark treehole-night-lantern-spark--a" />
        <span className="treehole-night-lantern-spark treehole-night-lantern-spark--b" />
        <span className="treehole-night-lantern-spark treehole-night-lantern-spark--c" />
      </div>
    </div>
  );
}
