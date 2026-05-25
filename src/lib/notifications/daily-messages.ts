/** 每日一条「陪跑短信」— 按日期轮换，语气轻松、像朋友发消息 */

export type DailyNotifyMessage = {
  id: string;
  emoji: string;
  tag: string;
  title: string;
  body: string;
  href?: string;
  cta?: string;
};

const POOL: DailyNotifyMessage[] = [
  {
    id: "d1",
    emoji: "☀️",
    tag: "早安贴",
    title: "早呀，创作者～",
    body: "热点 8 点已更新，挑一条今天能拍的，别空刷手机啦",
    href: "/hot-topics",
    cta: "看今日热点",
  },
  {
    id: "d2",
    emoji: "🎲",
    tag: "今日签",
    title: "选题纠结？交给盲盒",
    body: "点一下抽今日选题，比刷 100 条热点省时间",
    href: "/topic-box",
    cta: "去抽选题",
  },
  {
    id: "d3",
    emoji: "🎬",
    tag: "口播梗",
    title: "30 秒也能出片",
    body: "写一条「下班治愈」口播，对着镜头念就行，发出去算赢",
    href: "/emotion-chat",
    cta: "问 AI 写口播",
  },
  {
    id: "d4",
    emoji: "✨",
    tag: "标题党（良性）",
    title: "标题想破头？",
    body: "让 AI 给 5 条吸睛标题，挑一条改两个字就能用",
    href: "/emotion-chat",
    cta: "生成标题",
  },
  {
    id: "d5",
    emoji: "🔥",
    tag: "周五能量",
    title: "周五啦，适合发轻松向",
    body: "生活感 / 治愈类内容互动往往更好，别硬上干货",
    href: "/publish-pack",
    cta: "做发布包",
  },
  {
    id: "d6",
    emoji: "🌙",
    tag: "周末预告",
    title: "周末别断更太久",
    body: "存一条朋友圈或短视频草稿，周一回来不心慌",
    href: "/publish-pack",
    cta: "先存草稿",
  },
  {
    id: "d7",
    emoji: "🎁",
    tag: "小福利",
    title: "喊个搭子一起涨粉",
    body: "邀请好友各得 10 灵感，两个人都有选题玩了",
    href: "/invite",
    cta: "去邀请",
  },
  {
    id: "d8",
    emoji: "📕",
    tag: "起号贴士",
    title: "新号别日更焦虑",
    body: "第一周稳定发 3 条比瞎发 7 条更有用",
    href: "/emotion-chat",
    cta: "问起号计划",
  },
  {
    id: "d9",
    emoji: "💬",
    tag: "朋友圈",
    title: "今天适合发生活感",
    body: "不像广告的文案，反而更像真人——AI 能写 3 版给你选",
    href: "/publish-pack",
    cta: "写朋友圈",
  },
  {
    id: "d10",
    emoji: "📉",
    tag: "复盘向",
    title: "播放低别慌",
    body: "先查标题和前 3 秒，AI 能帮你找最可能的 3 个原因",
    href: "/emotion-chat",
    cta: "帮我复盘",
  },
  {
    id: "d11",
    emoji: "🍜",
    tag: "美食号",
    title: "探店不用拍大片",
    body: "手机竖屏 + 一句真实感受，比精致滤镜更吃香",
    href: "/hot-topics",
    cta: "找美食热点",
  },
  {
    id: "d12",
    emoji: "🐱",
    tag: "宠物治愈",
    title: "萌宠号今天发啥",
    body: "猫咪日常 + 一句治愈文案，完播率通常不错",
    href: "/hot-topics",
    cta: "看宠物热点",
  },
  {
    id: "d13",
    emoji: "👗",
    tag: "穿搭",
    title: "OOTD 不用换 10 套",
    body: "同一件衣服换角度 + 一句穿搭口诀就够",
    href: "/emotion-chat",
    cta: "问穿搭脚本",
  },
  {
    id: "d14",
    emoji: "💼",
    tag: "职场嘴替",
    title: "打工人共鸣有市场",
    body: "通勤 / 工资 / 面试避坑，选一条你敢聊的",
    href: "/hot-topics",
    cta: "看职场热点",
  },
  {
    id: "d15",
    emoji: "⚡",
    tag: "灵感提醒",
    title: "灵感是拿来用的",
    body: "够做一次发布包就先做出来，完美主义会拖死更新",
    href: "/publish-pack",
    cta: "生成发布包",
  },
  {
    id: "d16",
    emoji: "🎯",
    tag: "周一鸡血",
    title: "新的一周新一条",
    body: "定一个「今天只发一条」的小目标，完成了再想下一条",
    href: "/",
    cta: "回首页",
  },
  {
    id: "d17",
    emoji: "📱",
    tag: "抖音向",
    title: "抖音前 3 秒决定生死",
    body: "先写钩子再写正文，别反过来",
    href: "/emotion-chat",
    cta: "写钩子",
  },
  {
    id: "d18",
    emoji: "📷",
    tag: "小红书向",
    title: "小红书封面字要大",
    body: "标题里留一个情绪词，点击率差不了",
    href: "/publish-pack",
    cta: "做笔记包",
  },
  {
    id: "d19",
    emoji: "🤝",
    tag: "互动梗",
    title: "结尾留个问题",
    body: "「你们今天发了吗」比「点赞关注」自然多了",
    href: "/emotion-chat",
    cta: "改结尾文案",
  },
  {
    id: "d20",
    emoji: "🌈",
    tag: "治愈向",
    title: "不开心也能发",
    body: "治愈不是假开心，真实小事更容易共鸣",
    href: "/hot-topics",
    cta: "找治愈选题",
  },
  {
    id: "d21",
    emoji: "🚀",
    tag: "挑战",
    title: "今天挑战：发出去",
    body: "不要求爆款，要求「发」——发完来复盘区看看",
    href: "/review",
    cta: "去复盘",
  },
  {
    id: "d22",
    emoji: "☕",
    tag: "午后贴",
    title: "下午三点犯困？",
    body: "拍杯咖啡 + 一句吐槽，打工人秒懂",
    href: "/publish-pack",
    cta: "写一条短的",
  },
  {
    id: "d23",
    emoji: "🎉",
    tag: "小庆祝",
    title: "发够 3 条就奖励自己",
    body: "奶茶 / 散步都行，创作是马拉松不是冲刺",
    href: "/profile",
    cta: "看灵感余额",
  },
  {
    id: "d24",
    emoji: "🔔",
    tag: "系统贴",
    title: "这条是每日陪跑短信",
    body: "每天打开铃铛看一眼，有选题 / 订单 / 好玩事",
    href: "/hot-topics",
    cta: "今日热点",
  },
  {
    id: "d25",
    emoji: "🧠",
    tag: "反内卷",
    title: "别和百万粉比",
    body: "和昨天的自己比：今天有没有多一条能发的想法",
    href: "/emotion-chat",
    cta: "聊创作焦虑",
  },
  {
    id: "d26",
    emoji: "📝",
    tag: "脚本向",
    title: "不会拍先会写",
    body: "口播稿写顺了，镜头对着念就不尬",
    href: "/emotion-chat",
    cta: "写口播",
  },
  {
    id: "d27",
    emoji: "🌆",
    tag: "氛围感",
    title: "普通男生也能出片",
    body: "路灯 / 地铁 / 背影，氛围感不靠脸靠构图",
    href: "/hot-topics",
    cta: "找街拍灵感",
  },
  {
    id: "d28",
    emoji: "💡",
    tag: "冷知识",
    title: "热点不等于你要跟",
    body: "挑能拍的、敢聊的，比追顶流话题重要",
    href: "/hot-topics",
    cta: "挑能拍的",
  },
  {
    id: "d29",
    emoji: "🫶",
    tag: "晚安贴",
    title: "今晚可以只想想",
    body: "明天再拍也行，先把选题记进发布包",
    href: "/publish-pack",
    cta: "记选题",
  },
  {
    id: "d30",
    emoji: "🎈",
    tag: "轻松向",
    title: "创作可以好玩",
    body: "当玩游戏：抽选题 → 问 AI → 发一条，通关",
    href: "/topic-box",
    cta: "开玩",
  },
  {
    id: "d31",
    emoji: "📣",
    tag: "月末总结",
    title: "这个月发了几条？",
    body: "去生成记录翻翻，有产出就比零强",
    href: "/history?filter=pack",
    cta: "看记录",
  },
];

function dayIndex(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 86400000;
  return Math.floor(diff / oneDay);
}

export function todayDateKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** 按当天日期稳定取一条每日短信 */
export function getDailyNotifyMessage(d = new Date()): DailyNotifyMessage {
  const idx = dayIndex(d) % POOL.length;
  return POOL[idx]!;
}
