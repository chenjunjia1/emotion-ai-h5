/** AI 情绪聊天 · 常见关系与回复场景 */

export const RELATIONSHIP_VALUES = [
  "暧昧中",
  "热恋期",
  "冷淡期",
  "异地恋",
  "朋友以上",
  "分手恢复期",
  "稳定长期",
] as const;

export const EMOTION_GOAL_VALUES = [
  "增进好感",
  "化解误会",
  "体面邀约",
  "挽回冷淡",
  "建立边界",
  "试探心意",
  "延续话题",
] as const;

export const EMOTION_STYLE_VALUES = [
  "甜宠体贴",
  "理性沟通",
  "幽默化解",
  "高冷克制",
  "俏皮调侃",
] as const;

export type EmotionRelationship = (typeof RELATIONSHIP_VALUES)[number];
export type EmotionGoal = (typeof EMOTION_GOAL_VALUES)[number];
export type EmotionStyle = (typeof EMOTION_STYLE_VALUES)[number];
