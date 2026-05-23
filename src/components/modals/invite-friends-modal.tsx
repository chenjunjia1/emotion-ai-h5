"use client";

import Link from "next/link";
import { Gift, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const RULE_KEYS = [
  "inviteRulesStep1",
  "inviteRulesStep2",
  "inviteRulesStep3",
] as const;

export function InviteFriendsModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { tr, showToast, user } = useApp();
  const { inviteLink } = useProduct();
  if (!open) return null;

  const code = user?.inviteCode ?? "—";

  return (
    <div
      className="fixed inset-0 z-[65] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={cn(
          "w-full max-w-md rounded-3xl border bg-white p-5 shadow-xl",
          theme.border
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 id="invite-modal-title" className="text-lg font-black text-slate-900">
              {tr("bannerInviteModalTitle")}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#FF5C8A]">
              {tr("inviteCardDesc")}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full p-1 text-slate-400"
            onClick={onClose}
            aria-label="close"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="mt-3 space-y-1 rounded-2xl bg-orange-50/60 px-3 py-2 text-[11px] leading-relaxed text-slate-700">
          {RULE_KEYS.map((key, i) => (
            <li key={key}>
              <span className="font-bold text-[#FF5C8A]">{i + 1}. </span>
              {tr(key)}
            </li>
          ))}
        </ul>

        <div className="mt-4 rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 p-4 ring-1 ring-[#FF7AAE]/20">
          <div className="text-xs font-semibold text-slate-500">{tr("inviteCodeLabel")}</div>
          <div className="mt-1 text-2xl font-black tracking-widest text-[#FF5C8A]">{code}</div>
          <p className="mt-3 break-all text-[11px] leading-5 text-slate-500">{inviteLink}</p>
        </div>

        <button
          type="button"
          className={cn(
            "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-black text-white shadow-md active:scale-[0.98]",
            `bg-gradient-to-r ${theme.primary}`
          )}
          onClick={() => {
            void copyToClipboard(inviteLink);
            showToast(tr("copied"));
          }}
        >
          <Gift size={18} />
          {tr("inviteCopyLink")}
        </button>

        <Link
          href="/invite"
          onClick={onClose}
          className="mt-2 block text-center text-xs font-bold text-[#FF5C8A]"
        >
          查看邀请记录与海报 →
        </Link>
      </div>
    </div>
  );
}
