export interface HotPlayItem {
  id: string;
  title: string;
  sub: string;
  hint: string;
  track: string;
  icon: string;
  grad: string;
  defaultTopic: string;
  accountHref: string;
  createHref: string;
}

function hrefAccount(track: string) {
  return `/account-package?track=${encodeURIComponent(track)}`;
}

function hrefCreate(track: string, topic: string) {
  return `/create?tab=daily&track=${encodeURIComponent(track)}&topic=${encodeURIComponent(topic)}`;
}

export const HOT_PLAYS: HotPlayItem[] = [
  {
    id: "love",
    title: "婚恋情感号",
    sub: "温柔口播",
    hint: "情绪共鸣、关系成长、私信引流",
    track: "婚恋情感",
    icon: "Heart",
    grad: "from-orange-50 to-rose-100",
    defaultTopic: "为什么现在的人越来越难心动？",
    accountHref: hrefAccount("婚恋情感"),
    createHref: hrefCreate("婚恋情感", "为什么现在的人越来越难心动？"),
  },
  {
    id: "pet",
    title: "宠物博主",
    sub: "治愈日常",
    hint: "萌宠日常、喂养干货、治愈陪伴",
    track: "宠物博主",
    icon: "Camera",
    grad: "from-rose-50 to-orange-100",
    defaultTopic: "新手养猫第一周要注意什么？",
    accountHref: hrefAccount("宠物博主"),
    createHref: hrefCreate("宠物博主", "新手养猫第一周要注意什么？"),
  },
  {
    id: "ecom",
    title: "电商带货",
    sub: "种草脚本",
    hint: "产品测评、使用场景、下单引导",
    track: "电商带货",
    icon: "ShoppingBag",
    grad: "from-orange-50 to-amber-50",
    defaultTopic: "这款好物为什么值得买？",
    accountHref: hrefAccount("电商带货"),
    createHref: hrefCreate("电商带货", "这款好物为什么值得买？"),
  },
  {
    id: "xhs",
    title: "小红书运营",
    sub: "图文笔记",
    hint: "封面标题、笔记结构、评论区互动",
    track: "小红书运营",
    icon: "MessageCircle",
    grad: "from-rose-50 to-pink-100",
    defaultTopic: "小红书笔记怎么写更容易涨粉？",
    accountHref: hrefAccount("小红书运营"),
    createHref: hrefCreate("小红书运营", "小红书笔记怎么写更容易涨粉？"),
  },
  {
    id: "career",
    title: "职场成长",
    sub: "干货口播",
    hint: "职场技能、沟通方法、成长复盘",
    track: "职场成长",
    icon: "Briefcase",
    grad: "from-orange-50 to-rose-50",
    defaultTopic: "职场新人如何快速融入团队？",
    accountHref: hrefAccount("职场成长"),
    createHref: hrefCreate("职场成长", "职场新人如何快速融入团队？"),
  },
  {
    id: "local",
    title: "本地生活",
    sub: "探店引流",
    hint: "门店探店、团购优惠、到店转化",
    track: "本地生活",
    icon: "MapPin",
    grad: "from-amber-50 to-orange-100",
    defaultTopic: "这家宝藏小店为什么值得去？",
    accountHref: hrefAccount("本地生活"),
    createHref: hrefCreate("本地生活", "这家宝藏小店为什么值得去？"),
  },
  {
    id: "ip",
    title: "个人IP",
    sub: "人设故事",
    hint: "个人经历、专业背书、信任建立",
    track: "个人IP",
    icon: "UserCircle",
    grad: "from-rose-50 to-purple-50",
    defaultTopic: "普通人如何从0打造个人IP？",
    accountHref: hrefAccount("个人IP"),
    createHref: hrefCreate("个人IP", "普通人如何从0打造个人IP？"),
  },
];

/** 首页横向卡片只展示前 4 个 */
export const HOT_PLAYS_HOME = HOT_PLAYS.slice(0, 4);
