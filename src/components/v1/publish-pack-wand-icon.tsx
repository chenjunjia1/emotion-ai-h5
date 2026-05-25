"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/** 发布包 — 奶油风魔法棒（与平台 icon 同一套拟物质感） */
export function PublishPackWandIcon({
  className,
  size = 22,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const bg = `${uid}-wand-bg`;
  const stick = `${uid}-wand-stick`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={bg} x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFE8A8" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FF9A4D" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={stick} x1="4" y1="18" x2="14" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#FFF0E8" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="11" fill={`url(#${bg})`} opacity="0.35" />
      <path
        d="M4 19L13.5 9.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M11.5 7.5L16.5 5.5L14.5 10.5L11.5 7.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 5.5L7 7M3.5 8.5H5.5M7 4V6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity="0.95"
      />
      <circle cx="17" cy="6" r="1" fill="currentColor" opacity="0.85" />
      <circle cx="19" cy="9" r="0.7" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
