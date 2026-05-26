/** 复盘结果 → 发布包 URL 参数（保证选题与补充说明联动） */

export type ReviewPackBridgeParams = {
  nextTopic: string;
  reviewTitle?: string;
  nextSuggestion?: string;
  accountType?: string;
  platform?: string;
};

export function buildPublishPackHrefFromReview(opts: ReviewPackBridgeParams): string {
  const topic = opts.nextTopic.trim();
  if (!topic) return "/publish-pack";

  const q = new URLSearchParams();
  q.set("topic", topic);
  q.set("from_review", "1");
  if (opts.reviewTitle?.trim()) q.set("review_title", opts.reviewTitle.trim());
  if (opts.nextSuggestion?.trim()) {
    q.set("review_hint", opts.nextSuggestion.trim().slice(0, 160));
  }
  if (opts.accountType?.trim()) q.set("account_type", opts.accountType.trim());
  if (opts.platform?.trim()) q.set("platform", opts.platform.trim());
  return `/publish-pack?${q.toString()}`;
}

export function parseReviewPackSearchParams(params: URLSearchParams): {
  fromReview: boolean;
  reviewTitle: string;
  reviewHint: string;
} {
  return {
    fromReview: params.get("from_review") === "1",
    reviewTitle: params.get("review_title")?.trim() ?? "",
    reviewHint: params.get("review_hint")?.trim() ?? "",
  };
}

export function mergeReviewExtraNote(
  base: string,
  reviewHint: string,
  reviewTitle: string
): string {
  const parts: string[] = [];
  if (reviewTitle) parts.push(`复盘内容标题：${reviewTitle}`);
  if (reviewHint) parts.push(`复盘建议：${reviewHint}`);
  parts.push("请按复盘推荐选题原创生成，语气与建议保持一致。");
  const block = parts.join("；");
  if (!base.trim()) return block;
  if (base.includes(reviewHint) || base.includes("复盘建议")) return base;
  return `${base.trim()}\n${block}`;
}
