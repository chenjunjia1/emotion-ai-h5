/** 注册后选题方向（与产品赛道映射） */

export const ONBOARDING_TRACKS = [

  { id: "love", label: "情感", emoji: "💗", track: "婚恋情感" },

  { id: "outfit", label: "穿搭", emoji: "👗", track: "个人IP" },

  { id: "food", label: "美食", emoji: "🍱", track: "本地生活" },

  { id: "work", label: "职场", emoji: "💼", track: "职场成长" },

  { id: "vlog", label: "生活vlog", emoji: "📅", track: "个人Vlog" },

  { id: "pet", label: "萌宠", emoji: "🐾", track: "宠物博主" },

  { id: "beauty", label: "美妆", emoji: "💄", track: "小红书运营" },

  { id: "store", label: "探店", emoji: "🛍️", track: "本地生活" },

  { id: "side", label: "副业", emoji: "👍", track: "电商带货" },

  { id: "other", label: "其他", emoji: "🙂", track: "个人IP" },

] as const;



export type OnboardingTrackId = (typeof ONBOARDING_TRACKS)[number]["id"];



/** AI 搭子形象（onboarding 选择 + 个人中心展示） */

export const AI_PARTNER_AVATARS = [

  {

    id: "pink-girl",

    name: "粉色女生",

    defaultName: "小桃",

    role: "灵感陪伴型",

    desc: "适合情感、美妆、生活类内容",

    image: "/avatars/pink-girl.png",

    imagePng: "/avatars/pink-girl.png",

    previewEmoji: "👩",

    activeColor: "ring-pink-500",

  },

  {

    id: "black-hair-boy",

    name: "黑发男生",

    defaultName: "阿辰",

    role: "运营军师型",

    desc: "适合数据分析、选题规划、爆款拆解",

    image: "/avatars/black-hair-boy.png",

    imagePng: "/avatars/black-hair-boy.png",

    previewEmoji: "👨",

    activeColor: "ring-blue-500",

  },

  {

    id: "hat-girl",

    name: "帽子女生",

    defaultName: "小栗",

    role: "温柔鼓励型",

    desc: "适合小红书、Vlog、穿搭种草",

    image: "/avatars/hat-girl.png",

    imagePng: "/avatars/hat-girl.png",

    previewEmoji: "👩",

    activeColor: "ring-orange-500",

  },

  {

    id: "cap-boy",

    name: "帽子男生",

    defaultName: "小宇",

    role: "创作搭子型",

    desc: "适合短视频、口播、标题优化",

    image: "/avatars/cap-boy.png",

    imagePng: "/avatars/cap-boy.png",

    previewEmoji: "👨",

    activeColor: "ring-sky-500",

  },

] as const;



export type AiAvatarId = (typeof AI_PARTNER_AVATARS)[number]["id"];



export const DEFAULT_AVATAR_ID: AiAvatarId = "pink-girl";



/** 旧版形象 id 兼容 */

export const LEGACY_AVATAR_IDS: Record<string, AiAvatarId> = {

  orange: "pink-girl",

  peach: "black-hair-boy",

  berry: "hat-girl",

  momo: "cap-boy",

  pink: "pink-girl",

  navy: "black-hair-boy",

  hat: "hat-girl",

  cap: "cap-boy",

  "cool-boy": "black-hair-boy",

  "cream-girl": "hat-girl",

};



export function normalizeAvatarId(id: string): AiAvatarId {

  if (AI_PARTNER_AVATARS.some((a) => a.id === id)) return id as AiAvatarId;

  return LEGACY_AVATAR_IDS[id] ?? DEFAULT_AVATAR_ID;

}



export function getPartnerAvatar(id: AiAvatarId) {

  return AI_PARTNER_AVATARS.find((a) => a.id === id) ?? AI_PARTNER_AVATARS[0];

}


