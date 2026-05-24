"use client";

import { Card } from "@/components/ui/card";
import { QUOTA_COST } from "@/lib/constants/v1";
import { TAB_META } from "@/lib/create/workshop-scenarios";
import { formatInspirationCount } from "@/lib/banner-inspiration-count";
import { getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";
import type { I18nKey } from "@/lib/i18n";
import type { User } from "@/lib/types/v1";

type TabId = keyof typeof TAB_META;

export function CreateWorkshopHero({
  tr,
  tab,
  socialCount,
  user,
}: {
  tr: (key: I18nKey) => string;
  tab: TabId;
  socialCount: number;
  user: User | null;
}) {
  const meta = TAB_META[tab];
  const cost = QUOTA_COST[meta.costKey] ?? 1;
  const total = user ? getTotalQuota(user) : 0;
  const affordable = cost > 0 ? Math.floor(total / cost) : 0;

  const steps =
    tab === "reply"
      ? [tr("createStepReply1"), tr("createStepReply2"), tr("createStepReply3")]
      : tab === "viral"
        ? [tr("createStepViral1"), tr("createStepViral2"), tr("createStepViral3")]
        : tab === "score"
          ? [tr("createStepScore1"), tr("createStepScore2"), tr("createStepScore3")]
          : [tr("createStepPack1"), tr("createStepPack2"), tr("createStepPack3")];

  const heroGrad: Record<TabId, string> = {
    reply: "from-[#FFB88C] via-[#FF9A6B] to-[#FF7AAE]",
    viral: "from-orange-400 via-[#FF6B6B] to-rose-500",
    score: "from-violet-400 via-[#FF7AAE] to-[#FFC46B]",
    pack: "from-[#FF6B6B] via-[#FF7AAE] to-[#FFC46B]",
  };

  return (
    <Card className="mb-3 overflow-hidden border-[#FF7AAE]/30 bg-transparent p-0 shadow-[0_8px_28px_rgba(255,122,174,0.15)]">
      <div
        className={cn(
          "bg-gradient-to-br px-4 py-3.5 text-white",
          heroGrad[tab]
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="inline-flex rounded-full bg-black/15 px-2 py-0.5 text-[9px] font-black text-white backdrop-blur-sm">
            {tr("createHeroTag")}
          </p>
          <span className="shrink-0 rounded-full bg-black/15 px-2 py-0.5 text-[9px] font-black text-white">
            {meta.emoji} {tr("createCostBadge").replace("{cost}", String(cost))}
          </span>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-white drop-shadow-sm">
          {tr("createSocialProof").replace("{count}", formatInspirationCount(socialCount))}
        </p>
        {user ? (
          <p className="mt-1 text-[10px] font-bold text-white/95 drop-shadow-sm">
            {tr("createQuotaLeft")
              .replace("{total}", String(total))
              .replace("{count}", String(affordable))
              .replace("{cost}", String(cost))}
          </p>
        ) : null}
        <div className="mt-3 flex gap-2">
          {steps.map((label, i) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center rounded-xl bg-black/10 px-1 py-1.5 backdrop-blur-sm"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-[#FF5C8A] shadow-sm">
                {i + 1}
              </span>
              <span className="mt-0.5 text-center text-[9px] font-bold leading-tight text-white drop-shadow-sm">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
