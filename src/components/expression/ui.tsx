"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function GradientButton({
  children,
  className,
  onClick,
  href,
  type = "button",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  type?: "button" | "submit";
}) {
  const cls = cn(
    "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] px-5 py-2.5 text-[13px] font-bold text-white shadow-[0_4px_16px_rgba(255,79,139,0.35)] transition active:scale-[0.97]",
    className
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function SectionHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-2.5 flex items-end justify-between gap-2 px-0.5">
      <div>
        <h2 className="text-[15px] font-semibold text-[#333]">{title}</h2>
        {sub ? <p className="mt-0.5 text-[11px] text-[#999]">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CreamCard({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-[20px] bg-white text-left shadow-[0_2px_14px_rgba(255,120,150,0.06)] ring-1 ring-[#FFE8F0]/80 transition active:scale-[0.98]",
        className
      )}
    >
      {children}
    </Tag>
  );
}

export function Icon3D({
  emoji,
  gradient,
  size = "md",
}: {
  emoji: string;
  gradient: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? "h-14 w-14 text-2xl" : size === "sm" ? "h-9 w-9 text-base" : "h-11 w-11 text-xl";
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br shadow-[0_6px_16px_rgba(255,100,130,0.25)]",
        gradient,
        dim
      )}
      aria-hidden
    >
      {emoji}
    </span>
  );
}
