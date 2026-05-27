"use client";

import { ProfileHeroCard } from "@/components/profile/profile-dashboard";
import type { GrowthState } from "@/hooks/use-growth";
import type { I18nKey } from "@/lib/i18n";
import type { User } from "@/lib/types/v1";
import { getTotalQuota } from "@/lib/v1/quota";

type Tr = (key: I18nKey) => string;

export function ProfileExpressionPanel({
  user,
  planLabel,
  growth,
  tr,
  onOpenPricing,
}: {
  user: User;
  planLabel: string;
  growth: GrowthState;
  tr: Tr;
  onOpenPricing?: () => void;
}) {
  const totalQuota = getTotalQuota(user);

  return (
    <ProfileHeroCard
      user={user}
      growth={growth}
      totalQuota={totalQuota}
      planLabel={planLabel}
      tr={tr}
      onOpenPricing={onOpenPricing}
    />
  );
}
