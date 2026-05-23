export const REVIEW_DATA_TIERS = [
  {
    id: "start",
    label: "刚起步",
    emoji: "🌱",
    views: 320,
    likes: 18,
    hint: "别灰心，先稳住更新节奏",
  },
  {
    id: "good",
    label: "小爆款",
    emoji: "✨",
    views: 1200,
    likes: 86,
    hint: "互动率不错，可以加码同系列",
  },
  {
    id: "great",
    label: "还不错",
    emoji: "🔥",
    views: 5800,
    likes: 420,
    hint: "进入上升期，趁热打铁",
  },
  {
    id: "viral",
    label: "爆了",
    emoji: "🚀",
    views: 32000,
    likes: 2100,
    hint: "复盘钩子与发布时间，准备接下一波",
  },
] as const;

export const REVIEW_TITLE_POOL = [
  "打工人周三能量低谷怎么破",
  "为什么越努力发，数据越差",
  "本地探店人均50宝藏小馆",
  "前3秒钩子合集实测",
  "普通人副业起号第一周",
  "沉浸式收纳治愈解压",
  "情侣冷战怎么破冰",
  "直播间憋单话术复盘",
  "小红书封面3秒停留法则",
  "宠物换季护理清单",
  "职场反PUA一句封神",
  "减脂期外卖怎么点",
] as const;

function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function shuffleSeeded<T>(arr: T[], seedKey: string): T[] {
  const out = [...arr];
  let seed = hashSeed(seedKey);
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function getDailyReviewTitleIdeas(dateKey: string, batch = 0, take = 8): string[] {
  return shuffleSeeded([...REVIEW_TITLE_POOL], `${dateKey}-rev-${batch}`).slice(0, take);
}

export function calcEngagementRate(views: number, likes: number): number {
  if (views <= 0) return 0;
  return Math.round((likes / views) * 1000) / 10;
}

export function scoreFromMetrics(views: number, likes: number): number {
  const er = views > 0 ? likes / views : 0;
  const viewScore = Math.min(45, Math.log10(Math.max(views, 10)) * 12);
  const erScore = Math.min(55, er * 1200);
  return Math.min(99, Math.max(35, Math.round(viewScore + erScore)));
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "爆款潜质";
  if (score >= 70) return "表现稳健";
  if (score >= 55) return "有进步空间";
  return "继续蓄力";
}
