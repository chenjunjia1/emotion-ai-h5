import type { I18nKey } from "./index";

export const PLATFORM_VALUES = [
  "抖音",
  "小红书",
  "视频号",
  "快手",
  "B站",
  "微博",
  "今日头条",
  "Instagram",
] as const;
const PLATFORM_KEYS: Record<(typeof PLATFORM_VALUES)[number], I18nKey> = {
  抖音: "platformDouyin",
  小红书: "platformXhs",
  视频号: "platformChannels",
  快手: "platformKuaishou",
  B站: "platformBilibili",
  微博: "platformWeibo",
  今日头条: "platformToutiao",
  Instagram: "platformInstagram",
};

export const TRACK_VALUES = [
  "婚恋情感",
  "宠物博主",
  "电商带货",
  "职场成长",
  "本地生活",
  "小红书运营",
  "个人IP",
  "个人Vlog",
] as const;

const TRACK_KEYS: Record<(typeof TRACK_VALUES)[number], I18nKey> = {
  婚恋情感: "trackLove",
  宠物博主: "trackPet",
  电商带货: "trackEcom",
  职场成长: "trackCareer",
  本地生活: "trackLocal",
  小红书运营: "trackXhs",
  个人IP: "trackIp",
  个人Vlog: "trackVlog",
};

export const GOAL_VALUES = ["涨粉", "引流", "带货", "打造IP", "私域转化", "品牌曝光"] as const;
const GOAL_KEYS: Record<(typeof GOAL_VALUES)[number], I18nKey> = {
  涨粉: "goalFans",
  引流: "goalTraffic",
  带货: "goalSales",
  打造IP: "goalIp",
  私域转化: "goalPrivate",
  品牌曝光: "goalBrand",
};

export const STYLE_VALUES = [
  "温柔走心",
  "情绪共鸣",
  "干货实用",
  "搞笑轻松",
  "治愈陪伴",
  "带货转化",
] as const;

const STYLE_KEYS: Record<(typeof STYLE_VALUES)[number], I18nKey> = {
  温柔走心: "styleGentle",
  情绪共鸣: "styleEmotion",
  干货实用: "stylePractical",
  搞笑轻松: "styleFunny",
  治愈陪伴: "styleHeal",
  带货转化: "styleConvert",
};

export type TrFn = (key: I18nKey) => string;

export function labeledPlatforms(tr: TrFn) {
  return PLATFORM_VALUES.map((value) => ({
    value,
    label: tr(PLATFORM_KEYS[value]),
  }));
}

export function labeledTracks(tr: TrFn) {
  return TRACK_VALUES.map((value) => ({
    value,
    label: tr(TRACK_KEYS[value]),
  }));
}

export function labeledGoals(tr: TrFn) {
  return GOAL_VALUES.map((value) => ({
    value,
    label: tr(GOAL_KEYS[value]),
  }));
}

export function labeledStyles(tr: TrFn) {
  return STYLE_VALUES.map((value) => ({
    value,
    label: tr(STYLE_KEYS[value]),
  }));
}

export function riskLevelLabel(tr: TrFn, level: string): string {
  if (level === "高") return tr("riskLevelHigh");
  if (level === "中") return tr("riskLevelMid");
  if (level === "低") return tr("riskLevelLow");
  return level;
}

/** hot-plays id → i18n keys */
export const HOT_PLAY_I18N: Record<
  string,
  { title: I18nKey; sub: I18nKey; hint: I18nKey }
> = {
  love: { title: "hotPlayLoveTitle", sub: "hotPlayLoveSub", hint: "hotPlayLoveHint" },
  pet: { title: "hotPlayPetTitle", sub: "hotPlayPetSub", hint: "hotPlayPetHint" },
  ecom: { title: "hotPlayEcomTitle", sub: "hotPlayEcomSub", hint: "hotPlayEcomHint" },
  xhs: { title: "hotPlayXhsTitle", sub: "hotPlayXhsSub", hint: "hotPlayXhsHint" },
  career: {
    title: "hotPlayCareerTitle",
    sub: "hotPlayCareerSub",
    hint: "hotPlayCareerHint",
  },
  local: {
    title: "hotPlayLocalTitle",
    sub: "hotPlayLocalSub",
    hint: "hotPlayLocalHint",
  },
  ip: { title: "hotPlayIpTitle", sub: "hotPlayIpSub", hint: "hotPlayIpHint" },
};
