import { KEYWORD_BLACKLIST } from "@/lib/hot-topics/filters";
import { NEWS_LIKE_PATTERNS } from "@/lib/hot-topics/youth-content-policy";
import type { XhsAudience, XhsContentType, XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

const BLOCKED_PATTERNS: RegExp[] = [
  ...NEWS_LIKE_PATTERNS,
  /政治|时政|政府|国务院|外交|军事|战争|冲突|制裁/,
  /灾难|地震|爆炸|坠机|车祸|死亡|遇难|伤亡|事故/,
  /低俗|色情|擦边|裸照|约炮|嫖娼|赌博|彩票|传销/,
  /违法|违规|走私|诈骗|吸毒|恐怖/,
  /网暴|撕逼|出轨|绯闻|塌房|私生子/,
  /确诊|癌症|自杀|抑郁治疗|医疗事故/,
];

const FEMALE_HINTS = /穿搭|OOTD|裙子|显瘦|美妆|护肤|美甲|发型|拍照姿势|咖啡|奶茶|治愈|情绪|猫咪|萌宠|闺蜜|姐妹/;
const MALE_HINTS = /职场|打工人|通勤|老板|同事|健身|球鞋|数码|游戏|城市|街拍|男生|男士|汽车/;

type CategoryRule = { re: RegExp; category: XhsNoteCategory };

const CATEGORY_RULES: CategoryRule[] = [
  { re: /美食|烧烤|奶茶|咖啡|甜品|探店|餐厅|小吃|早餐|brunch/i, category: "美食打卡" },
  { re: /咖啡|下午茶|拿铁|手冲|咖啡馆/i, category: "咖啡生活" },
  { re: /穿搭|OOTD|显瘦|裙子|通勤|拍照|造型|衣橱|时尚/i, category: "穿搭变美" },
  { re: /猫|狗|宠物|萌宠|铲屎官|毛孩子/i, category: "宠物萌系" },
  { re: /上班|职场|打工人|同事|老板|工资|面试|工位|摸鱼|内卷|通勤|加班|裸辞|996/i, category: "职场嘴替" },
  { re: /周末|旅行|海边|度假|出片|风景|徒步|露营/i, category: "旅行出片" },
  { re: /城市|散步|街区|夜景|地铁|下班|街头/i, category: "城市生活" },
  { re: /情绪|开心|难过|治愈|独处|松弛|生活感/i, category: "治愈日常" },
  { re: /文案|共鸣|朋友圈|心情|语录/i, category: "情绪文案" },
];

export function computeXhsHotScore(input: {
  likedCount: number;
  collectedCount: number;
  commentCount: number;
  shareCount: number;
}): number {
  return (
    input.likedCount * 1 +
    input.collectedCount * 2 +
    input.commentCount * 3 +
    input.shareCount * 3
  );
}

export function classifyXhsNote(text: string): XhsNoteCategory {
  const hay = text.trim();
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(hay)) return rule.category;
  }
  if (/咖啡/.test(hay)) return "咖啡生活";
  return "治愈日常";
}

export function inferXhsAudience(text: string, category: XhsNoteCategory): XhsAudience {
  const hay = `${text} ${category}`;
  const female = FEMALE_HINTS.test(hay);
  const male = MALE_HINTS.test(hay);
  if (female && !male) return "女生爱发";
  if (male && !female) return "男生爱发";
  if (category === "穿搭变美" || category === "咖啡生活") return "女生爱发";
  if (category === "职场嘴替") return "男生爱发";
  return "通用";
}

export function inferXhsContentType(
  category: XhsNoteCategory,
  desc: string,
  title = ""
): XhsContentType {
  const text = `${title} ${desc}`;
  if (category === "情绪文案" || category === "朋友圈文案") return "朋友圈文案";
  if (/朋友圈|文案|心情|碎碎念|今日状态|小确幸/.test(text)) return "朋友圈文案";
  if (
    ["治愈日常", "咖啡生活", "城市生活"].includes(category) &&
    desc.length > 0 &&
    desc.length <= 90
  ) {
    return "朋友圈文案";
  }
  if (category === "职场嘴替" && desc.length < 80) return "抖音短文案";
  return "小红书图文";
}

export function isBlockedXhsContent(title: string, desc: string, tags: string[]): boolean {
  const hay = `${title} ${desc} ${tags.join(" ")}`.trim();
  if (!hay || hay.length < 4) return true;
  if (BLOCKED_PATTERNS.some((re) => re.test(hay))) return true;
  if (KEYWORD_BLACKLIST.some((w) => hay.includes(w))) return true;
  if (/视频笔记|直播/i.test(hay) && !/图文|拍照|日常/.test(hay)) {
    /* 允许带视频字样但优先图文 */
  }
  return false;
}

export function isImageNoteCandidate(raw: Record<string, unknown>): boolean {
  const type =
    pickStr(raw, ["type", "note_type", "noteType"]) ??
    pickStr(raw.note_card as Record<string, unknown>, ["type"]);
  if (type && /video|直播/i.test(type)) return false;
  const hasVideo = Boolean(
    raw.video_info ||
      raw.video ||
      (raw.note_card as Record<string, unknown>)?.video
  );
  const images = extractImageUrls(raw);
  if (hasVideo && images.length === 0) return false;
  return images.length > 0 || !hasVideo;
}

export function sortXhsNotesByHotScore(notes: XhsHotNote[]): XhsHotNote[] {
  return [...notes].sort((a, b) => b.hotScore - a.hotScore);
}

function pickStr(obj: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined;
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function extractImageUrls(raw: Record<string, unknown>): string[] {
  const urls: string[] = [];
  const push = (u: unknown) => {
    if (typeof u === "string" && u.startsWith("http")) urls.push(u);
  };

  const lists = [
    raw.images_list,
    raw.image_list,
    raw.images,
    raw.imageList,
    (raw.note_card as Record<string, unknown>)?.image_list,
    (raw.note as Record<string, unknown>)?.images_list,
    (raw.cover as Record<string, unknown>)?.url,
  ];

  for (const item of lists) {
    if (typeof item === "string") push(item);
    else if (Array.isArray(item)) {
      for (const x of item) {
        if (typeof x === "string") push(x);
        else if (x && typeof x === "object") {
          const o = x as Record<string, unknown>;
          const url =
            (typeof o.url === "string" && o.url.startsWith("http") ? o.url : "") ||
            (typeof o.url_size_large === "string" ? o.url_size_large : "") ||
            (typeof o.url_default === "string" ? o.url_default : "") ||
            (typeof o.url_pre === "string" ? o.url_pre : "");
          push(url);
          const info = o.info_list;
          if (Array.isArray(info) && info[0] && typeof info[0] === "object") {
            push((info[0] as Record<string, unknown>).url);
          }
        }
      }
    }
  }

  if (raw.cover && typeof raw.cover === "object") {
    const c = raw.cover as Record<string, unknown>;
    push(c.url ?? c.url_default);
  }

  return [...new Set(urls)];
}

export { extractImageUrls };
