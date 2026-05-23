import type { PlanType, ProductDef } from "../types/v1";

export type MembershipPlan = Exclude<PlanType, "free">;

/** 会员页展示文案：卖点 + 权益（与订单 desc 分离，避免功能罗列感） */
export const MEMBERSHIP_MARKETING: Record<
  MembershipPlan,
  { tagline: string; perks: string[]; forWho: string }
> = {
  pro: {
    tagline: "天天发得出去，再也不被 3 灵感卡住",
    perks: [
      "每天约 8 条完整发布包（选题+标题+脚本+封面文案）",
      "爆品包、情绪私信助攻、发完复盘 — 创作全流程开通",
      "生成失败不扣灵感，只为真正能发的内容付费",
    ],
    forWho: "适合：想日更起号的个人创作者",
  },
  premium: {
    tagline: "不只帮你发，还帮你想清楚下一步",
    perks: [
      "灵感约为 Pro 3 倍，连续周更、多平台试错都够用",
      "专属账号方案 + 7 天内容排期，少踩坑、少空转",
      "深度复盘看懂数据，下一轮选题更准",
    ],
    forWho: "适合：认真做号、要稳定增长的内容主",
  },
  studio: {
    tagline: "多号高频也不慌，团队按量创作",
    perks: [
      "每日 500 灵感，支撑多账号日更 + 大批量试稿",
      "发布包、爆品、复盘不受个人档节奏限制",
      "代运营 / 工作室效率拉满，灵感按结果扣",
    ],
    forWho: "适合：MCN、代运营、同时带多个号",
  },
};

export const MOCK_SMS_CODE = "1234";

export const QUOTA_COST: Record<string, number> = {
  account: 5,
  publish_pack: 5,
  hot_topic_pack: 3,
  daily: 5,
  topic_box: 1,
  account_test: 3,
  viral: 3,
  reply: 1,
  score: 1,
  review: 2,
  emotion_chat: 2,
};

export const PLAN_QUOTA: Record<string, number> = {
  free: 3,
  pro: 40,
  premium: 120,
  studio: 500,
};

/** @deprecated V1 已移除视频币，保留类型兼容 */
export const VIDEO_COIN_COST = {
  avatar30: 0,
  avatar60: 0,
  auto30: 0,
  auto60: 0,
} as const;

export const PRODUCTS: ProductDef[] = [
  {
    productType: "membership",
    productName: "Pro会员 30天",
    amount: 39,
    plan: "pro",
    quota: 40,
    desc: "Pro会员·日更起号·每日40灵感",
  },
  {
    productType: "membership",
    productName: "高级会员 30天",
    amount: 99,
    plan: "premium",
    quota: 120,
    desc: "高级会员·账号方案与7天排期·每日120灵感",
  },
  {
    productType: "membership",
    productName: "工作室版 30天",
    amount: 299,
    plan: "studio",
    quota: 500,
    desc: "工作室版·多账号高频创作·每日500灵感",
  },
  {
    productType: "membership",
    productName: "Pro年卡 365天",
    amount: 299,
    plan: "pro",
    quota: 40,
    membershipDays: 365,
    desc: "Pro年卡·省约17%·每日40灵感",
  },
  {
    productType: "quota_pack",
    productName: "灵感加油包 50点",
    amount: 9.9,
    bonusQuota: 50,
    desc: "一次性充值50点奖励灵感，不过期",
  },
  {
    productType: "quota_pack",
    productName: "灵感加油包 200点",
    amount: 29,
    bonusQuota: 200,
    desc: "一次性充值200点奖励灵感，不过期",
  },
];

export const STORAGE_USER = "sv-v1-user";
export const STORAGE_HISTORIES = "sv-v1-histories";
export const STORAGE_ORDERS = "sv-v1-orders";
export const STORAGE_TASKS = "sv-v1-tasks";
export const STORAGE_LANG = "sv-v1-lang";
export const STORAGE_LOGS = "sv-v1-flow-logs";
export const STORAGE_FEEDBACKS = "sv-v1-feedbacks";
export const STORAGE_GROWTH = "sv-v1-growth";
export const STORAGE_DAILY_USAGE = "sv-v1-daily-usage";
export const STORAGE_INVITE_PENDING = "sv-invite-pending";
export const STORAGE_INVITE_REGISTRY = "sv-invite-registry";
export const STORAGE_INVITE_RECORDS = "sv-invite-records";
export const STORAGE_REGISTERED_MOBILES = "sv-invite-registered-mobiles";
export const STORAGE_HOT_TOPICS = "sv-v1-hot-topics";
export const STORAGE_DAILY_INSPIRATION = "sv-v1-daily-inspiration";
export const STORAGE_FAVORITES = "sv-v1-favorites";
export const STORAGE_AI_PROFILE = "sv-v1-ai-profile";

export const INVITE_REGISTER_REWARD = 10;
export const INVITE_MEMBER_REWARD = 30;
/** 邀请人每月最多获得注册奖励的邀请人数（超出仍注册成功，但不发奖励） */
export const INVITE_MONTHLY_CAP = 30;
