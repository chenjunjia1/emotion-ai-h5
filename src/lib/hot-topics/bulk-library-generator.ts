import { coverImageForCategory } from "@/lib/content/bundled-cover-assets";
import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";
import { looksLikeNewsOrHardToFilm } from "@/lib/hot-topics/youth-content-policy";
import { YOUTH_CREATOR_CATEGORIES } from "@/lib/hot-topics/youth-content-policy";
import { DAILY_HOT_PLATFORMS, PLATFORM_LABEL } from "@/lib/hot-topics/types";

/** 灵感库最少入库条数（真实可浏览、可生成发布包） */
export const HOT_TOPIC_LIBRARY_MIN = 1000;

/** 每日 API/AI 精选条数上限（其余为库内扩展选题） */
export const HOT_TOPIC_FEATURED_MAX = 72;

const PLATFORMS = [
  "douyin",
  "xiaohongshu_inspiration",
  "douyin",
  "bilibili",
  "douyin",
  "toutiao",
  "zhihu",
  "weibo",
  "baidu",
] as const;

const SUBJECTS: Record<string, string[]> = {
  情感: ["异地恋维系", "暧昧期聊天", "分手疗愈", "友情边界", "家庭沟通", "恋爱日常", "暗恋心事", "情绪自救"],
  职场: ["打工人通勤", "面试技巧", "副业探索", "职场避坑", "摸鱼日常", "加班实录", "转行故事", "工资坦白"],
  生活: ["租房改造", "独居日常", "周末宅家", "城市漫步", "极简收纳", "早起routine", "夜生活vlog", "搬家日记"],
  宠物: ["猫咪日常", "遛狗日记", "异宠科普", "宠物搞笑", "领养故事", "宠物洗护", "萌宠治愈", "铲屎官吐槽"],
  美食: ["一人食", "便利店测评", "家常菜", "减脂餐", "夜宵分享", "咖啡探店", "甜品自制", "厨房翻车"],
  学生: ["宿舍生活", "考研日常", "期末冲刺", "校园vlog", "社团活动", "兼职经历", "毕业季", "图书馆自习"],
  宝妈: ["带娃日常", "辅食制作", "亲子游戏", "育儿心得", "宝妈自愈", "幼儿园选择", "绘本推荐", "家庭记录"],
  穿搭: ["通勤穿搭", "约会穿搭", "小个子穿搭", "平价穿搭", "换季衣橱", "配饰搭配", "OOTD分享", "色系搭配"],
  探店: ["宝藏小店", "人均50", "咖啡馆", "夜市小吃", "本地隐藏店", "拍照打卡", "避雷探店", "周末出游"],
  AI工具: ["AI写脚本", "AI做封面", "效率工具", "剪辑技巧", "起号工具", "文案生成", "选题灵感", "自动化运营"],
  副业: ["自媒体起号", "接单副业", "技能变现", "时间管理", "收入复盘", "避坑指南", "从0到1", "轻创业"],
  治愈: ["雨天窗景", "睡前放松", "自然白噪音", "手账记录", "香薰氛围", "慢生活", "情绪疗愈", "放空时刻"],
  成长: ["读书分享", "习惯养成", "自律打卡", "认知升级", "复盘日记", "目标管理", "自我对话", "年度总结"],
};

const HOOKS = [
  "怎么拍更上镜",
  "普通人也能抄的选题",
  "3秒抓住注意力",
  "评论区高互动写法",
  "适合日更的系列",
  "低成本拍摄方案",
  "爆款标题公式",
  "完播率提升技巧",
  "首评引导话术",
  "朋友圈同款文案",
  "小红书封面思路",
  "抖音前3秒钩子",
  "治愈系氛围感",
  "真实不尬的日常",
  "反差对比更好玩",
];

const ANGLE_POOL = [
  "跟拍挑战",
  "清单体",
  "前后对比",
  "口播干货",
  "vlog记录",
  "沉浸式体验",
  "问答互动",
  "故事共鸣",
];

function hashIdx(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return mod > 0 ? h % mod : 0;
}

function heatScore(index: number, batchDate: string): number {
  const off = hashIdx(batchDate, 997);
  return 680000 - index * 420 - (off % 8000);
}

function* iterateLibraryRows(batchDate: string): Generator<HotTopicInsert> {
  let index = 0;
  for (const category of YOUTH_CREATOR_CATEGORIES) {
    const subjects = SUBJECTS[category] ?? SUBJECTS["生活"];
    for (const subject of subjects) {
      for (const hook of HOOKS) {
        const display = `${subject} · ${hook}`;
        const raw = `${category}${subject}${hook}`;
        if (looksLikeNewsOrHardToFilm(display, raw)) continue;

        const platform = PLATFORMS[index % PLATFORMS.length];
        const platLabel = PLATFORM_LABEL[platform] ?? platform;
        const heat = heatScore(index, batchDate);
        const viral = 62 + (hashIdx(`${batchDate}-${display}`, 33));

        yield {
          raw_title: raw,
          display_title: display,
          summary: `【灵感库】${category}向选题，适合${platLabel}短视频/图文，${hook}。`,
          platform,
          heat_value: `${(heat / 10000).toFixed(1)}w`,
          heat_score: heat,
          cover_image: coverImageForCategory(category, `${display}-${index}`, display),
          category,
          tags: [category, platLabel, "灵感库"],
          target_users: [`${category}号`, "生活号"],
          recommend_angles: [
            ANGLE_POOL[index % ANGLE_POOL.length],
            ANGLE_POOL[(index + 3) % ANGLE_POOL.length],
          ],
          viral_score: Math.min(94, viral),
          source_url: null,
          is_new: false,
          status: "active",
          reject_reason: null,
          safe_score: 88,
          content_value_score: 70 + (index % 18),
          updated_batch_date: batchDate,
        };
        index++;
      }
    }
  }
}

/**
 * 在已有精选条目的基础上，补齐至 targetTotal 条不重复选题（默认 ≥1000）
 */
export function buildBulkHotTopicLibrary(
  batchDate: string,
  existing: HotTopicInsert[],
  targetTotal = HOT_TOPIC_LIBRARY_MIN
): HotTopicInsert[] {
  const seen = new Set(existing.map((r) => r.display_title.trim()));
  const extra: HotTopicInsert[] = [];
  const need = Math.max(0, targetTotal - existing.filter((r) => r.status === "active").length);
  if (need === 0) return extra;

  for (const row of iterateLibraryRows(batchDate)) {
    if (extra.length >= need) break;
    const key = row.display_title.trim();
    if (seen.has(key)) continue;
    seen.add(key);
    extra.push(row);
  }

  return extra;
}

/** 仅生成库（无 API 时本地/演示全量入库） */
export function buildFullHotTopicLibrary(batchDate: string): HotTopicInsert[] {
  const rows: HotTopicInsert[] = [];
  for (const row of iterateLibraryRows(batchDate)) {
    rows.push({ ...row, is_new: rows.length < 12 });
    if (rows.length >= HOT_TOPIC_LIBRARY_MIN + 200) break;
  }
  return rows;
}
