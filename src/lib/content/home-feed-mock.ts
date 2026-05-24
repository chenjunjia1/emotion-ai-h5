/** 首页「最近大家都在生成」模拟数据 */
export const TRENDING_GENERATIONS = [
  { id: "t1", label: "情绪共鸣文案", users: "12.3k", emoji: "💬", topic: "情绪共鸣文案" },
  { id: "t2", label: "下班vlog脚本", users: "8.7k", emoji: "🌆", topic: "下班后的治愈时刻" },
  { id: "t3", label: "宠物治愈文案", users: "7.2k", emoji: "🐱", topic: "猫咪治愈瞬间" },
  { id: "t4", label: "穿搭反差文案", users: "6.1k", emoji: "👗", topic: "平价穿搭反差" },
  { id: "t5", label: "美食探店脚本", users: "5.8k", emoji: "🍜", topic: "一人食探店" },
  { id: "t6", label: "一个人日常", users: "4.9k", emoji: "☕", topic: "独处日常vlog" },
] as const;

/** AI 猜你适合发 — 标签池 */
export const AI_SUGGEST_TAGS = [
  { id: "s1", label: "情绪类", topic: "情绪共鸣日常" },
  { id: "s2", label: "治愈类", topic: "下班后的治愈时刻" },
  { id: "s3", label: "反差类", topic: "普通人30天改变" },
  { id: "s4", label: "宠物萌趣类", topic: "猫咪治愈瞬间" },
  { id: "s5", label: "下班vlog类", topic: "下班vlog一人食" },
  { id: "s6", label: "小红书种草类", topic: "平价好物种草" },
] as const;

export const AI_SUGGEST_ALT = [
  { id: "a1", label: "职场成长类", topic: "打工人逆袭故事" },
  { id: "a2", label: "美食探店类", topic: "宝藏小店探店" },
  { id: "a3", label: "学习打卡类", topic: "30天自律改变" },
  { id: "a4", label: "穿搭种草类", topic: "百元穿搭出片" },
  { id: "a5", label: "情感治愈类", topic: "一个人也要好好生活" },
  { id: "a6", label: "副业搞钱类", topic: "普通人副业实录" },
] as const;

/** 大家都在用 — 真实案例 */
export const SUCCESS_CASES = [
  { id: "c1", type: "情感号", views: "128.6w", fans: "2.1w", grad: "from-[#FF8EC4] to-[#FF5C8A]" },
  { id: "c2", type: "宠物号", views: "98.3w", fans: "1.8w", grad: "from-[#FFB86C] to-[#FF9A4D]" },
  { id: "c3", type: "美食号", views: "76.5w", fans: "1.2w", grad: "from-[#FF9EC4] to-[#FF7AAE]" },
  { id: "c4", type: "穿搭号", views: "65.2w", fans: "1.0w", grad: "from-[#FFC46B] to-[#FF9A6B]" },
  { id: "c5", type: "学习号", views: "53.6w", fans: "9862", grad: "from-[#A78BFA] to-[#FF7AAE]" },
] as const;
