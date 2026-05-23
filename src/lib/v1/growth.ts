export interface GrowthLevel {
  id: string;
  name: string;
  minXp: number;
  maxXp: number;
  dailyBonusQuota: number;
  perk: string;
}

export const GROWTH_LEVELS: GrowthLevel[] = [
  {
    id: "newbie",
    name: "新手运营官",
    minXp: 0,
    maxXp: 99,
    dailyBonusQuota: 0,
    perk: "基础功能体验",
  },
  {
    id: "trainee",
    name: "内容练习生",
    minXp: 100,
    maxXp: 299,
    dailyBonusQuota: 1,
    perk: "每日额外+1灵感",
  },
  {
    id: "stable",
    name: "稳定输出者",
    minXp: 300,
    maxXp: 699,
    dailyBonusQuota: 2,
    perk: "每日额外+2灵感",
  },
  {
    id: "observer",
    name: "爆款观察员",
    minXp: 700,
    maxXp: 1499,
    dailyBonusQuota: 3,
    perk: "每日额外+3灵感",
  },
  {
    id: "operator",
    name: "账号操盘手",
    minXp: 1500,
    maxXp: 999999,
    dailyBonusQuota: 5,
    perk: "每日额外+5灵感",
  },
];

export const XP_REWARDS = {
  account: 20,
  publish_pack: 10,
  xhs_note: 10,
  reply: 5,
  daily_tasks: 20,
  review: 15,
  invite: 10,
  weekly_report: 5,
  topic_box: 3,
  title_gacha: 3,
} as const;

export function getLevelByXp(xp: number): GrowthLevel {
  return (
    [...GROWTH_LEVELS].reverse().find((l) => xp >= l.minXp) ?? GROWTH_LEVELS[0]
  );
}

export function xpProgress(xp: number): { current: number; next: number; pct: number } {
  const level = getLevelByXp(xp);
  const span = level.maxXp - level.minXp + 1;
  const inLevel = Math.min(span, Math.max(0, xp - level.minXp));
  return {
    current: inLevel,
    next: span,
    pct: Math.min(100, Math.round((inLevel / span) * 100)),
  };
}

export function getNextLevel(xp: number): GrowthLevel | null {
  const current = getLevelByXp(xp);
  const idx = GROWTH_LEVELS.findIndex((l) => l.id === current.id);
  if (idx < 0 || idx >= GROWTH_LEVELS.length - 1) return null;
  return GROWTH_LEVELS[idx + 1];
}

export type ProfileLevelHintStage = { name: string; current: boolean };

/** 个人页「陪跑等级」弹窗文案（阶段横排展示） */
export function getProfileLevelHintContent(xp: number): {
  intro: string;
  status: string;
  footer: string;
  stages: ProfileLevelHintStage[];
} {
  const current = getLevelByXp(xp);
  const next = getNextLevel(xp);
  const remain = next ? Math.max(0, next.minXp - xp) : 0;

  const status = next
    ? `当前「${current.name}」→ 下一级「${next.name}」还差 ${remain} 成长值`
    : `当前「${current.name}」，已是最高等级`;

  return {
    intro: "按成长值升级，显示在昵称旁。",
    status,
    footer: "多做发布包、复盘、每日任务可更快升级。",
    stages: GROWTH_LEVELS.map((level) => ({
      name: level.name,
      current: level.id === current.id,
    })),
  };
}

/** @deprecated 使用 getProfileLevelHintContent + HintTip stages */
export function buildProfileLevelHintBody(xp: number): string {
  const { intro, status, footer, stages } = getProfileLevelHintContent(xp);
  return [intro, status, `共 ${stages.length} 个阶段`, footer].join("\n");
}
