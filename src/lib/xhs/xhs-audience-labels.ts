import type { XhsAudience } from "@/lib/xhs/types";

/** 卡片氛围标签（展示用，不再按性别分） */
export const XHS_AUDIENCE_LABELS: Record<XhsAudience, string> = {
  女生爱发: "氛围感",
  男生爱发: "城市感",
  通用: "日常向",
};

export function formatXhsAudience(audience: XhsAudience | string): string {
  return XHS_AUDIENCE_LABELS[audience as XhsAudience] ?? audience;
}
