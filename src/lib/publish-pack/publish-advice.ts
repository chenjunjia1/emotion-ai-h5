/** 发布建议文案 — 避免「只能某时段发」的压迫感 */

const NARROW_TIME =
  /周[一二三四五六日天]|星期|今晚|今天|明天|仅限|只能|必须|20:|21:|22:|19:|18:|00:|01:/;

function trafficTip(platform: string): string {
  if (platform.includes("朋友圈")) {
    return "午休、下班后更容易被朋友看到";
  }
  if (platform.includes("抖音") || platform.includes("视频号")) {
    return "傍晚到睡前刷的人多";
  }
  return "晚上刷笔记的人多，白天发也完全 OK";
}

/**
 * 统一成「随时可发 + 流量参考」，不让用户觉得过了点就发不了
 */
export function normalizeBestTime(raw: string | undefined, platform: string): string {
  const p = platform || "小红书";
  const tip = trafficTip(p);
  const t = (raw ?? "").trim();

  if (!t || NARROW_TIME.test(t)) {
    return `现在就能发 · ${tip}`;
  }

  if (/随时|现在|即可|都行|都可以/.test(t)) {
    return t.includes("·") ? t : `${t} · ${tip}`;
  }

  return `现在就能发 · 参考时段：${t.replace(/^参考[:：]?/, "")}`;
}

export function normalizePublishAdvice(input: {
  platform?: string;
  bestTime?: string;
  audience?: string;
  commentHook?: string;
}): {
  platform: string;
  bestTime: string;
  audience: string;
  commentHook: string;
} {
  const platform = input.platform?.trim() || "小红书";
  return {
    platform,
    bestTime: normalizeBestTime(input.bestTime, platform),
    audience: input.audience?.trim() || "18–30 岁爱生活、爱记录的日常分享者",
    commentHook: input.commentHook?.trim() || "你有什么同感？评论区聊聊～",
  };
}
