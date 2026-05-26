import type { PlanType, ProductDef } from "../types/v1";

export type MembershipPlan = Exclude<PlanType, "free">;

/** 会员订阅页仅展示三档月卡（不含年卡） */
export const MEMBERSHIP_TIER_PRODUCT_NAMES = [
  "Pro会员 30天",
  "高级会员 30天",
  "工作室版 30天",
] as const;

/** 会员页展示文案：钩子 + 权益 + CTA（与订单 desc 分离） */
export const MEMBERSHIP_MARKETING: Record<
  MembershipPlan,
  { hook: string; perks: string[]; forWho: string; cta: string; dailyHint?: string }
> = {
  pro: {
    hook: "把「今天发什么」交给我们，你只管轻松更新",
    perks: [
      "每日 200 灵感自动补充，节奏更从容",
      "快速文案随心用，高级图文享 9 折",
      "热点与 AI 助手，随时帮你理清思路",
    ],
    forWho: "适合 · 希望稳定更新的个人创作者",
    cta: "¥39 开启 Pro 月卡",
    dailyHint: "约 ¥1.3/天",
  },
  premium: {
    hook: "稳步成长路上，有人帮你看方向、排内容",
    perks: [
      "7 天内容排期，账号方向更清晰",
      "温柔复盘，看懂哪条值得继续发",
      "高级图文更省灵感，周更可以慢慢试",
    ],
    forWho: "适合 · 认真经营账号、想稳步成长的你",
    cta: "¥99 了解高级会员",
  },
  studio: {
    hook: "多账号、多人协作时，灵感与工具都陪着你",
    perks: [
      "每日 500 灵感，多账号也能从容发",
      "发布包 / 热点 / 复盘，团队一起用",
      "按结果扣灵感，创作心里更有底",
    ],
    forWho: "适合 · 多账号团队与代运营伙伴",
    cta: "¥299 开启工作室版",
  },
};

export const MOCK_SMS_CODE = "1234";

export const QUOTA_COST: Record<string, number> = {
  account: 30,
  publish_pack: 30,
  hot_topic_pack: 10,
  daily: 30,
  topic_box: 5,
  account_test: 10,
  viral: 5,
  reply: 5,
  score: 5,
  review: 40,
  emotion_chat: 5,
  publish_regen: 10,
  publish_restyle: 10,
  pack_images_regen: 20,
  premium_cover: 30,
  openai_premium_image: 50,
  moments_regen_one: 5,
};

export const PLAN_QUOTA: Record<string, number> = {
  free: 30,
  pro: 200,
  premium: 120,
  studio: 500,
};

/** 免费用户每日可查看热点条数 */
export const FREE_HOT_TOPIC_VIEW = 5;
/** 免费用户内容库最多保存条数 */
export const FREE_LIBRARY_MAX = 5;
/** 免费用户每日 AI 运营顾问次数 */
export const FREE_OPS_CHAT_DAILY = 3;
/** Pro 用户每日 AI 运营顾问次数 */
export const PRO_OPS_CHAT_DAILY = 50;

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
    quota: 200,
    desc: "Pro会员·日更起号·每日200灵感",
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
    quota: 300,
    membershipDays: 365,
    desc: "Pro年卡·省约17%·每日300灵感",
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
    productName: "灵感加油包 120点",
    amount: 19.9,
    bonusQuota: 120,
    desc: "一次性充值120点奖励灵感，不过期 · 更划算",
  },
];

/** 「我的」页仅展示 3 档，点按钮直接下单 */
export const PROFILE_STORE_PRODUCT_NAMES = [
  "Pro会员 30天",
  "Pro年卡 365天",
  "灵感加油包 50点",
] as const;

export function getProfileStoreProducts(products: ProductDef[]): ProductDef[] {
  return PROFILE_STORE_PRODUCT_NAMES.map((name) =>
    products.find((p) => p.productName === name)
  ).filter((p): p is ProductDef => Boolean(p));
}

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
/** 新用户首次注册赠送灵感 */
export const NEW_USER_WELCOME_BONUS = 100;
/** 每日登录赠送灵感（与会员每日额度叠加逻辑见服务端刷新） */
export const DAILY_LOGIN_BONUS = 30;
/** 邀请人每月最多获得注册奖励的邀请人数（超出仍注册成功，但不发奖励） */
export const INVITE_MONTHLY_CAP = 30;
