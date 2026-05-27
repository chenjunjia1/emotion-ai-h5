import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";
import {
  extractMomentsPreview,
  isXhsStyledInspirationText,
  pickMomentsHeadlinePrefix,
} from "@/lib/xhs/xhs-moments-fit";

export type XhsCardCopy = {
  headline: string;
  subline: string;
  angle: string;
};

const CATEGORY_HEADLINE: Record<XhsNoteCategory, string[]> = {
  美食打卡: ["好吃又好拍｜", "探店灵感｜", "今日胃想｜"],
  穿搭变美: ["OOTD灵感｜", "上镜公式｜", "穿搭抄作业｜"],
  宠物萌系: ["萌宠暴击｜", "铲屎官日记｜", "贴贴预警｜"],
  旅行出片: ["出片灵感｜", "周末去哪儿｜", "氛围旅拍｜"],
  城市生活: ["城市漫游｜", "街角氛围｜", "下班路上｜"],
  治愈日常: ["治愈碎片｜", "松弛日常｜", "慢生活感｜"],
  情绪文案: ["情绪共鸣｜", "说到心坎｜", "深夜文案｜"],
  职场嘴替: ["打工人嘴替｜", "上班实录｜", "职场共鸣｜"],
  咖啡生活: ["咖啡日常｜", "下午茶氛围｜", "窗边时刻｜"],
  朋友圈文案: ["朋友圈秒发｜", "今日状态｜", "一句话文案｜"],
};

const CATEGORY_SUBLINE: Record<XhsNoteCategory, string[]> = {
  美食打卡: ["照着这个角度拍，食欲感拉满", "同款结构改写成你的探店笔记"],
  穿搭变美: ["学构图和配色，不用抄原文", "适合小红书九宫格图文"],
  宠物萌系: ["萌感互动 + 一句口语标题", "宠物号今天就能发"],
  旅行出片: ["学氛围和机位，文案 AI 原创", "周末出游直接套用结构"],
  城市生活: ["城市感 + 生活细节，易出片", "适合随手拍一发"],
  治愈日常: ["低饱和 + 慢节奏，治愈向", "适合情绪号/生活号"],
  情绪文案: ["共鸣向，适合朋友圈/小红书", "保留情绪，不复读原文"],
  职场嘴替: ["打工人秒懂，评论率高", "适合口播或图文吐槽"],
  咖啡生活: ["氛围感图文，收藏率高", "咖啡店/居家都能拍"],
  朋友圈文案: ["短平快，适合私域发动态", "AI 帮你改成你的语气"],
};

const DEFAULT_HEADLINE = ["今日灵感｜", "爆款方向｜", "种草笔记｜"];
const DEFAULT_SUBLINE = ["照着结构改一版就能发", "AI 帮你改成你的口吻"];

function categoryPools(category: string): {
  headlines: string[];
  sublines: string[];
} {
  const key = category as XhsNoteCategory;
  return {
    headlines: CATEGORY_HEADLINE[key] ?? DEFAULT_HEADLINE,
    sublines: CATEGORY_SUBLINE[key] ?? DEFAULT_SUBLINE,
  };
}

function hashPick(seed: string, pool: string[]): string {
  const list = pool?.length ? pool : DEFAULT_HEADLINE;
  let h = 0;
  const s = seed || "xhs";
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return list[h % list.length]!;
}

function cleanRawTitle(raw: string): string {
  return raw
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9，、！？｜·\s]/g, "")
    .trim()
    .slice(0, 18);
}

function keywordFromNote(note: XhsHotNote): string {
  const cleaned = cleanRawTitle(String(note.title ?? ""));
  if (cleaned.length >= 4) return cleaned;
  const desc = String(note.desc ?? "").trim();
  if (desc.length >= 4) return desc.slice(0, 16);
  return String(note.category ?? "灵感");
}

/** 扩展池轮换用：从标题/描述/标签中取不同关键词，避免卡片标题雷同 */
function keywordVariants(note: XhsHotNote): string[] {
  const fromTags = (note.tags ?? [])
    .map((t) => cleanRawTitle(String(t)))
    .filter((t) => t.length >= 2);
  const chunks = [
    cleanRawTitle(String(note.title ?? "")),
    cleanRawTitle(String(note.desc ?? "").slice(0, 24)),
    cleanRawTitle(String(note.desc ?? "").slice(12, 36)),
    ...fromTags,
    String(note.category ?? "灵感"),
  ].filter((t) => t.length >= 2);
  const uniq: string[] = [];
  for (const c of chunks) {
    if (!uniq.includes(c)) uniq.push(c);
  }
  return uniq.length ? uniq : ["灵感"];
}

/**
 * 灵感池扩展条目专用展示文案（round=0 为原条，>0 为克隆变体）
 */
export function buildInspirationVariantCopy(
  note: XhsHotNote,
  variantRound: number
): { displayHeadline: string; displaySubline: string } {
  if (variantRound <= 0 && note.displayHeadline?.trim()) {
    return {
      displayHeadline: note.displayHeadline.trim().slice(0, 32),
      displaySubline: (note.displaySubline?.trim() || buildXhsCardCopyAuto(note).subline).slice(0, 48),
    };
  }

  const category = String(note.category ?? "灵感").trim() || "灵感";
  const pools = categoryPools(category);
  const seed =
    variantRound > 0
      ? `${String(note.noteId ?? note.id ?? "note")}~v${variantRound}`
      : String(note.noteId ?? note.id ?? "note");
  const prefix = hashPick(seed, pools.headlines);
  const subline = hashPick(`${seed}-sub`, pools.sublines);
  const variants = keywordVariants(note);
  const keyword = variants[variantRound % variants.length]!;

  const VARIANT_TAGS = [
    "换角度",
    "新发",
    "备选",
    "今日版",
    "灵感+",
    "再一版",
    "结构参考",
  ] as const;

  let headline =
    keyword.length >= 4
      ? `${prefix}${keyword}`
      : `${prefix}${category}灵感${variantRound > 0 ? variantRound : ""}`;

  if (variantRound > 0) {
    const tag = VARIANT_TAGS[variantRound % VARIANT_TAGS.length]!;
    headline = `${headline}·${tag}`;
  }

  return { displayHeadline: headline.slice(0, 32), displaySubline: subline.slice(0, 48) };
}

/** 把 TikHub 原标题包装成更吸引点击的灵感标题（未设 displayHeadline 时） */
function buildXhsCardCopyAuto(note: XhsHotNote): XhsCardCopy {
  const category = String(note.category ?? "灵感").trim() || "灵感";
  const pools = categoryPools(category);
  const noteId = String(note.noteId ?? note.id ?? "note");
  const prefix = hashPick(noteId, pools.headlines);
  const subline = hashPick(`${noteId}-sub`, pools.sublines);
  const keyword = keywordFromNote(note);

  const headline =
    keyword.length >= 6 && !/^[一只这那]/.test(keyword)
      ? `${prefix}${keyword}`
      : `${prefix}${category}爆款方向`;

  return {
    headline: headline.slice(0, 28),
    subline,
    angle: `${category} · ${keyword || String(note.title ?? "")}`.slice(0, 48),
  };
}

/** 用户端展示文案：优先用后台 displayHeadline / displaySubline */
export function buildXhsCardCopy(note: XhsHotNote): XhsCardCopy {
  const base = buildXhsCardCopyAuto(note);
  const headline = note.displayHeadline?.trim();
  const subline = note.displaySubline?.trim();
  return {
    headline: headline ? headline.slice(0, 32) : base.headline,
    subline: subline || base.subline,
    angle: base.angle,
  };
}

/** 未保存自定义标题时的自动生成预览（后台「恢复自动」用） */
export function previewXhsCardCopyAuto(note: XhsHotNote): XhsCardCopy {
  return buildXhsCardCopyAuto(note);
}

/** 朋友圈 Tab：一句秒发 · 不用小红书风/老套池内标题 */
export function buildMomentsCardCopy(note: XhsHotNote): XhsCardCopy {
  const customHeadline = note.displayHeadline?.trim();
  const customSubline = note.displaySubline?.trim();
  const noteId = String(note.noteId ?? note.id ?? "note");

  if (customHeadline && !isXhsStyledInspirationText(customHeadline)) {
    return {
      headline: customHeadline.slice(0, 32),
      subline: customSubline || "1 张图 + 一句话 · AI 改成你的语气",
      angle: `朋友圈秒发 · ${note.category}`.slice(0, 48),
    };
  }

  const preview = extractMomentsPreview(note);
  const category = String(note.category ?? "灵感").trim() || "灵感";
  const prefix = pickMomentsHeadlinePrefix(noteId);

  const sublines = [
    "1 张图 + 一句话 · AI 改成你的语气",
    "短平快 · 适合私域秒发",
    "不用长文 · 配图就能发",
    "90/00 后口吻 · AI 原创改写",
  ];
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) >>> 0;

  return {
    headline: `${prefix}｜${preview}`.slice(0, 32),
    subline: sublines[h % sublines.length]!,
    angle: `朋友圈秒发 · ${category} · ${preview}`.slice(0, 48),
  };
}
