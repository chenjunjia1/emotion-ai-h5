"use client";

import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { InvitePoster } from "@/components/invite/invite-poster";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Gift, Sparkles } from "lucide-react";

const STATUS_LABEL: Record<string, string> = {
  pending: "待完成注册",
  valid: "有效邀请",
  rewarded: "已发放奖励",
  invalid: "无效邀请",
  member_rewarded: "好友已开通会员",
};

export default function InvitePage() {
  const { tr, showToast, user, setLoginOpen } = useApp();
  const { inviteLink, inviteRecords, openInviteBlindBox } = useProduct();
  const code = user?.inviteCode ?? (user ? `SV${user.mobile.slice(-4)}` : "—");

  if (!user) {
    return (
      <AppShell>
        <SectionTitle eyebrow="🎁" title={tr("invitePageTitle")} desc={tr("inviteCardDesc")} />
        <Card>
          <CardContent className="space-y-2 text-sm leading-6 text-slate-600">
            <p className="font-bold text-slate-800">{tr("inviteGuestRulesTitle")}</p>
            <p>· {tr("inviteGuestRule1")}</p>
            <p>· {tr("inviteGuestRule2")}</p>
            <p>· {tr("inviteGuestRule3")}</p>
          </CardContent>
        </Card>
        <Button className="mt-4 w-full" onClick={() => setLoginOpen(true)}>
          {tr("login")}
        </Button>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🎁"
        title={tr("invitePageTitle")}
        desc={tr("inviteCardDesc")}
      />

      <Card>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-rose-50 p-4">
            <div className="text-xs text-slate-500">我的邀请码</div>
            <div className="text-2xl font-bold tracking-widest text-orange-600">{code}</div>
          </div>
          <p className="break-all text-xs text-slate-500">{inviteLink}</p>
          <Button
            className="w-full"
            onClick={() => {
              void copyToClipboard(inviteLink);
              showToast(tr("copied"));
            }}
          >
            <Gift size={18} /> {tr("inviteCopyLink")}
          </Button>
          <InvitePoster />

          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            <div className={cn("rounded-2xl p-2", theme.softOrange)}>
              <div className="font-bold text-lg text-orange-600">{user.inviteCount ?? 0}</div>
              <div className="text-slate-500">已邀请</div>
            </div>
            <div className={cn("rounded-2xl p-2", theme.softOrange)}>
              <div className="font-bold text-lg text-orange-600">
                {user.inviteRewardTotal ?? 0}
              </div>
              <div className="text-slate-500">累计奖励灵感</div>
            </div>
            <div className={cn("rounded-2xl p-2", theme.softOrange)}>
              <div className="font-bold text-lg text-orange-600">
                {user.inviteBlindBoxCount ?? 0}
              </div>
              <div className="text-slate-500">{tr("inviteBlindBoxLeft")}</div>
            </div>
          </div>

          {(user.inviteBlindBoxCount ?? 0) > 0 && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={openInviteBlindBox}
            >
              <Sparkles size={18} /> {tr("inviteOpenBlindBox")}
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("inviteRulesTitle")}</h3>
          <ol className="space-y-2 text-xs leading-6 text-slate-700">
            {(
              [
                "inviteRulesStep1",
                "inviteRulesStep2",
                "inviteRulesStep3",
                "inviteRulesStep4",
                "inviteRulesStep5",
              ] as const
            ).map((key, i) => (
              <li key={key} className="flex gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF7AAE]/15 text-[10px] font-black text-[#FF5C8A]">
                  {i + 1}
                </span>
                <span>{tr(key)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[10px] text-slate-400">{tr("inviteRulesBrief")}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("inviteRecords")}</h3>
          {inviteRecords.length === 0 && (
            <p className="text-sm text-slate-500">还没有邀请记录，分享链接给好友吧</p>
          )}
          {inviteRecords.map((r) => (
            <div
              key={r.id}
              className="mb-2 rounded-2xl border border-orange-100 bg-orange-50/50 p-3 text-xs leading-6"
            >
              <div className="font-bold text-slate-800">{r.inviteeMobileMasked}</div>
              <div className="text-slate-500">{r.registeredAt}</div>
              <div>
                状态：{STATUS_LABEL[r.rewardStatus] ?? r.rewardStatus} · 奖励灵感 +
                {r.inviterRewardQuota}
                {r.memberRewardQuota ? ` · 会员额外+${r.memberRewardQuota}` : ""}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
