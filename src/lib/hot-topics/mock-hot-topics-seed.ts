import type { HotTopicInsert } from "@/lib/server/db/hot-topics-db";
import { coverForCategory } from "@/lib/hot-topics/category-covers";
import { DAILY_HOT_PLATFORMS, PLATFORM_LABEL } from "@/lib/hot-topics/types";

type SeedTemplate = {
  raw: string;
  display: string;
  summary: string;
  category: string;
  viral: number;
  tags: string[];
  users: string[];
  angles: string[];
};

const PLATFORM_SEEDS: Record<string, SeedTemplate[]> = {
  douyin: [
    {
      raw: "抖音热门挑战",
      display: "跟拍热门挑战公式",
      summary: "抖音热榜挑战类内容互动高，适合跟拍、变装、卡点类短视频。",
      category: "生活",
      viral: 88,
      tags: ["抖音", "挑战", "跟拍"],
      users: ["生活号", "Vlog号"],
      angles: ["跟拍挑战", "卡点转场", "热门BGM"],
    },
    {
      raw: "多巴胺穿搭",
      display: "多巴胺穿搭上镜公式",
      summary: "抖音穿搭类内容收藏率高，适合展示配色与上镜技巧。",
      category: "穿搭",
      viral: 91,
      tags: ["穿搭", "抖音", "上镜"],
      users: ["穿搭号", "生活号"],
      angles: ["上镜公式", "配色技巧", "拍照姿势"],
    },
    {
      raw: "本地探店",
      display: "人均50宝藏小店",
      summary: "抖音探店类同城流量稳定，适合到店实拍+性价比对比。",
      category: "探店",
      viral: 84,
      tags: ["探店", "本地生活", "美食"],
      users: ["探店号", "美食号"],
      angles: ["到店实拍", "性价比", "避坑指南"],
    },
    {
      raw: "宠物日常",
      display: "猫咪治愈瞬间",
      summary: "抖音萌宠类完播率高，适合短平快治愈画面。",
      category: "宠物",
      viral: 86,
      tags: ["宠物", "猫咪", "治愈"],
      users: ["宠物号", "萌宠号"],
      angles: ["萌宠日常", "治愈瞬间", "互动玩法"],
    },
  ],
  weibo: [
    {
      raw: "微博热搜话题",
      display: "热搜话题普通人视角",
      summary: "微博热搜偏社会话题，适合普通人视角解读、观点口播。",
      category: "情感",
      viral: 82,
      tags: ["微博", "热搜", "观点"],
      users: ["情感号", "生活号"],
      angles: ["普通人视角", "观点口播", "共鸣评论"],
    },
    {
      raw: "下班后生活",
      display: "下班后的治愈时刻",
      summary: "微博生活向话题传播广，适合治愈系 vlog 切入。",
      category: "治愈",
      viral: 85,
      tags: ["治愈", "下班", "生活"],
      users: ["治愈号", "生活号"],
      angles: ["一人食", "房间氛围", "周末小确幸"],
    },
    {
      raw: "宝妈日常",
      display: "宝妈一天真实记录",
      summary: "微博育儿话题讨论度高，适合真实育儿日常记录。",
      category: "宝妈",
      viral: 79,
      tags: ["宝妈", "育儿", "日常"],
      users: ["宝妈号", "生活号"],
      angles: ["真实一天", "育儿清单", "情绪共鸣"],
    },
    {
      raw: "职场打工人",
      display: "打工人真实日常",
      summary: "微博职场话题易引发共鸣，适合打工人视角内容。",
      category: "职场",
      viral: 81,
      tags: ["职场", "打工人", "共鸣"],
      users: ["职场号", "情感号"],
      angles: ["通勤日常", "反内耗", "真实吐槽"],
    },
  ],
  baidu: [
    {
      raw: "百度热搜事件",
      display: "热搜事件普通人怎么看",
      summary: "百度热搜覆盖大众搜索，适合科普解读、普通人观点。",
      category: "生活",
      viral: 78,
      tags: ["百度", "热搜", "解读"],
      users: ["生活号", "成长号"],
      angles: ["3分钟解读", "普通人观点", "信息差"],
    },
    {
      raw: "健康生活方式",
      display: "普通人健康小习惯",
      summary: "百度健康类搜索量大，适合轻科普+日常习惯分享。",
      category: "生活",
      viral: 76,
      tags: ["健康", "习惯", "科普"],
      users: ["生活号", "成长号"],
      angles: ["习惯清单", "前后对比", "真实记录"],
    },
    {
      raw: "AI工具",
      display: "AI工具帮写短视频脚本",
      summary: "百度 AI 相关搜索上涨，适合工具实操演示。",
      category: "AI工具",
      viral: 83,
      tags: ["AI", "工具", "效率"],
      users: ["职场号", "副业号"],
      angles: ["3步教程", "工具对比", "新手入门"],
    },
    {
      raw: "年轻人存钱",
      display: "普通人的30天改变",
      summary: "百度理财/成长类话题稳定，适合真实改变记录。",
      category: "成长",
      viral: 77,
      tags: ["成长", "存钱", "改变"],
      users: ["成长号", "副业号"],
      angles: ["30天记录", "账本公开", "前后对比"],
    },
  ],
  bilibili: [
    {
      raw: "B站热门视频",
      display: "B站热门二创灵感",
      summary: "B站热榜偏年轻向，适合二创、解说、知识类短视频。",
      category: "学生",
      viral: 80,
      tags: ["B站", "二创", "年轻"],
      users: ["学生号", "成长号"],
      angles: ["热点二创", "知识解说", "梗图改编"],
    },
    {
      raw: "学生党学习",
      display: "学生党高效学习法",
      summary: "B站学习区流量大，适合学习 vlog、备考干货。",
      category: "学生",
      viral: 82,
      tags: ["学习", "学生", "干货"],
      users: ["学生号", "成长号"],
      angles: ["学习vlog", "备考清单", "桌面改造"],
    },
    {
      raw: "游戏热点",
      display: "游戏热点解说脚本",
      summary: "B站游戏区热点更新快，适合热点解说、盘点类内容。",
      category: "生活",
      viral: 75,
      tags: ["游戏", "解说", "热点"],
      users: ["游戏号", "生活号"],
      angles: ["热点解说", "盘点类", "Reaction"],
    },
    {
      raw: "科技数码",
      display: "数码新品普通人测评",
      summary: "B站数码区关注度高，适合平价测评、真实体验。",
      category: "AI工具",
      viral: 79,
      tags: ["数码", "测评", "科技"],
      users: ["科技号", "生活号"],
      angles: ["真实体验", "优缺点", "平价替代"],
    },
  ],
  toutiao: [
    {
      raw: "今日头条热点",
      display: "头条热点3分钟解读",
      summary: "头条热榜偏资讯向，适合快速解读+观点输出。",
      category: "生活",
      viral: 77,
      tags: ["头条", "资讯", "解读"],
      users: ["生活号", "职场号"],
      angles: ["3分钟解读", "信息梳理", "普通人观点"],
    },
    {
      raw: "职场效率",
      display: "打工人效率提升3招",
      summary: "头条职场类阅读量大，适合清单体干货口播。",
      category: "职场",
      viral: 81,
      tags: ["职场", "效率", "干货"],
      users: ["职场号", "成长号"],
      angles: ["清单体", "时间管理", "反内耗"],
    },
    {
      raw: "三农话题",
      display: "乡村生活真实记录",
      summary: "头条三农/乡村内容有稳定受众，适合真实记录。",
      category: "生活",
      viral: 74,
      tags: ["乡村", "真实", "记录"],
      users: ["生活号", "Vlog号"],
      angles: ["田间日常", "农货分享", "慢生活"],
    },
    {
      raw: "美食教程",
      display: "一人食快手教程",
      summary: "头条美食教程类收藏高，适合步骤清晰的短视频。",
      category: "美食",
      viral: 80,
      tags: ["美食", "教程", "一人食"],
      users: ["美食号", "生活号"],
      angles: ["步骤教程", "一人食", "快手菜"],
    },
  ],
  zhihu: [
    {
      raw: "知乎热榜问题",
      display: "知乎热榜普通人回答",
      summary: "知乎热榜偏深度讨论，适合口播回答+经验分享。",
      category: "成长",
      viral: 79,
      tags: ["知乎", "热榜", "经验"],
      users: ["成长号", "职场号"],
      angles: ["经验分享", "口播回答", "真实案例"],
    },
    {
      raw: "副业思路",
      display: "普通人副业3个方向",
      summary: "知乎副业话题搜索稳定，适合案例拆解口播。",
      category: "副业",
      viral: 78,
      tags: ["副业", "搞钱", "普通人"],
      users: ["副业号", "职场号"],
      angles: ["真实案例", "避坑指南", "从0开始"],
    },
    {
      raw: "AI工具",
      display: "AI工具帮写短视频脚本",
      summary: "知乎 AI 话题讨论活跃，适合工具测评与教程。",
      category: "AI工具",
      viral: 84,
      tags: ["AI", "工具", "教程"],
      users: ["职场号", "副业号"],
      angles: ["工具对比", "实操演示", "新手教程"],
    },
    {
      raw: "情感关系",
      display: "情感话题共鸣口播",
      summary: "知乎情感类问题易出爆款回答，适合共鸣向口播。",
      category: "情感",
      viral: 82,
      tags: ["情感", "共鸣", "口播"],
      users: ["情感号", "生活号"],
      angles: ["共鸣故事", "观点输出", "评论区互动"],
    },
  ],
};

function dateOffset(batchDate: string): number {
  const d = new Date(batchDate);
  return (d.getUTCDate() + d.getUTCMonth() * 31) % 997;
}

function heatForPlatform(platform: string, index: number, batchDate: string): number {
  const base: Record<string, number> = {
    douyin: 920000,
    weibo: 850000,
    baidu: 780000,
    bilibili: 720000,
    toutiao: 680000,
    zhihu: 650000,
  };
  const off = dateOffset(batchDate);
  return (base[platform] ?? 600000) - index * 45000 - (off % 12000);
}

/** 按平台生成差异化 mock（API 不可用时的兜底，仍按平台分 Tab） */
export function buildMockHotTopicRows(batchDate: string): HotTopicInsert[] {
  const rows: HotTopicInsert[] = [];
  let rank = 0;
  const off = dateOffset(batchDate);

  for (const platform of DAILY_HOT_PLATFORMS) {
    const seeds = PLATFORM_SEEDS[platform] ?? [];
    const rotated = [...seeds.slice(off % seeds.length), ...seeds.slice(0, off % seeds.length)];
    rotated.forEach((s, i) => {
      const heat = heatForPlatform(platform, i, batchDate);
      rows.push({
        raw_title: s.raw,
        display_title: s.display,
        summary: `${s.summary}（来源：${PLATFORM_LABEL[platform] ?? platform}热榜 · ${batchDate}）`,
        platform,
        heat_value: `${(heat / 10000).toFixed(1)}w`,
        heat_score: heat,
        cover_image: coverForCategory(s.category),
        category: s.category,
        tags: [...s.tags, PLATFORM_LABEL[platform] ?? platform],
        target_users: s.users,
        recommend_angles: s.angles,
        viral_score: Math.min(94, s.viral + (off % 5)),
        source_url: null,
        is_new: rank < 6,
        status: "active" as const,
        updated_batch_date: batchDate,
      });
      rank++;
    });
  }
  return rows;
}

export function buildMockRawFromRows(rows: HotTopicInsert[]) {
  return rows.map((r) => ({
    title: r.raw_title,
    desc: r.summary,
    hot: r.heat_score,
    platform: r.platform,
    url: r.source_url ?? undefined,
  }));
}
