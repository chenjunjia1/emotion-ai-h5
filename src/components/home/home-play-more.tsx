"use client";

import Link from "next/link";
import { useApp } from "@/contexts/app-context";

const MORE: {
  href: string;
  emoji: string;
  titleKey:
    | "morePlayBlindbox"
    | "morePlayHot"
    | "morePlayInvite"
    | "morePlayReply"
    | "morePlayTest";
  hot?: boolean;
}[] = [
  { href: "/topic-box", emoji: "🎲", titleKey: "morePlayBlindbox", hot: true },
  { href: "/hot-topics", emoji: "🔥", titleKey: "morePlayHot", hot: true },
  { href: "/invite", emoji: "🎁", titleKey: "morePlayInvite" },
  { href: "/create?tab=reply", emoji: "💬", titleKey: "morePlayReply" },
  { href: "/account-test", emoji: "🧪", titleKey: "morePlayTest" },
];

export function HomePlayMore() {
  const { tr } = useApp();

  return (
    <section>
      <h2 className="text-sm font-black text-slate-800">{tr("morePlayTitle")}</h2>
      <p className="mt-0.5 text-xs text-slate-500">{tr("morePlaySub")}</p>
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {MORE.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex min-w-[100px] shrink-0 flex-col items-center rounded-[20px] border border-orange-100/70 bg-white px-3 py-3 shadow-sm active:scale-[0.97]"
          >
            {item.hot && (
              <span className="absolute -right-0.5 -top-0.5 rounded-full bg-[#FF6B6B] px-1.5 py-0.5 text-[8px] font-black text-white">
                HOT
              </span>
            )}
            <span className="text-2xl">{item.emoji}</span>
            <span className="mt-1 text-center text-[10px] font-bold leading-tight text-slate-700">
              {tr(item.titleKey)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
