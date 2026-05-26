import { getHotTopicTop } from "@/lib/server/db/hot-topics-db";
import { upsertPushBroadcast } from "@/lib/server/db/push-broadcasts";
import { listSubscribedOpenids } from "@/lib/server/db/wechat-users";
import { getHotTopicsSubscribeTemplateId } from "@/lib/server/wechat/config";
import { sendHotTopicsSubscribeBatch } from "@/lib/server/wechat/subscribe-message";

export type HotTopicsPushResult = {
  broadcast: boolean;
  subscribe?: { sent: number; failed: number; skipped: boolean; reason?: string };
};

/** Cron 刷新热点后：写入站内广播 + 可选小程序订阅消息 */
export async function publishHotTopicsDailyPush(
  dateKey: string,
  hotCount?: number
): Promise<HotTopicsPushResult> {
  const top = await getHotTopicTop(3);
  const samples = top.map((t) => t.display_title || t.raw_title).filter(Boolean);
  const summary =
    samples.length > 0
      ? samples.join(" · ")
      : "今日选题已更新，挑一条能拍的";
  const count = hotCount ?? top.length;

  const broadcast = await upsertPushBroadcast({
    kind: "hot_topics_daily",
    dateKey,
    emoji: "🔥",
    title: "今日热点已更新",
    body: `${summary}（共 ${count} 条可拍热点）`,
    href: "/hot-topics",
    payload: { samples, count },
  });

  const templateId = getHotTopicsSubscribeTemplateId();
  let subscribe: HotTopicsPushResult["subscribe"];
  if (templateId) {
    const openids = await listSubscribedOpenids(templateId);
    if (openids.length > 0) {
      subscribe = await sendHotTopicsSubscribeBatch({
        openids,
        title: "今日热点已更新",
        summary: samples[0] ?? "点击查看",
        dateKey,
      });
    } else {
      subscribe = { sent: 0, failed: 0, skipped: true, reason: "no_subscribers" };
    }
  }

  return { broadcast: Boolean(broadcast), subscribe };
}
