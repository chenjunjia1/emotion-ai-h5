"use client";

import { useRef } from "react";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function InvitePoster() {
  const { tr, showToast, user } = useApp();
  const { inviteLink } = useProduct();
  const posterRef = useRef<HTMLDivElement>(null);
  const code = user?.inviteCode ?? "—";

  const copyPosterText = () => {
    const text = [
      tr("appName"),
      tr("homeTitle"),
      tr("invitePosterDesc"),
      `${tr("inviteCopyLink")}: ${inviteLink}`,
      `${tr("inviteCodeLabel")}: ${code}`,
    ].join("\n");
    void copyToClipboard(text);
    showToast(tr("copied"));
  };

  return (
    <div className="space-y-3">
      <div
        ref={posterRef}
        className={cn(
          "overflow-hidden rounded-3xl bg-gradient-to-br p-5 text-white shadow-lg",
          theme.primary
        )}
      >
        <div className="text-[10px] font-bold uppercase tracking-wider text-white/80">
          {tr("appName")}
        </div>
        <h3 className="mt-2 text-lg font-bold leading-snug">{tr("homeTitle")}</h3>
        <p className="mt-2 text-[11px] leading-5 text-white/90">{tr("invitePosterDesc")}</p>
        <div className="mt-4 rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
          <div className="text-[10px] text-white/80">{tr("inviteCodeLabel")}</div>
          <div className="mt-1 text-2xl font-bold tracking-widest">{code}</div>
          <div className="mt-2 break-all text-[9px] text-white/75">{inviteLink}</div>
        </div>
        <div className="mt-3 flex h-16 items-center justify-center rounded-xl bg-white/10 text-[10px] text-white/70">
          扫码 / 打开链接注册
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="w-full" onClick={copyPosterText}>
          {tr("inviteCopyPoster")}
        </Button>
        <Button
          className="w-full"
          onClick={() => {
            void copyToClipboard(inviteLink);
            showToast(tr("copied"));
          }}
        >
          {tr("inviteCopyLink")}
        </Button>
      </div>
    </div>
  );
}
