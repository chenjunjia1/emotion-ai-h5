import { PRODUCTS } from "@/lib/constants/v1";
import type { ProductDef } from "@/lib/types/v1";
import type { PlanType } from "@/lib/types/v1";
import {
  INSPIRATION_PRODUCTS,
  PACK_PRICING,
  PRO_PLANS,
  type ImageCountOption,
} from "@/lib/publish-pack/pack-pricing";
import {
  applyProDiscountPrice,
  getAdvancedPrice,
  getQuickFreePerDay,
  getQuickOveragePrice,
} from "@/services/pricingService";

export function resolveInspirationProduct(productId: string): ProductDef | null {
  const pack = INSPIRATION_PRODUCTS.find((p) => p.id === productId);
  if (pack) {
    return PRODUCTS.find((p) => p.productName === pack.productName) ?? null;
  }
  const pro = PRO_PLANS.find((p) => p.id === productId);
  if (pro) {
    return PRODUCTS.find((p) => p.productName === pro.productName) ?? null;
  }
  return null;
}

export function getQuickPackCostLabel(
  plan: PlanType,
  opts?: {
    freeRemaining?: number;
    isPro?: boolean;
    /** 正在请求 quota-preview */
    loading?: boolean;
    /** 未登录或非 server 模式 */
    needsLogin?: boolean;
    /** 演示模式（无服务端） */
    demo?: boolean;
    /** 接口失败 */
    error?: boolean;
  }
): string {
  if (opts?.loading) return "正在同步今日免费次数…";
  if (opts?.error) return "额度同步失败 · 点下方按钮重试";
  if (opts?.needsLogin) return "登录后显示今日免费剩余次数";
  if (opts?.demo) {
    return `演示模式 · 每日 ${getQuickFreePerDay()} 次免费`;
  }
  if (opts?.isPro || plan !== "free") {
    return "Pro · 快速文案不限次";
  }
  if (opts?.freeRemaining === undefined) {
    return "同步今日免费次数…";
  }
  const cap = getQuickFreePerDay();
  const free = opts.freeRemaining;
  if (free > 0) {
    return `今日免费剩余 ${free}/${cap} 次`;
  }
  return `今日免费已用完 · 超出 ${getQuickOveragePrice()} 灵感/次`;
}

export function getAdvancedPackCostPoints(
  imageCount: ImageCountOption,
  plan: PlanType
): number {
  return applyProDiscountPrice(getAdvancedPrice(imageCount), plan);
}

export function getAdvancedPackCostLabel(
  imageCount: ImageCountOption,
  plan: PlanType
): string {
  const pts = getAdvancedPackCostPoints(imageCount, plan);
  const base = getAdvancedPrice(imageCount);
  if (pts < base) {
    return `${pts} 灵感（Pro 已打折，原价 ${base}）`;
  }
  return `${pts} 灵感`;
}

export function getPackGenerateButtonLabel(
  mode: "quick" | "advanced",
  imageCount: ImageCountOption,
  plan: PlanType
): string {
  if (mode === "quick") {
    return "先帮我出文案";
  }
  const pts = getAdvancedPackCostPoints(imageCount, plan);
  return `生成高级图文包 · ${pts} 灵感`;
}

export function getPackSummaryTitle(
  mode: "quick" | "advanced",
  imageCount: ImageCountOption
): string {
  if (mode === "quick") return "快速文案包";
  return `${imageCount} 张高级图文包`;
}

export { INSPIRATION_PRODUCTS, PRO_PLANS, PACK_PRICING };
