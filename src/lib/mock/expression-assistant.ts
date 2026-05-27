/** AI灵感 — 前端 Mock 数据（接口预留后替换） */

export type InspirationChannel = "moments" | "xhs" | "video" | "wechat_status";

export type HomeFeatureId =
  | "hot"
  | "moments"
  | "video"
  | "chat"
  | "treehole"
  | "assistant";

export const HOME_SUBTITLE = "朋友圈 · 小红书图文 · AI 配图 · 高情商聊天";
export const HOME_HERO_SUB = "AI帮你说得刚刚好～";

export const HOME_HERO_TITLE = "今天想表达什么？";

export const HOME_INPUT_PLACEHOLDER = "说出你的想法，AI帮你表达得更自然～";

export const HOME_FEATURE_CARDS: {
  id: HomeFeatureId;
  title: string;
  desc: string;
  features: string[];
  cta: string;
  href: string;
  gradient: string;
  emoji: string;
  badge?: string;
  cardBg?: string;
  /** 卡片内展示的能力标签（2～3 个） */
  pills?: string[];
  /** 首页 Bento Featured 大卡 */
  featured?: boolean;
  stat?: string;
}[] = [
  {
    id: "hot",
    title: "今日热点",
    desc: "追热点 找选题",
    badge: "30W+人正在追",
    featured: true,
    stat: "每日 8 点更新",
    cardBg: "from-[#FFF0F5] to-[#FFE8F0]",
    pills: ["抖音", "小红书", "朋友圈", "视频号"],
    features: ["抖音热点", "小红书热点", "视频号热点", "朋友圈热点", "今日适合发什么"],
    cta: "去看看",
    href: "/hot-topics",
    gradient: "from-[#FF6B6B] to-[#FF8A7A]",
    emoji: "🔥",
  },
  {
    id: "moments",
    title: "AI发圈",
    desc: "图片配文 朋友圈文案",
    cardBg: "from-[#FFF8F0] to-[#FFF0E8]",
    features: ["上传图片配文", "朋友圈文案", "微信状态", "小红书标题", "评论区回复", "氛围感评分"],
    cta: "去创作",
    href: "/expression/moments",
    pills: ["图片配文", "氛围感"],
    gradient: "from-[#FF9A6B] to-[#FFAB40]",
    emoji: "📸",
  },
  {
    id: "video",
    title: "短视频灵感",
    desc: "选题 · 脚本 · 发布包",
    cardBg: "from-[#FFF5F8] to-[#FFE8F0]",
    features: ["标题生成", "口播脚本", "分镜脚本", "封面文案", "发布文案", "复盘建议"],
    cta: "去生成",
    href: "/publish-pack",
    pills: ["脚本", "发布包"],
    gradient: "from-[#FF7AAE] to-[#FF9EC4]",
    emoji: "🎬",
  },
  {
    id: "chat",
    title: "聊天军师",
    desc: "高情商回复 · 不尴尬续聊",
    cardBg: "from-[#FFF5F8] to-[#FFE8F0]",
    features: ["粘贴聊天记录", "上传聊天截图", "分析对方态度", "高情商回复", "暧昧回复", "客户回复"],
    cta: "去咨询",
    href: "/emotion-chat?mode=strategist",
    pills: ["高情商", "OCR"],
    gradient: "from-[#FF7AAE] to-[#FF9EC4]",
    emoji: "💬",
  },
  {
    id: "treehole",
    title: "情绪树洞",
    desc: "陪聊搭子 · 帮你回 · 情绪文案",
    cardBg: "from-[#F5FAFF] to-[#EEF6FF]",
    features: ["情绪陪伴", "今日情绪签", "深夜文案", "朋友圈文案", "小行动建议"],
    cta: "去聊聊",
    href: "/emotion-chat",
    pills: ["陪聊", "情绪签"],
    gradient: "from-[#7EC8E3] to-[#A8D8EA]",
    emoji: "🌙",
  },
  {
    id: "assistant",
    title: "AI助手",
    desc: "运营建议 · 文案优化",
    cardBg: "from-[#FFFBEB] to-[#FFF8E6]",
    features: ["账号定位", "内容建议", "私域话术", "爆款复盘", "文案优化"],
    cta: "去问问",
    href: "/emotion-chat?mode=assistant",
    pills: ["复盘", "优化"],
    gradient: "from-[#FFC46B] to-[#FFB347]",
    emoji: "🤖",
  },
];

export const HOME_LIVE_TICKERS = [
  "刚刚 · 王姐 发了条早安正能量朋友圈",
  "1 分钟前 · 老李 用聊天军师回了暖心感谢",
  "2 分钟前 · 有人生成了小红书爆款标题",
  "4 分钟前 · 阿敏 写了节日暖心祝福语",
];

export const HOME_ROTATING_PLACEHOLDERS = [
  "帮我写一条温暖又有感染力的朋友圈…",
  "探店很满意，帮我想小红书标题和正文",
  "想感谢同事帮忙，怎么说得体又好听？",
  "给很久没联系的朋友发一句暖心问候",
];

export const HOME_INSPIRATION_TABS: { id: InspirationChannel; label: string }[] = [
  { id: "moments", label: "朋友圈" },
  { id: "xhs", label: "小红书" },
  { id: "video", label: "短视频" },
  { id: "wechat_status", label: "微信状态" },
];

export const HOME_INSPIRATION_PICKS: {
  id: string;
  channel: InspirationChannel;
  title: string;
  cover: string;
  heat: string;
  tags: string[];
}[] = [
  {
    id: "p1",
    channel: "moments",
    title: "下班后的松弛感朋友圈",
    cover: "/images/covers/lifestyle-1.jpg",
    heat: "1.8w",
    tags: ["打工人", "治愈"],
  },
  {
    id: "p2",
    channel: "xhs",
    title: "一张自拍怎么配得高级？",
    cover: "/images/topics/food-1.jpg",
    heat: "2.3w",
    tags: ["自拍", "高级感"],
  },
  {
    id: "p3",
    channel: "video",
    title: "周末citywalk怎么拍？",
    cover: "/images/covers/family-1.jpg",
    heat: "1.6w",
    tags: ["Vlog", "出片"],
  },
  {
    id: "p4",
    channel: "wechat_status",
    title: "今天适合换什么状态？",
    cover: "/images/hot/healing.svg",
    heat: "0.9w",
    tags: ["状态", "情绪"],
  },
  {
    id: "p5",
    channel: "moments",
    title: "自拍不露脸也能高级的朋友圈文案",
    cover: "/images/hot/fashion.svg",
    heat: "1.2w",
    tags: ["自拍", "高级感"],
  },
];

export const INSPIRATION_PLATFORM_TABS = [
  { id: "all", label: "推荐" },
  { id: "douyin", label: "抖音" },
  { id: "xhs", label: "小红书" },
  { id: "moments", label: "朋友圈" },
  { id: "wechat_status", label: "微信状态" },
  { id: "video", label: "短视频" },
] as const;

export const INSPIRATION_HOT_RANK = [
  { rank: 1, title: "打工人下班后的松弛感", heat: "98.2w", platform: "抖音" },
  { rank: 2, title: "周末 citywalk 文案怎么写", heat: "76.5w", platform: "小红书" },
  { rank: 3, title: "普通生活怎么发出高级感", heat: "54.1w", platform: "朋友圈" },
  { rank: 4, title: "微信已读不回怎么破冰", heat: "41.8w", platform: "聊天" },
  { rank: 5, title: "秋冬氛围感自拍配文", heat: "38.2w", platform: "小红书" },
];

export const INSPIRATION_TOPIC_LIST = [
  { id: "t1", title: "打工人下班后的松弛感", desc: "治愈系日常 · 适合朋友圈+短视频", heat: "热" },
  { id: "t2", title: "周末 citywalk 文案怎么写", desc: "小红书标题+笔记结构", heat: "爆" },
  { id: "t3", title: "普通生活怎么发出高级感", desc: "低饱和氛围 · 九宫格配文", heat: "高" },
  { id: "t4", title: "朋友圈自拍怎么配文", desc: "不露脸也好看的三套文案", heat: "新" },
];

export const INSPIRATION_TEMPLATES = [
  { id: "tm1", title: "朋友圈合集", sub: "7天不发愁", color: "from-[#FFB8D9] to-[#FF9EC4]" },
  { id: "tm2", title: "小红书标题模板", sub: "点击率+互动", color: "from-[#FFC46B] to-[#FF9A6B]" },
  { id: "tm3", title: "短视频脚本模板", sub: "钩子+分镜", color: "from-[#A78BFA] to-[#C4B5FD]" },
  { id: "tm4", title: "微信状态文案", sub: "简短有质感", color: "from-[#7DD3FC] to-[#93C5FD]" },
];

export type CreateHubEntry = {
  id: string;
  title: string;
  desc: string;
  href: string;
  gradient: string;
  emoji: string;
  cta?: string;
  /** 创作页置顶大卡（付费/好玩向） */
  featured?: boolean;
  badge?: string;
  /** 角标配色：hot 爆款 / new 上新 / skill 能力 / sell 变现 */
  badgeTone?: "hot" | "new" | "skill" | "sell";
  /** 卡片底部吸引标签 */
  tags?: string[];
  tagline?: string;
};

export const CREATE_HUB_FEATURED_ID = "pack" as const;

export const CREATE_HUB_ENTRIES: CreateHubEntry[] = [
  {
    id: "image",
    title: "上传图片配文",
    desc: "上传照片，生成朋友圈/小红书文案",
    href: "/expression/image-caption",
    gradient: "from-[#FF9A6B] to-[#FF6B6B]",
    emoji: "🖼️",
    badge: "识图即发",
    badgeTone: "hot",
    tags: ["相册直出", "多平台可发"],
  },
  {
    id: "moments",
    title: "写朋友圈",
    desc: "输入心情，生成自然高级朋友圈",
    href: "/expression/moments",
    gradient: "from-[#FF7AAE] to-[#FF9EC4]",
    emoji: "✍️",
    badge: "日更必备",
    badgeTone: "skill",
    tags: ["不尬不油", "秒出多版"],
  },
  {
    id: CREATE_HUB_FEATURED_ID,
    title: "高级图文包",
    desc: "AI 生活感配图 + 标题正文，小红书 / 朋友圈一键发",
    href: "/publish-pack?mode=advanced&imageCount=4",
    gradient: "from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D]",
    emoji: "🎨",
    featured: true,
    badge: "好玩 · 付费",
    tagline: "挑个画面风格 · 不用写提示词也能出片",
  },
  {
    id: "chat",
    title: "分析聊天记录",
    desc: "粘贴聊天内容，生成高情商回复",
    href: "/emotion-chat?mode=strategist",
    gradient: "from-[#FF7AAE] to-[#FF9EC4]",
    emoji: "💬",
    badge: "高情商",
    badgeTone: "hot",
    tags: ["告别尬聊", "10种语气"],
  },
  {
    id: "diagnosis",
    title: "账号诊断",
    desc: "输入定位，得方向、选题、7天计划与变现建议",
    href: "/expression/account-diagnosis",
    gradient: "from-[#F59E0B] via-[#F97316] to-[#FF4F8B]",
    emoji: "📊",
    badge: "省钱 · 新",
    badgeTone: "new",
    tags: ["7天计划", "变现建议"],
  },
  {
    id: "commerce",
    title: "带货素材包",
    desc: "输入商品，生成卖点、脚本、小红书笔记、直播话术",
    href: "/expression/commerce-pack",
    gradient: "from-[#EF4444] via-[#FF6B6B] to-[#FF9A4D]",
    emoji: "🛒",
    badge: "能带货",
    badgeTone: "sell",
    tags: ["卖点脚本", "直播话术"],
  },
  {
    id: "treehole",
    title: "情绪树洞",
    desc: "深夜陪聊 · 不想发圈的话说这",
    href: "/emotion-chat",
    gradient: "from-[#4c1d95] to-[#7c3aed]",
    emoji: "🌙",
    cta: "去聊聊",
  },
  {
    id: "xhs",
    title: "小红书笔记",
    desc: "标题、正文、标签、种草文案",
    href: "/expression/xhs-note",
    gradient: "from-[#FF6B6B] to-[#FF2442]",
    emoji: "📕",
    badge: "种草体",
    badgeTone: "hot",
    tags: ["标题+标签", "一键可发"],
  },
];

export const CREATE_QUICK_TOOLS = [
  "文案优化",
  "标题改写",
  "换配图风格",
  "氛围感加强",
  "九宫格排版",
  "封面文案",
  "多图发布包",
  "小红书体",
];

/** 创作页「我的创作记录」最多展示条数 */
export const CREATE_HISTORY_RECENT_LIMIT = 3;

export const CREATE_HISTORY_MOCK = [
  { id: "h1", type: "图片配文", preview: "今天的晚霞，把疲惫都温柔化了…", time: "10分钟前" },
  { id: "h2", type: "朋友圈文案", preview: "慢下来，生活才会给你答案。", time: "1小时前" },
  { id: "h3", type: "高级图文包", preview: "周末探店｜4 张氛围感配图已生成", time: "昨天" },
];

export const CHAT_REPLY_TYPES = [
  { id: "safe", label: "别尬住" },
  { id: "natural", label: "正常唠" },
  { id: "flirt", label: "暧昧拿捏" },
  { id: "sales", label: "谈价不慌" },
  { id: "dignity", label: "不当舔狗" },
  { id: "humor", label: "整活救场" },
  { id: "warm", label: "暖心不油" },
  { id: "direct", label: "直球敢说" },
  { id: "pro", label: "职场体面" },
  { id: "cute", label: "可爱不粘" },
  { id: "concise", label: "短句有力" },
  { id: "empathy", label: "懂你治愈" },
];

export const CHAT_MOCK_ANALYSIS = {
  attitude: { label: "还能聊", percent: 68 },
  relation: { label: "暧昧拉扯中", hint: "可以再主动半步" },
  mood: { label: "偏松弛", hint: "适合接梗延续" },
};

export const CHAT_MOCK_REPLIES: Record<string, string[]> = {
  safe: [
    "懂懂，那你先忙你的～有空再唠，周末要是想出门我可以帮你做攻略（不硬约那种）",
    "没事不急，你回我就行，我这边也在摸鱼，不给你压力哈",
  ],
  natural: [
    "刚看到！今天咋样，我这边刚下班，整个人终于从工位复活了",
    "可以啊，时间你定，我配合你，到时候发定位就行",
  ],
  flirt: [
    "被你这么一说有点上头哈哈～你平时更爱咖啡局还是小酒馆那种？",
    "行，吃的我来找，你负责好看就行，这分工很合理吧",
  ],
  sales: [
    "懂，学生党预算我懂。我把套餐对比和实拍发你，你看完觉得值再聊，不硬推",
    "价格我能再帮你申请一档体验价，关键看你要的效果，不合适咱也保持联系",
  ],
  dignity: [
    "好哒，那我先不追问了，你方便时回我就行，尊重你节奏",
    "收到，我把方案整理清楚发你，你慢慢看，不着急定",
  ],
  humor: [
    "你这已读技能满级了啊，我先把你消息存档，你复活了再@我",
    "行我先撤，不抢你「忙到飞起」的人设，有空再 battle 一局",
  ],
  warm: [
    "你先忙，记得吃饭！回我一句就行，不催不催",
    "感觉你最近挺累的，想唠随时找我，我当树洞也行",
  ],
  direct: [
    "我直说哈：还挺想继续聊的，你方便的话咱约个具体时间？",
    "底价大概在这档，你看能不能接受，不行咱也当交个朋友",
  ],
  pro: [
    "收到，今晚 8 点前改完发你，附一版修改说明，方便你过稿",
    "预算这块我整理对比表给你，标清交付节点，你看着选就行",
  ],
  cute: [
    "被你夸得有点飘了嘿嘿，不过你眼光确实在线",
    "好呀好呀，我负责找好吃的，你负责氛围感，成交？",
  ],
  concise: [
    "OK，周末见",
    "收到，今晚前发你",
  ],
  empathy: [
    "听着就挺累的，先缓一缓，想吐槽我都在",
    "没事，谁都有电量见底的时候，你不用解释太多，我懂",
  ],
};

/** 聊天军师 · 场景快捷卡片 */
export const CHAT_SCENARIOS = [
  { id: "ghost", emoji: "👻", label: "已读蒸发", hint: "别催太狠" },
  { id: "slow", emoji: "🐢", label: "轮回回复", hint: "自然续上" },
  { id: "flirt", emoji: "💗", label: "crush聊天", hint: "上头不油腻" },
  { id: "friendzone", emoji: "🪪", label: "好人卡", hint: "想往前走" },
  { id: "cold", emoji: "🧊", label: "突然下头", hint: "体面挽回" },
  { id: "awkward", emoji: "😅", label: "尬聊救场", hint: "反尴尬" },
  { id: "sarcasm", emoji: "🙃", label: "阴阳对话", hint: "不卑不亢" },
  { id: "group", emoji: "💬", label: "群聊冷场", hint: "接梗破冰" },
  { id: "boss", emoji: "💼", label: "领导消息", hint: "打工人求生" },
  { id: "reject", emoji: "🚫", label: "婉拒邀约", hint: "留退路" },
  { id: "sales", emoji: "💰", label: "客户砍价", hint: "谈价不慌" },
  { id: "social", emoji: "📱", label: "朋友圈互动", hint: "评论有梗" },
] as const;

export type ChatScenarioId = (typeof CHAT_SCENARIOS)[number]["id"];

export const CHAT_SCENARIO_SAMPLES: Record<ChatScenarioId, string> = {
  ghost:
    "我：在吗姐妹\n对方：（已读）\n我：我是不是说错啥了\n对方：（已读不回）",
  slow:
    "我：周末去不去新开的brunch\n对方：看看吧\n我：那家拍照巨出片！\n对方：嗯嗯",
  flirt:
    "对方：你今天穿搭好绝\n我：真的假的哈哈\n对方：真的 很有氛围感那种",
  friendzone:
    "对方：你人超级好 就像我哥\n我：哈哈谢谢\n对方：以后有事第一个找你",
  cold:
    "对方：最近有点累 想静静\n我：怎么了 要不要聊聊\n对方：没事\n（之后回很慢）",
  awkward:
    "我：那个……在吗\n对方：在\n我：……\n我：哈哈哈没事了（其实有事）",
  sarcasm:
    "对方：你这么忙还挺会回消息的嘛\n我：刚看到 怎么感觉话里有话\n对方：随便说说咯",
  group:
    "群友：今天也是打工的一天\n（五分钟没人接梗）\n我：？",
  boss:
    "领导：这个今天下班前能改完吗\n我：好的\n领导：别摆烂 细节再抠一下",
  reject:
    "对方：今晚livehouse一起？\n我：这周能量条空了呜呜\n对方：那周五？",
  sales:
    "客户：学生党 能再便宜点不\n我：已经底价啦\n客户：某宝更便宜诶",
  social:
    "共同好友：（发了健身照）\n我：（想评论不知道说啥）\n我：练得可以 这是撸铁还是普拉提",
};

/** 热门场景 · 列表展示标题 + 填入对话 */
export const CHAT_FAQ_SCENES: { emoji: string; title: string; paste: string }[] = [
  {
    emoji: "👻",
    title: "已读蒸发 · 不知道怎么接",
    paste:
      "我：在吗\n对方：（已读）\n我：我是不是打扰了\n对方：（已读不回）",
  },
  {
    emoji: "💗",
    title: "crush突然夸我 · 怕回太油",
    paste:
      "对方：你今天状态好好\n我：哈哈哈真的吗\n对方：真的 很亮眼那种",
  },
  {
    emoji: "🪪",
    title: "被发好人卡 · 还想争取一下",
    paste:
      "对方：你人很好 但我没那种感觉\n我：理解的 谢谢你坦白\n对方：还能做朋友吧",
  },
  {
    emoji: "💬",
    title: "群聊冷场 · 想接梗不敢说话",
    paste: "群友：今天也是周一暴击\n（冷场 5 分钟）\n我：？",
  },
  {
    emoji: "🎮",
    title: "游戏搭子说我又鸽了",
    paste:
      "搭子：今晚还打吗\n我：加班到很晚 抱歉\n搭子：你又鸽 6",
  },
  {
    emoji: "💼",
    title: "领导下班前临时加活",
    paste:
      "领导：方案今晚能出不\n我：好的\n领导：别糊弄 细节再抠",
  },
  {
    emoji: "🙃",
    title: "对方话里有话 · 阴阳我",
    paste:
      "对方：你挺会消失的嘛\n我：刚看到 怎么感觉有点阴阳\n对方：随便说说",
  },
  {
    emoji: "🚫",
    title: "不想赴约 · 怕伤感情",
    paste:
      "对方：周末剧本杀缺一人\n我：这周社恐模式开了\n对方：那下周一定？",
  },
  {
    emoji: "👨‍👩‍👧",
    title: "爸妈催找对象",
    paste:
      "妈：你都多大了\n我：随缘嘛\n妈：别总玩手机 出去认识人",
  },
  {
    emoji: "💰",
    title: "副业客户砍价",
    paste:
      "客户：能再便宜点吗\n我：真是底价了\n客户：别家更便宜",
  },
  {
    emoji: "📱",
    title: "前任突然点赞朋友圈",
    paste:
      "（前任点赞了你三天前的动态）\n我：？\n我：这是手滑还是……",
  },
  {
    emoji: "☕",
    title: "网友面基前尬聊",
    paste:
      "对方：明天见面紧张\n我：我也哈哈\n对方：万一翻车怎么办",
  },
];

/** @deprecated 使用 CHAT_FAQ_SCENES */
export const CHAT_FAQ = CHAT_FAQ_SCENES.map((s) => s.paste);

export const PROFILE_STATS_MOCK = {
  inspirationBalance: 30103,
  worksCount: 256,
  favoritesCount: 78,
  usageCount: 1240,
};

export const MEMBER_TIERS_MOCK = [
  {
    id: "free",
    name: "普通用户",
    price: "免费",
    limits: ["每天5次基础生成", "图片配文每天2次", "聊天分析每天1次", "发布包每天1次"],
  },
  {
    id: "member",
    name: "会员",
    price: "¥29/月",
    limits: ["每天100次生成", "高级风格", "朋友圈模拟", "氛围感评分", "历史记录"],
  },
  {
    id: "pro",
    name: "Pro会员",
    price: "¥69/月",
    limits: [
      "聊天深度分析",
      "完整短视频发布包",
      "完整小红书笔记",
      "私域成交话术",
      "批量生成",
      "专属人设",
    ],
  },
];

export const INSPIRATION_PACKS_MOCK = [
  { coins: 100, price: "¥9.9" },
  { coins: 300, price: "¥19.9" },
  { coins: 800, price: "¥39.9" },
];

export const PROFILE_TOOLS = [
  { label: "灵感中心", href: "/inspiration", icon: "sparkles" },
  { label: "历史记录", href: "/history", icon: "history" },
  { label: "我的收藏", href: "/history?tab=fav", icon: "heart" },
  { label: "我的作品", href: "/history", icon: "folder" },
  { label: "复盘报告", href: "/review", icon: "chart" },
  { label: "订单记录", href: "/profile/orders", icon: "receipt" },
  { label: "邀请好友", href: "/invite", icon: "gift" },
  { label: "设置", href: "/profile/edit", icon: "settings" },
];

/** 首页快捷话题：短标签展示，点击带入完整 prompt */
export const HOME_QUICK_PROMPTS: { label: string; prompt: string; color: string }[] = [
  {
    label: "小红书爆款标题",
    prompt: "帮我写 3 条小红书爆款标题，真实接地气、有点击欲、不标题党",
    color: "from-[#FFF0F5] to-[#FFE8F0] text-[#FF2442]",
  },
  {
    label: "早安正能量",
    prompt: "写一条早晨正能量朋友圈，温暖治愈、不油腻、适合发给亲友看",
    color: "from-[#ECFDF5] to-[#F0FDF4] text-[#059669]",
  },
  {
    label: "高情商感谢",
    prompt: "同事/朋友帮了大忙，写一段真诚得体的感谢话，适合微信私聊发送",
    color: "from-[#FFF4E6] to-[#FFFBEB] text-[#E85D04]",
  },
  {
    label: "亲友暖心问候",
    prompt: "好久没联系的老朋友，写一句自然暖心的问候，不生硬、不尴尬",
    color: "from-[#EFF6FF] to-[#DBEAFE] text-[#2563EB]",
  },
  {
    label: "群里暖场接话",
    prompt: "微信群有点冷场，帮写一句自然接话，带动气氛、积极友善",
    color: "from-[#FFF8F0] to-[#FFE8D6] text-[#D97706]",
  },
  {
    label: "探店好评种草",
    prompt: "餐厅体验很好，写小红书探店笔记：标题+正文，真实种草、语气自然",
    color: "from-[#FFF5F8] to-[#FFE8F0] text-[#FF2442]",
  },
  {
    label: "周末小确幸",
    prompt: "周末放松时光，写朋友圈小确幸文案，轻松治愈、正能量",
    color: "from-[#F5F3FF] to-[#EDE9FE] text-[#7C3AED]",
  },
  {
    label: "节日暖心祝福",
    prompt: "给长辈写节日祝福，简短暖心、朴实真诚、不重样",
    color: "from-[#FFF0F5] to-[#FFE8F0] text-[#BE185D]",
  },
  {
    label: "亲子成长夸夸",
    prompt: "孩子最近有进步，写一条花式夸奖的朋友圈，真诚感人",
    color: "from-[#FFF7ED] to-[#FFEDD5] text-[#C2410C]",
  },
  {
    label: "健身自律打卡",
    prompt: "坚持运动打卡，写正能量配文，鼓励自己、也给朋友一点动力",
    color: "from-[#ECFDF5] to-[#D1FAE5] text-[#047857]",
  },
  {
    label: "旅行治愈文案",
    prompt: "旅行风景九宫格，配治愈系朋友圈文案，有画面感、心情明亮",
    color: "from-[#EFF6FF] to-[#E0F2FE] text-[#0284C7]",
  },
  {
    label: "好物真心种草",
    prompt: "平价好物真心推荐，按小红书种草结构写：标题+正文+标签",
    color: "from-[#FFE8F0] to-[#FFF0F5] text-[#FF4F8B]",
  },
  {
    label: "家庭聚餐幸福",
    prompt: "和家人一起吃饭，写温馨朋友圈，记录幸福时刻、语气自然",
    color: "from-[#FFF8F0] to-[#FFF4E6] text-[#EA580C]",
  },
  {
    label: "感恩老师前辈",
    prompt: "想感谢老师或前辈的帮助，写一段话：真诚朴实、不浮夸",
    color: "from-[#F9FAFB] to-[#F3F4F6] text-[#4B5563]",
  },
];
