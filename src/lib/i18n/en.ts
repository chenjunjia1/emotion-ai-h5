import { zh } from "./zh";

/** English copy: fallback to zh where not translated yet */
export const en: Record<keyof typeof zh, string> = {
  ...zh,
  appName: "AI短视频运营灵感",
  appTagline: "Topics · Publish pack · Easy growth",
  homeTitle: "Stuck on short video? AI generates ready-to-post content daily",
  homeSubtitle:
    "For Xiaohongshu, Douyin & Channels. Draw topics, titles, scripts, notes & replies — like a fun blind box.",
  homeCta: "Draw today's topic 🎲",
  navHome: "Home",
  navHotTopics: "Hot",
  navCreate: "Create",
  navReview: "Review",
  navLibrary: "Library",
  navProfile: "Me",
  featTopicBox: "Topic blind box",
  featPublishPack: "1-min publish pack",
  featTitleGacha: "Title gacha",
  featAccountTest: "Account fit quiz",
  pricing: "Membership",
  history: "My library",
  quotaInsufficient: "Quota low — upgrade or invite friends",
  quotaModalTitle: "Out of quota today",
  quotaUpgrade: "Upgrade membership",
  quotaInvite: "Invite friends for bonus quota",
};
