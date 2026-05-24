"use client";

import Link from "next/link";
import { Gift, Users, Zap } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { getInviteProgress } from "@/lib/v1/invite-progress";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const RULE_KEYS = [
  "inviteRulesStep1",
  "inviteRulesStep2",
  "inviteRulesStep3",
] as const;

export function HomeInvitePromo() {
  const { tr, user, setLoginOpen, showToast } = useApp();
  const { inviteRecords, inviteLink } = useProduct();
  const progress = getInviteProgress(user, inviteRecords);

  const onInviteSlotClick = (filled: boolean) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (filled) return;
    void copyToClipboard(inviteLink).then((ok) => {
      showToast(ok ? tr("inviteSlotCopyOk") : tr("inviteSlotCopyFail"));
    });
  };

  return (
    <section
      className={cn(
        "relative mt-1 overflow-hidden rounded-[1.35rem] border border-[#FF7AAE]/25 p-4 shadow-[0_10px_28px_rgba(255,107,107,0.18)]",
        "bg-gradient-to-br from-[#FFF0F5] via-white to-[#FFF8EE]"
      )}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FF7AAE]/15 blur-2xl" />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md",
            `bg-gradient-to-br ${theme.primary}`
          )}
        >
          <Gift size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-black text-slate-900">{tr("invitePromoTitle")}</h3>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">{tr("invitePromoSub")}</p>
        </div>
        <span className="shrink-0 rounded-full bg-[#FFC46B] px-2 py-1 text-[9px] font-black text-white shadow-sm">
          HOT
        </span>
      </div>

      <ul className="relative mt-3 space-y-1.5 text-[10px] leading-snug text-slate-700">
        {RULE_KEYS.map((key, i) => (
          <li key={key} className="flex gap-1.5">
            <span className="font-black text-[#FF5C8A]">{i + 1}.</span>
            <span>{tr(key)}</span>
          </li>
        ))}
      </ul>

      {user ? (
        <div className="relative mt-3 rounded-2xl bg-white/80 px-3 py-2 ring-1 ring-[#FF7AAE]/15">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold">
            <span className="text-slate-600">{tr("invitePromoProgress")}</span>
            <span className="text-[#FF5C8A]">
              {progress.count}/{progress.target}
              {progress.unlocked ? " · 已达成" : progress.remaining > 0 ? ` · 还差${progress.remaining}人` : ""}
            </span>
          </div>
          <div className="flex justify-between gap-2">
            {progress.slots.map((slot) => (
              <button
                key={slot.id}
                type="button"
                disabled={slot.filled}
                onClick={() => onInviteSlotClick(slot.filled)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-0.5 transition active:scale-95",
                  slot.filled ? "cursor-default" : "cursor-pointer hover:bg-orange-50/60"
                )}
                aria-label={slot.filled ? tr("inviteSlotFilled") : tr("inviteCopyLink")}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm shadow-sm ring-2",
                    slot.filled
                      ? "bg-white ring-[#FF7AAE]/40"
                      : "bg-orange-50/80 ring-orange-100 text-slate-400"
                  )}
                >
                  {slot.emoji}
                </span>
                <span className="text-[8px] font-semibold text-slate-500">
                  {slot.filled ? slot.label : "待邀请"}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-center text-[9px] text-slate-400">
            {tr("invitePromoUnlockHint")}
          </p>
        </div>
      ) : null}

      {user ? (
        <Link
          href="/invite"
          className={cn(
            "relative mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white shadow-[0_6px_20px_rgba(255,107,107,0.35)] active:scale-[0.98]",
            `bg-gradient-to-r ${theme.primary}`
          )}
        >
          <Users size={18} />
          {tr("invitePromoCta")}
          <Zap size={14} className="fill-white" />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className={cn(
            "relative mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-black text-white shadow-md active:scale-[0.98]",
            `bg-gradient-to-r ${theme.primary}`
          )}
        >
          <Gift size={18} />
          {tr("invitePromoLoginCta")}
        </button>
      )}
    </section>
  );
}
