import {
  getUpgradeDiff,
  PACK_PRICING,
  type ImageCountOption,
} from "@/lib/publish-pack/pack-pricing";
import type { PlanType } from "@/lib/types/v1";

export function getAdvancedPrice(imageCount: ImageCountOption): number {
  return PACK_PRICING.advanced[imageCount];
}

export function getUpgradeDiffPrice(
  current: ImageCountOption,
  target: ImageCountOption
): number {
  return getUpgradeDiff(current, target);
}

export function getProDiscount(plan: PlanType): number {
  if (plan === "studio") return PACK_PRICING.proDiscount.studio;
  if (plan === "premium") return PACK_PRICING.proDiscount.premium;
  if (plan === "pro") return PACK_PRICING.proDiscount.pro;
  return 1;
}

export function applyProDiscountPrice(base: number, plan: PlanType): number {
  const d = getProDiscount(plan);
  return Math.max(1, Math.round(base * d));
}

export function getQuickOveragePrice(): number {
  return PACK_PRICING.quick.overagePoints;
}

export function getQuickFreePerDay(): number {
  return PACK_PRICING.quick.freePerDay;
}
