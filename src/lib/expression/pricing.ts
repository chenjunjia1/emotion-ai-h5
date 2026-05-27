import type { ExpressionGenerateKind } from "@/lib/api/expression/types";
import type { PlanType } from "@/lib/types/v1";

/** 各生成类型消耗的灵感点数（与 QUOTA_COST 键名一致） */
export const EXPRESSION_QUOTA_KEYS = {
  quick: "expression_quick",
  chat_reply: "expression_chat_reply",
  emotion_sign: "expression_emotion",
  moments: "expression_moments",
  xhs_note: "expression_xhs",
  xhs_title: "expression_xhs",
  wechat_status: "expression_moments",
  video_pack: "expression_xhs",
  image_caption: "expression_image",
  private_domain: "expression_xhs",
  account_diagnosis: "expression_account_diagnosis",
  commerce_pack: "expression_commerce_pack",
} as const;

export type ExpressionQuotaKey =
  (typeof EXPRESSION_QUOTA_KEYS)[keyof typeof EXPRESSION_QUOTA_KEYS];

const VIP_KINDS = new Set<ExpressionGenerateKind>([
  "moments",
  "xhs_note",
  "xhs_title",
  "wechat_status",
  "video_pack",
  "image_caption",
  "private_domain",
]);

export function isExpressionVipKind(kind: ExpressionGenerateKind): boolean {
  return VIP_KINDS.has(kind);
}

export function expressionQuotaKey(kind: ExpressionGenerateKind): ExpressionQuotaKey {
  return EXPRESSION_QUOTA_KEYS[kind as keyof typeof EXPRESSION_QUOTA_KEYS] ?? "expression_quick";
}

/** 免费用户仅可使用基础一键生成、聊天军师、情绪树洞（仍扣灵感） */
export function canUseExpressionKind(plan: PlanType, kind: ExpressionGenerateKind): boolean {
  if (!isExpressionVipKind(kind)) return true;
  return plan !== "free";
}

export const EXPRESSION_PRICING_HINT = {
  quick: "一键生成消耗 10 灵感",
  vip: "朋友圈 / 小红书 / 识图配文为会员功能，开通 Pro 起可用",
  freeDaily: "免费用户每日 30 灵感，约可生成 3 次一键文案",
} as const;
