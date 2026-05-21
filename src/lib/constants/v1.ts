import type { ProductDef } from "../types/v1";

export const MOCK_SMS_CODE = "1234";

export const QUOTA_COST: Record<string, number> = {
  account: 5,
  daily: 3,
  viral: 3,
};

export const PLAN_QUOTA: Record<string, number> = {
  free: 3,
  pro: 40,
  premium: 120,
  studio: 500,
};

export const VIDEO_COIN_COST = {
  avatar30: 25,
  avatar60: 50,
  auto30: 59,
  auto60: 118,
} as const;

export const PRODUCTS: ProductDef[] = [
  {
    productType: "membership",
    productName: "Pro会员 30天",
    amount: 39,
    plan: "pro",
    quota: 40,
    desc: "每天40次文案额度，完整今日视频，爆款同款",
  },
  {
    productType: "membership",
    productName: "高级会员 30天",
    amount: 99,
    plan: "premium",
    quota: 120,
    coin: 20,
    desc: "完整账号方案、30天运营方案，每月赠20视频币",
  },
  {
    productType: "membership",
    productName: "工作室版 30天",
    amount: 299,
    plan: "studio",
    quota: 500,
    coin: 80,
    desc: "每天500次额度，批量生成，送80视频币",
  },
  {
    productType: "video_coin",
    productName: "100视频币",
    amount: 99,
    coin: 100,
    desc: "适合体验数字人和轻量成片",
  },
  {
    productType: "video_coin",
    productName: "300视频币",
    amount: 279,
    coin: 300,
    desc: "适合持续生成成片",
  },
  {
    productType: "video_coin",
    productName: "1000视频币",
    amount: 899,
    coin: 1000,
    desc: "适合工作室批量使用",
  },
];

export const STORAGE_USER = "sv-v1-user";
export const STORAGE_HISTORIES = "sv-v1-histories";
export const STORAGE_ORDERS = "sv-v1-orders";
export const STORAGE_TASKS = "sv-v1-tasks";
export const STORAGE_LANG = "sv-v1-lang";
export const STORAGE_LOGS = "sv-v1-flow-logs";
export const STORAGE_FEEDBACKS = "sv-v1-feedbacks";
