import type { XhsHotNote, XhsNoteCategory } from "@/lib/xhs/types";

const MOMENTS_CATEGORIES = new Set<XhsNoteCategory>([
  "治愈日常",
  "情绪文案",
  "咖啡生活",
  "城市生活",
  "朋友圈文案",
  "职场嘴替",
  "美食打卡",
  "宠物萌系",
]);

/** 90/00 后朋友圈常见主题（加分） */
const MOMENTS_FRESH_HINT =
  /搭子|citywalk|City ?Walk|live|演唱会|音乐节|livehouse|探店|奶茶|咖啡|撸铁|健身|大学生|早八|读研|实习|恋爱|crush|暧昧|i人|e人|浓人|淡人|班味|发疯|摆烂|躺平|特种兵|盲盒|谷子|二次元|剧本杀|脱口秀|露营|徒步|滑雪|随拍|出片|氛围感|精神状态|宝藏|绝绝子|谁懂|杀疯了|梦中情|社恐|社牛|微醺|夜宵|火锅|烧烤|猫|狗|毛孩子|追星|番剧|游戏|电竞|酒吧|小酌|聚会|派对|自拍|胶片|CCD|后备箱|外卖|干饭|碳水|甜品|面包|面包脑袋|滑雪季|海边|日落|夜景|街拍|通勤|工位|摸鱼|离职|裸辞|gap|周末|假期|出游|打卡|vlog|plog/i;

/** 偏老套 / 小红书笔记风 / 池内重复模板（减分） */
const MOMENTS_STALE_HINT =
  /太尴尬|口误|被领导|白请|治愈碎片|慢下来|不必解释|心坎里|普通的一天也很可爱|生活碎片 \+1|今日状态：在线|结构参考|灵感\+|再一版|抄作业|种草方向|OOTD|九宫格|笔记标题|探店攻略|妆教/i;

const MOMENTS_HINT =
  /朋友圈|心情|今日|状态|碎碎念|记录|日常|松弛|周末|小确幸|氛围|文案|一句话|搭子|发疯|i人|e人|班味|精神状态|谁懂|绝绝子/;

/** 明显偏小红书长图文，不适合「发朋友圈」Tab */
export const XHS_STYLE_TEXT_HINT =
  /OOTD|ootd|抄作业|种草|小红书|爆款笔记|探店攻略|穿搭公式|妆教|发型教程|九宫格|发布包|口播脚本|分镜|vlog教程|笔记标题/i;

const MOMENTS_EXCLUDED_CATEGORIES = new Set<XhsNoteCategory>(["穿搭变美", "旅行出片"]);

function textBlob(note: XhsHotNote): string {
  return `${note.title} ${note.desc} ${note.displayHeadline ?? ""} ${note.tags.join(" ")}`;
}

/** 这条笔记适不适合改写成朋友圈短文案（0–100） */
export function scoreMomentsFit(note: XhsHotNote): number {
  let score = 0;
  const text = textBlob(note);

  if (XHS_STYLE_TEXT_HINT.test(text)) score -= 45;
  if (MOMENTS_STALE_HINT.test(text)) score -= 22;
  if (MOMENTS_EXCLUDED_CATEGORIES.has(note.category)) score -= 18;

  if (MOMENTS_CATEGORIES.has(note.category)) score += 26;
  if (note.contentType === "朋友圈文案") score += 32;
  else if (note.contentType === "小红书图文") score -= 12;
  if (MOMENTS_HINT.test(text)) score += 16;
  if (MOMENTS_FRESH_HINT.test(text)) score += 28;

  const copyLen = (note.desc.trim() || note.title.trim()).length;
  if (copyLen >= 6 && copyLen <= 72) score += 22;
  else if (copyLen <= 120) score += 10;
  else if (copyLen > 200) score -= 14;

  if (note.category === "宠物萌系" || note.category === "美食打卡") score += 10;
  if (note.category === "职场嘴替" && /摸鱼|班味|打工人|工位|早八/.test(text)) score += 12;

  score += Math.min(Math.round(note.shareCount / 200), 8);
  score += Math.min(Math.round(note.collectedCount / 500), 6);

  return Math.max(0, score);
}

export function isXhsStyledInspirationText(text: string): boolean {
  return XHS_STYLE_TEXT_HINT.test(text) || MOMENTS_STALE_HINT.test(text);
}

export function isMomentsFriendlyNote(note: XhsHotNote, minScore = 24): boolean {
  return scoreMomentsFit(note) >= minScore;
}

function pickMomentsPool(
  scored: { n: XhsHotNote; s: number }[],
  minScore: number,
  max: number
): XhsHotNote[] {
  const seenHeadline = new Set<string>();
  const out: XhsHotNote[] = [];

  for (const { n, s } of scored) {
    if (s < minScore) continue;
    if (out.some((p) => p.noteId === n.noteId)) continue;

    const preview = extractMomentsPreview(n).slice(0, 20);
    if (seenHeadline.has(preview)) continue;

    seenHeadline.add(preview);
    out.push(n);
    if (out.length >= max) break;
  }
  return out;
}

/** 朋友圈 Tab 专用池：优先新鲜、短平快内容 */
export function filterMomentsNotes(notes: XhsHotNote[], max = 100): XhsHotNote[] {
  const scored = notes
    .map((n) => ({ n, s: scoreMomentsFit(n) }))
    .sort((a, b) => b.s - a.s);

  let pool = pickMomentsPool(scored, 26, max);

  if (pool.length < 8) {
    pool = pickMomentsPool(scored, 18, max);
  }

  if (pool.length < 4) {
    const fallback = scored
      .filter(
        ({ n }) =>
          MOMENTS_CATEGORIES.has(n.category) || n.contentType === "朋友圈文案"
      )
      .map((x) => x.n);
    pool = pickMomentsPool(
      fallback.map((n) => ({ n, s: scoreMomentsFit(n) })),
      10,
      max
    );
  }

  return pool;
}

const MOMENTS_PREVIEW: Record<XhsNoteCategory, string[]> = {
  治愈日常: [
    "今日精神状态：良好",
    "允许自己今天摆烂一下",
    "把生活调成喜欢的频道",
    "普通周末也值得记录",
  ],
  情绪文案: [
    "有些话只适合发给懂的人",
    "今天的情绪写在风里",
    "谁懂啊这一刻真的上头",
  ],
  咖啡生活: [
    "咖啡续命成功",
    "窗边的下午太chill了",
    "今日咖啡因达标",
  ],
  城市生活: [
    "下班路上的城市浪漫",
    "随手一拍都是氛围感",
    "今日citywalk达成",
  ],
  职场嘴替: [
    "打工人今日已上线",
    "工位摸鱼文学",
    "班味有点上头",
  ],
  美食打卡: [
    "今日干饭不积极",
    "碳水快乐谁懂啊",
    "这家真的绝绝子",
  ],
  穿搭变美: ["今日ootd已就位", "简单穿搭也很出片"],
  宠物萌系: ["今日吸猫成就+1", "毛孩子治愈一切"],
  旅行出片: ["周末出逃成功", "在路上收集快乐"],
  朋友圈文案: ["今日状态：快乐在线", "一句话总结今天"],
};

/** 从笔记里抽一句「朋友圈秒发」预览 */
export function extractMomentsPreview(note: XhsHotNote): string {
  const desc = note.desc.trim().replace(/\s+/g, " ");
  if (
    desc.length >= 6 &&
    desc.length <= 40 &&
    !MOMENTS_STALE_HINT.test(desc) &&
    !XHS_STYLE_TEXT_HINT.test(desc)
  ) {
    return desc.slice(0, 32);
  }

  const title = note.title.trim();
  if (
    title.length >= 4 &&
    title.length <= 28 &&
    !MOMENTS_STALE_HINT.test(title) &&
    !XHS_STYLE_TEXT_HINT.test(title)
  ) {
    return title.slice(0, 28);
  }

  const pool = MOMENTS_PREVIEW[note.category] ?? MOMENTS_PREVIEW.朋友圈文案;
  let h = 0;
  const seed = String(note.noteId ?? note.id ?? "note");
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return pool[h % pool.length]!;
}

/** 灵感页 · 发朋友圈：优先 90/00 后语境，排除小红书长图文风 */
export function filterInspirationMomentsNotes(
  notes: XhsHotNote[],
  max = 360
): XhsHotNote[] {
  const scored = notes
    .map((n) => ({ n, s: scoreMomentsFit(n) }))
    .filter(({ n, s }) => {
      const blob = textBlob(n);
      if (XHS_STYLE_TEXT_HINT.test(blob) && s < 50) return false;
      if (MOMENTS_STALE_HINT.test(blob) && s < 38) return false;
      if (MOMENTS_EXCLUDED_CATEGORIES.has(n.category) && s < 40) return false;
      if (n.contentType === "朋友圈文案") return s >= 20;
      if (MOMENTS_FRESH_HINT.test(blob)) return s >= 22;
      if (MOMENTS_CATEGORIES.has(n.category)) return s >= 26;
      return s >= 34;
    })
    .sort((a, b) => b.s - a.s);

  return pickMomentsPool(scored, 20, max);
}

const MOMENTS_VIBE: Record<XhsNoteCategory, string> = {
  治愈日常: "精神状态",
  情绪文案: "谁懂啊",
  城市生活: "citywalk",
  咖啡生活: "chill一下",
  朋友圈文案: "秒发文案",
  职场嘴替: "班味文学",
  美食打卡: "干饭现场",
  宠物萌系: "吸猫时刻",
  穿搭变美: "今日随拍",
  旅行出片: "周末出逃",
};

export function formatMomentsVibeLabel(note: XhsHotNote): string {
  const text = textBlob(note);
  if (/搭子/.test(text)) return "搭子文学";
  if (/演唱会|live|音乐节/i.test(text)) return "演出现场";
  if (/健身|撸铁/.test(text)) return "健身打卡";
  if (/猫|狗|萌宠|毛孩子/.test(text)) return "萌宠日常";
  if (/火锅|烧烤|夜宵|探店|奶茶/.test(text)) return "干饭现场";
  return MOMENTS_VIBE[note.category] ?? "朋友圈体";
}

/** 朋友圈卡片标题前缀（更贴近 90/00 后） */
export function pickMomentsHeadlinePrefix(noteId: string): string {
  const prefixes = [
    "今日状态",
    "秒发文案",
    "搭子文学",
    "氛围感成片",
    "随手一发",
    "i人日记",
    "周末实录",
    "干饭现场",
    "精神状态",
    "深夜碎碎念",
  ];
  let h = 0;
  for (let i = 0; i < noteId.length; i++) h = (h * 31 + noteId.charCodeAt(i)) >>> 0;
  return prefixes[h % prefixes.length]!;
}
