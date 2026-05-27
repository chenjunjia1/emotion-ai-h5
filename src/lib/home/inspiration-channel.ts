import type { HomeCuratedPick } from "@/lib/content/home-curated-picks";
import type { InspirationChannel } from "@/lib/mock/expression-assistant";

/** 首页「今日灵感精选」Tab 与选题平台映射 */
export function channelForPick(pick: HomeCuratedPick): InspirationChannel {
  const hay = `${pick.platform}${pick.title}${pick.topic}${pick.accountType}`;
  if (/小红书|种草|笔记|OOTD|xhs/i.test(hay)) return "xhs";
  if (/状态|签名|wechat.?status/i.test(hay)) return "wechat_status";
  if (/朋友圈|微信|治愈|情感|日常|小事|松弛|下班/i.test(hay)) return "moments";
  return "video";
}

export function filterPicksByChannel(
  picks: HomeCuratedPick[],
  channel: InspirationChannel
): HomeCuratedPick[] {
  const matched = picks.filter((p) => channelForPick(p) === channel);
  return matched.length > 0 ? matched : picks.slice(0, 6);
}
