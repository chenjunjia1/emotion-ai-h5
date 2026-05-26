/**
 * 发布包相关支付 — 复用全局 mock 支付，本地封装产品 ID
 */
import { INSPIRATION_PRODUCTS, PRO_PLANS } from "@/lib/publish-pack/pack-pricing";

export type PackProductId =
  | (typeof INSPIRATION_PRODUCTS)[number]["id"]
  | (typeof PRO_PLANS)[number]["id"];

export function getPackProduct(productId: string) {
  const insp = INSPIRATION_PRODUCTS.find((p) => p.id === productId);
  if (insp) return { type: "quota_pack" as const, ...insp };
  const pro = PRO_PLANS.find((p) => p.id === productId);
  if (pro) return { type: "membership" as const, ...pro };
  return null;
}

export function listPackProducts() {
  return { inspiration: INSPIRATION_PRODUCTS, pro: PRO_PLANS };
}

/** 客户端 mock 支付成功提示用 */
export function mockPaySuccessLabel(productId: string): string {
  const p = getPackProduct(productId);
  if (!p) return "支付成功";
  if (p.type === "quota_pack") return `已获得 ${p.points} 灵感`;
  return `已开通 ${p.name}`;
}
