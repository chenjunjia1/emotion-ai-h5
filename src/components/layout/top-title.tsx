"use client";

import { ArrowLeft, UserRound } from "lucide-react";
import Link from "next/link";

interface TopTitleProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
}

export function TopTitle({
  title,
  subtitle,
  showBack,
  backHref = "/",
  onBack,
}: TopTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showBack &&
          (onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="返回"
            >
              <ArrowLeft className="h-5 w-5 text-stone-600" />
            </button>
          ) : (
            <Link
              href={backHref}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"
              aria-label="返回"
            >
              <ArrowLeft className="h-5 w-5 text-stone-600" />
            </Link>
          ))}
        <div>
          {subtitle && (
            <p className="text-sm text-rose-400">{subtitle}</p>
          )}
          <h1 className="mt-1 text-2xl font-bold tracking-tight">{title}</h1>
        </div>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
        <UserRound className="h-5 w-5 text-rose-400" />
      </div>
    </div>
  );
}
