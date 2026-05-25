/** AI 运营助手 — 场景快捷问法 */
export type BuddyPromptCategory = "topic" | "write" | "grow";

export type BuddyQuickPrompt = {
  id: string;
  category: BuddyPromptCategory;
  emoji: string;
  label: string;
  desc: string;
  outcome: string;
  prompt: string;
  tint: string;
  hot?: boolean;
};

export const BUDDY_PROMPT_GROUPS: {
  id: BuddyPromptCategory;
  label: string;
  hint: string;
}[] = [
  { id: "topic", label: "选题起量", hint: "热点 · 今天拍啥" },
  { id: "write", label: "写出来", hint: "标题 · 口播 · 文案" },
  { id: "grow", label: "账号增长", hint: "起号 · 复盘 · 涨粉" },
];

export const BUDDY_QUICK_PROMPTS: BuddyQuickPrompt[] = [
  {
    id: "b1",
    category: "topic",
    emoji: "🔥",
    label: "今天拍啥能火",
    desc: "从热点里挑 3 条能拍的",
    outcome: "得 3 条选题 + 拍摄理由",
    prompt: "帮我从今日热点里挑 3 条最适合普通人发的，每条用一句话说为啥好拍。",
    tint: "from-[#FFE8F0] to-[#FFF8FB]",
    hot: true,
  },
  {
    id: "b2",
    category: "write",
    emoji: "✨",
    label: "标题怎么起",
    desc: "5 条吸睛标题套路",
    outcome: "标题公式 + 可直接套用",
    prompt: "给我 5 条适合抖音/小红书的标题套路，每条带一个真实例子，口语一点。",
    tint: "from-[#FFF3E8] to-[#FFFBF5]",
  },
  {
    id: "b3",
    category: "write",
    emoji: "🎬",
    label: "30 秒口播",
    desc: "写完直接对着镜头念",
    outcome: "完整口播稿 · 约 30 秒",
    prompt: "帮我写一条 30 秒口播，主题下班治愈日常，能直接对着镜头念。",
    tint: "from-[#F3EEFF] to-[#FBF8FF]",
    hot: true,
  },
  {
    id: "b4",
    category: "grow",
    emoji: "📕",
    label: "小红书起号",
    desc: "第一天发什么 + 7 天表",
    outcome: "7 天起号表 + 首日选题",
    prompt: "零基础想发小红书，给我第一天发什么 + 7 天极简起号表。",
    tint: "from-[#E8F4FF] to-[#F5FAFF]",
  },
  {
    id: "b5",
    category: "write",
    emoji: "💬",
    label: "朋友圈文案",
    desc: "生活感，不像广告",
    outcome: "3 版文案任选",
    prompt: "我想发一条生活感朋友圈，要不像广告，给 3 个版本让我选。",
    tint: "from-[#E8FFF3] to-[#F5FFFA]",
  },
  {
    id: "b6",
    category: "grow",
    emoji: "📉",
    label: "播放太低咋办",
    desc: "标题/前 3 秒/发布时间",
    outcome: "3 个原因 + 改法清单",
    prompt: "播放量一直低，从标题、前3秒、发布时间帮我找 3 个最可能的原因和改法。",
    tint: "from-[#FFF0F5] to-[#FFF5F8]",
  },
];

export const BUDDY_FEATURED_ID = "b1";

/** 空状态：展示「回答长什么样」 */
export const BUDDY_ANSWER_PREVIEW = {
  analysis:
    "建议你今天就拍「下班路上的 30 秒治愈瞬间」：镜头跟拍走路或窗外晚霞，口播用轻松语气，结尾留一句互动提问。",
  titles: [
    "下班后这条路，治愈了我一整天的疲惫",
    "打工人下班路上，原来也可以这么松弛",
    "30 秒治愈 vlog｜今天也想好好放过自己",
  ],
  topics: [
    "下班路上的治愈瞬间（最容易拍）",
    "工位到地铁的 3 个解压小动作",
    "今晚吃什么 · 一人食治愈向",
  ],
  structure: ["前 3 秒：背影/地铁门", "中段：口播金句", "结尾：提问互动"],
};

export const BUDDY_POPULAR_CHIPS = [
  "我是美食号，今天发什么有互动？",
  "抖音标题怎么起才不像营销号？",
  "零基础做情感号，第一周发啥？",
  "播放量 200 左右，怎么破 1000？",
  "帮我写探店短视频前 3 秒钩子",
] as const;

export const BUDDY_CAPABILITY_TAGS = ["选题", "标题", "口播", "起号", "复盘"] as const;

export const BUDDY_WORKFLOW_STEPS = [
  { step: "1", label: "选场景或输入" },
  { step: "2", label: "拿可复制的建议" },
  { step: "3", label: "去发布包开拍" },
] as const;
