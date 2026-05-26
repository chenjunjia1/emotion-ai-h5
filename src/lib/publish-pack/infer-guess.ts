import type { ContentGuess } from "@/lib/publish-pack/quick-package-types";
import {
  GUESS_GOALS,
  GUESS_IMAGE_STYLES,
  GUESS_PERSONALITIES,
  GUESS_PLATFORMS,
  GUESS_STYLES,
} from "@/lib/publish-pack/studio-config";

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length]!;
}

/** 根据用户一句话做轻量「AI 猜你适合」（本地规则 + 稳定随机） */
export function inferContentGuess(topic: string): ContentGuess {
  const t = topic.trim().toLowerCase();
  const seed = [...topic].reduce((a, c) => a + c.charCodeAt(0), 0);

  let platform: (typeof GUESS_PLATFORMS)[number] = "小红书";
  if (/朋友圈|好友圈|wx/.test(t)) platform = "朋友圈";
  else if (/抖音|短视频|口播/.test(t)) platform = "抖音";
  else if (/视频号|微信视频/.test(t)) platform = "视频号";
  else if (/b站|哔哩|中长/.test(t)) platform = "B站";

  let personality = pick(GUESS_PERSONALITIES, seed);
  if (/累|治愈|松弛|下班|emo|难过/.test(t)) personality = "温柔治愈感";
  if (/搞笑|嘴替|打工人|吐槽/.test(t)) personality = "搞笑嘴替";
  if (/干货|教程|技巧|职场/.test(t)) personality = "专业干货";

  let contentStyle = pick(GUESS_STYLES, seed + 1);
  if (/高级|质感|氛围/.test(t)) contentStyle = "高级松弛";
  if (/种草|好物|推荐/.test(t)) contentStyle = "种草安利";

  let goal = pick(GUESS_GOALS, seed + 2);
  if (/评论|互动|聊天/.test(t)) goal = "想引发评论互动";
  if (/带货|转化|成交/.test(t)) goal = "想种草转化";

  const imageStyle = /猫|宠物/.test(t)
    ? "暖色治愈"
    : pick(GUESS_IMAGE_STYLES, seed + 3);

  return {
    platform,
    personality,
    contentStyle,
    goal,
    imageStyle,
  };
}
