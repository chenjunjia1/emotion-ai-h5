import { sortByHeat, type HeatLevel } from "@/lib/content/heat-level";

export const REVIEW_DATA_TIERS = [
  {
    id: "start",
    label: "刚起步",
    emoji: "🌱",
    views: 320,
    likes: 18,
    hint: "别灰心，先稳住更新节奏",
    cheer: "每条爆款都从第一条开始",
  },
  {
    id: "good",
    label: "小爆款",
    emoji: "✨",
    views: 1200,
    likes: 86,
    hint: "互动率不错，可以加码同系列",
    cheer: "已经有小爆款苗头了！",
  },
  {
    id: "great",
    label: "还不错",
    emoji: "🔥",
    views: 5800,
    likes: 420,
    hint: "进入上升期，趁热打铁",
    cheer: "数据在涨，保持这个节奏",
  },
  {
    id: "viral",
    label: "爆了",
    emoji: "🚀",
    views: 32000,
    likes: 2100,
    hint: "复盘钩子与发布时间，准备接下一波",
    cheer: "恭喜！这条值得深度拆解",
  },
] as const;

export type ReviewTitleIdea = {
  title: string;
  heat: HeatLevel;
  suggestTrack?: string;
};

export const REVIEW_TITLE_SEEDS: ReviewTitleIdea[] = [
  { title: "为什么越努力发，数据越差", heat: "爆", suggestTrack: "职场成长" },
  { title: "直播间憋单话术复盘", heat: "爆", suggestTrack: "电商带货" },
  { title: "前3秒钩子合集实测", heat: "爆", suggestTrack: "小红书运营" },
  { title: "打工人周三能量低谷怎么破", heat: "高", suggestTrack: "职场成长" },
  { title: "本地探店人均50宝藏小馆", heat: "高", suggestTrack: "本地生活" },
  { title: "普通人副业起号第一周", heat: "高", suggestTrack: "个人IP" },
  { title: "小红书封面3秒停留法则", heat: "高", suggestTrack: "小红书运营" },
  { title: "职场反PUA一句封神", heat: "高", suggestTrack: "职场成长" },
  { title: "沉浸式收纳治愈解压", heat: "中", suggestTrack: "情感号" },
  { title: "情侣冷战怎么破冰", heat: "中", suggestTrack: "情感号" },
  { title: "宠物换季护理清单", heat: "中", suggestTrack: "宠物博主" },
  { title: "减脂期外卖怎么点", heat: "中", suggestTrack: "本地生活" },
];

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

export function getDailyReviewTitleItems(
  dateKey: string,
  batch = 0,
  take = 8
): ReviewTitleIdea[] {
  const shuffled = shuffleSeeded([...REVIEW_TITLE_SEEDS], `${dateKey}-rev-${batch}`);
  return sortByHeat(shuffled.slice(0, take));
}

/** @deprecated 使用 getDailyReviewTitleItems */
export function getDailyReviewTitleIdeas(dateKey: string, batch = 0, take = 8): string[] {
  return getDailyReviewTitleItems(dateKey, batch, take).map((item) => item.title);
}

export function calcEngagementRate(views: number, likes: number): number {
  if (views <= 0) return 0;
  return Math.round((likes / views) * 1000) / 10;
}

export function engagementFunLabel(rate: number): { emoji: string; text: string } {
  if (rate >= 8) return { emoji: "🔥", text: "互动超猛" };
  if (rate >= 5) return { emoji: "✨", text: "表现不错" };
  if (rate >= 3) return { emoji: "👍", text: "正常水平" };
  if (rate > 0) return { emoji: "🎯", text: "钩子待优化" };
  return { emoji: "📊", text: "先填数据" };
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

export function scoreFunBadge(score: number): string {
  if (score >= 85) return "🏆";
  if (score >= 70) return "⭐";
  if (score >= 55) return "📈";
  return "🌱";
}

export const REVIEW_LOADING_LINES = [
  "正在拆解你的战报…",
  "对比同赛道爆款数据…",
  "诊断问题点…",
  "生成下一条作战建议…",
] as const;

export function getTierById(id: string) {
  return REVIEW_DATA_TIERS.find((t) => t.id === id);
}
