/** AI 发布包 — 定价与权益（产品 spec） */

export type ImageCountOption = 1 | 2 | 4;

export const PACK_PRICING = {
  quick: {
    freePerDay: 3,
    overagePoints: 5,
  },
  advanced: {
    1: 80,
    2: 100,
    4: 140,
  } as Record<ImageCountOption, number>,
  extra: {
    regenText: 10,
    restyle: 10,
    regenImage: 20,
    coverTextOptimize: 5,
  },
  proDiscount: {
    pro: 0.9,
    premium: 0.85,
    studio: 0.8,
  } as Record<string, number>,
} as const;

export const INSPIRATION_PRODUCTS = [
  {
    id: "pack_20",
    productName: "灵感加油包 20点",
    name: "AI体验包",
    points: 20,
    price: 3.9,
    tag: "换图刚好",
  },
  {
    id: "pack_50",
    productName: "灵感加油包 50点",
    name: "灵感加油包",
    points: 50,
    price: 9.9,
    tag: "补一次高级图",
  },
  {
    id: "pack_120",
    productName: "灵感加油包 120点",
    name: "创作者包",
    points: 120,
    price: 19.9,
    tag: "最适合高级模式",
  },
  {
    id: "pack_300",
    productName: "灵感加油包 300点",
    name: "进阶创作包",
    points: 300,
    price: 49,
    tag: "高频创作",
  },
] as const;

export const PRO_PLAN_PRODUCT_NAME = "Pro会员 30天";

export const PRO_PLANS = [
  {
    id: "pro_month",
    productName: PRO_PLAN_PRODUCT_NAME,
    name: "Pro月卡",
    price: 29,
    perks: ["快速出文案不限次", "高级图文 9 折", "无水印保存"],
  },
  {
    id: "pro_quarter",
    productName: "高级会员 30天",
    name: "Pro季卡",
    price: 79,
    perks: ["快速不限", "高级包85折", "评论区军师"],
  },
  {
    id: "pro_year",
    productName: "Pro年卡 365天",
    name: "Pro年卡",
    price: 199,
    perks: ["快速不限", "高级包8折", "每月1次4图兑换券"],
  },
] as const;

export function getUpgradeDiff(
  current: ImageCountOption,
  target: ImageCountOption
): number {
  if (target <= current) return 0;
  return PACK_PRICING.advanced[target] - PACK_PRICING.advanced[current];
}
