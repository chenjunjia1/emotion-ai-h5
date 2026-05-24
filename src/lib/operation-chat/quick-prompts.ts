/** AI 运营顾问 — 快捷问题（每日更新感） */
export const OPS_QUICK_PROMPTS = [
  {
    id: "q1",
    emoji: "🔥",
    label: "帮我找今天适合发的热点",
    prompt: "我是新手博主，帮我从今日热点里挑 3 条最适合普通人发的，并说明为什么。",
  },
  {
    id: "q2",
    emoji: "🎯",
    label: "账号定位不清晰，帮我分析",
    prompt: "我想做短视频但不知道做什么账号，帮我分析适合我的定位和平台。",
  },
  {
    id: "q3",
    emoji: "✨",
    label: "想写出容易爆的标题",
    prompt: "给我 5 条适合抖音/小红书的爆款标题公式，并各举 1 个例子。",
  },
  {
    id: "q4",
    emoji: "📉",
    label: "播放量低，帮我分析原因",
    prompt: "我的视频播放量一直很低，帮我从标题、前3秒、发布时间分析可能原因。",
  },
  {
    id: "q5",
    emoji: "🎬",
    label: "帮我生成一条口播脚本",
    prompt: "帮我写一条 30 秒口播脚本，主题是下班后的治愈日常，口语化、能直接拍。",
  },
  {
    id: "q6",
    emoji: "📕",
    label: "我想做小红书，怎么起号？",
    prompt: "我是零基础，想在小红书起号，给我 7 天起号计划和第一天发什么。",
  },
  {
    id: "q7",
    emoji: "🐱",
    label: "宠物号今天发什么？",
    prompt: "我养猫，想做宠物治愈号，今天发什么选题容易有互动？",
  },
  {
    id: "q8",
    emoji: "💬",
    label: "情感号怎么提高互动？",
    prompt: "我做情感共鸣类账号，评论很少，怎么提高互动和完播？",
  },
] as const;

export type OpsConsultantResult = {
  analysis?: string;
  todayTopics?: string[];
  titleSuggestions?: string[];
  contentStructure?: string[];
  publishTips?: string[];
  recommendPublishPack?: boolean;
  recommendHotTopic?: string;
  reply?: string;
};
