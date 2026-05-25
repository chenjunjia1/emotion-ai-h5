import { displayField } from "@/lib/ai/normalize-ai-result";

export type MomentsCopyItem = {
  id: string;
  label: string;
  category: string;
  content: string;
};

export type MomentsImageSuggestion = {
  category: string;
  scene: string;
  style: string;
  keywords: string;
};

export type MomentsGridSlot = {
  slot: number;
  title: string;
  content: string;
};

export type MomentsCommentReply = {
  comment: string;
  reply: string;
};

export type MomentsPublishTime = {
  recommended: string;
  reason: string;
  otherSlots: { time: string; suitable: string }[];
};

export type MomentsPackResult = {
  packType: "moments";
  platform: string;
  topic: string;
  momentsCopies: MomentsCopyItem[];
  imageSuggestions: MomentsImageSuggestion[];
  gridSuggestions: MomentsGridSlot[];
  emojiVersions: { simple: string; cute: string; premium: string };
  commentReplies: MomentsCommentReply[];
  publishTime: MomentsPublishTime;
  recommendedTitle?: string;
  script30s?: string;
  coverCopy?: string;
  firstComment?: string;
  tags?: string[];
};

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

export function mockMomentsPack(input: {
  topic: string;
  contentTypes?: string[];
  directions?: string[];
  extraNote?: string;
}): MomentsPackResult {
  const topic = input.topic || "今日分享";
  const note = input.extraNote?.trim();

  return {
    packType: "moments",
    platform: "朋友圈",
    topic,
    momentsCopies: [
      {
        id: "life",
        label: "生活分享版",
        category: "生活分享",
        content: note
          ? `关于「${topic.slice(0, 12)}」的小记录。\n${note.slice(0, 40)}\n\n生活就是一半烟火，一半清欢。\n今天的快乐是自己给的，\n认真生活，好好爱自己 ❤️`
          : `生活就是一半烟火，一半清欢。\n今天的快乐是自己给的，\n认真生活，好好爱自己 ❤️`,
      },
      {
        id: "emotion",
        label: "情绪价值版",
        category: "情绪价值",
        content: `有时候，我们需要的不是答案，\n而是一个拥抱和一句"我懂你"。\n关于${topic.slice(0, 10)}，\n慢慢来，一切都会好起来的 🌱`,
      },
      {
        id: "seed",
        label: "种草带货版",
        category: "种草带货",
        content: `最近发现一个宝藏！\n和「${topic.slice(0, 12)}」有关，\n真的太好用了，忍不住想分享给你们，\n需要的姐妹可以冲👇`,
      },
    ],
    imageSuggestions: [
      {
        category: "生活分享版",
        scene: "适合日常记录、旅行、美食、心情分享",
        style: "自然光、生活感、不过度修图",
        keywords: "咖啡、窗边、阳光、手账、街景",
      },
      {
        category: "种草带货版",
        scene: "适合产品展示、探店、好物分享",
        style: "清晰特写 + 使用场景",
        keywords: "产品特写、使用前后、场景摆拍、细节图",
      },
      {
        category: "情绪价值版",
        scene: "适合情绪表达、成长感悟、治愈心灵",
        style: "柔和色调、留白构图",
        keywords: "天空、花草、背影、书本、夕阳",
      },
    ],
    gridSuggestions: [
      { slot: 1, title: "主视觉图", content: "最能代表主题的一张图，抓眼球" },
      { slot: 2, title: "生活场景", content: "日常环境或真实使用场景" },
      { slot: 3, title: "细节展示", content: "产品/物品细节特写" },
      { slot: 4, title: "使用过程", content: "步骤或体验过程" },
      { slot: 5, title: "情绪氛围", content: "氛围感空镜或情绪图" },
      { slot: 6, title: "对比图", content: "前后对比或使用效果" },
      { slot: 7, title: "文字截图", content: "金句或重点信息" },
      { slot: 8, title: "补充说明", content: "参数、价格或补充信息" },
      { slot: 9, title: "引导互动", content: "提问或引导评论/私信" },
    ],
    emojiVersions: {
      simple: "今天的快乐很简单。\n一杯咖啡，一点阳光，一份好心情。",
      cute: "今天也是被生活治愈的一天呀～\n咖啡好喝，阳光刚好，心情也刚刚好 ☕️🌞",
      premium: "把日子过慢一点，\n把喜欢的瞬间留久一点。",
    },
    commentReplies: [
      {
        comment: "这个真的太棒了，求链接！",
        reply: "哈哈我也是真的很喜欢，晚点整理发你～",
      },
      {
        comment: "请问在哪里买呀？想入手～",
        reply: "我私你呀，怕评论区说不清楚～",
      },
      {
        comment: "写得太好了，太有共鸣了 👍",
        reply: "谢谢你呀，希望你今天也被温柔对待～",
      },
    ],
    publishTime: {
      recommended: "周二 12:00-13:00",
      reason: "根据你选择的内容类型，建议在午休时间发布，朋友圈用户更容易看到，也更适合轻互动。",
      otherSlots: [
        { time: "早上 8:00-9:00", suitable: "适合生活分享、早安文案" },
        { time: "中午 12:00-13:00", suitable: "适合种草、好物、探店" },
        { time: "晚上 20:00-22:00", suitable: "适合情绪价值、生活感悟、私域引流" },
      ],
    },
    recommendedTitle: topic.slice(0, 20),
    script30s: "",
    coverCopy: topic.slice(0, 15),
    firstComment: "",
    tags: [],
  };
}

export function normalizeMomentsPackResult(
  raw: Record<string, unknown>,
  input: {
    topic: string;
    contentTypes?: string[];
    directions?: string[];
    extraNote?: string;
  }
): MomentsPackResult {
  const fallback = mockMomentsPack(input);
  const o = raw;

  const copiesRaw = o.momentsCopies ?? o.copies ?? o.朋友圈文案;
  let momentsCopies = fallback.momentsCopies;
  if (Array.isArray(copiesRaw) && copiesRaw.length > 0) {
    momentsCopies = copiesRaw.map((item, i) => {
      if (typeof item === "string") {
        return {
          id: `copy-${i}`,
          label: fallback.momentsCopies[i]?.label ?? `文案 ${i + 1}`,
          category: fallback.momentsCopies[i]?.category ?? "生活分享",
          content: item,
        };
      }
      const row = item as Record<string, unknown>;
      return {
        id: pickString(row, ["id"]) ?? `copy-${i}`,
        label: pickString(row, ["label", "版本", "title"]) ?? fallback.momentsCopies[i]?.label ?? `文案 ${i + 1}`,
        category: pickString(row, ["category", "类型", "type"]) ?? fallback.momentsCopies[i]?.category ?? "生活分享",
        content: pickString(row, ["content", "文案", "text"]) ?? fallback.momentsCopies[i]?.content ?? "",
      };
    });
  }

  const imageRaw = o.imageSuggestions ?? o.配图建议;
  let imageSuggestions = fallback.imageSuggestions;
  if (Array.isArray(imageRaw) && imageRaw.length > 0) {
    imageSuggestions = imageRaw.map((item, i) => {
      const row = typeof item === "object" && item ? (item as Record<string, unknown>) : {};
      return {
        category: pickString(row, ["category", "版本"]) ?? fallback.imageSuggestions[i]?.category ?? "",
        scene: pickString(row, ["scene", "适合场景", "场景"]) ?? fallback.imageSuggestions[i]?.scene ?? "",
        style: pickString(row, ["style", "图片风格", "风格"]) ?? fallback.imageSuggestions[i]?.style ?? "",
        keywords: pickString(row, ["keywords", "配图关键词", "关键词"]) ?? fallback.imageSuggestions[i]?.keywords ?? "",
      };
    });
  }

  const gridRaw = o.gridSuggestions ?? o.九宫格;
  let gridSuggestions = fallback.gridSuggestions;
  if (Array.isArray(gridRaw) && gridRaw.length > 0) {
    gridSuggestions = gridRaw.map((item, i) => {
      const row = typeof item === "object" && item ? (item as Record<string, unknown>) : {};
      return {
        slot: typeof row.slot === "number" ? row.slot : i + 1,
        title: pickString(row, ["title", "label", "位置"]) ?? fallback.gridSuggestions[i]?.title ?? `第${i + 1}张`,
        content: pickString(row, ["content", "内容", "建议"]) ?? fallback.gridSuggestions[i]?.content ?? "",
      };
    });
  }

  const emojiRaw = (o.emojiVersions ?? o.表情优化) as Record<string, unknown> | undefined;
  const emojiVersions = {
    simple: pickString(emojiRaw ?? {}, ["simple", "简洁版"]) ?? fallback.emojiVersions.simple,
    cute: pickString(emojiRaw ?? {}, ["cute", "可爱版"]) ?? fallback.emojiVersions.cute,
    premium: pickString(emojiRaw ?? {}, ["premium", "高级感版"]) ?? fallback.emojiVersions.premium,
  };

  const repliesRaw = o.commentReplies ?? o.评论互动回复;
  let commentReplies = fallback.commentReplies;
  if (Array.isArray(repliesRaw) && repliesRaw.length > 0) {
    commentReplies = repliesRaw.map((item, i) => {
      if (typeof item === "string") {
        return { comment: `评论 ${i + 1}`, reply: item };
      }
      const row = item as Record<string, unknown>;
      return {
        comment: pickString(row, ["comment", "评论", "question"]) ?? fallback.commentReplies[i]?.comment ?? "",
        reply: pickString(row, ["reply", "回复", "answer"]) ?? fallback.commentReplies[i]?.reply ?? "",
      };
    });
  }

  const ptRaw = (o.publishTime ?? o.发布时间建议) as Record<string, unknown> | undefined;
  const otherRaw = ptRaw?.otherSlots ?? ptRaw?.其他时间段;
  let otherSlots = fallback.publishTime.otherSlots;
  if (Array.isArray(otherRaw) && otherRaw.length > 0) {
    otherSlots = otherRaw.map((item, i) => {
      const row = typeof item === "object" && item ? (item as Record<string, unknown>) : {};
      return {
        time: pickString(row, ["time", "时间"]) ?? fallback.publishTime.otherSlots[i]?.time ?? "",
        suitable: pickString(row, ["suitable", "适合", "说明"]) ?? fallback.publishTime.otherSlots[i]?.suitable ?? "",
      };
    });
  }

  return {
    ...fallback,
    packType: "moments",
    platform: "朋友圈",
    topic: pickString(o, ["topic", "主题"]) ?? input.topic,
    momentsCopies,
    imageSuggestions,
    gridSuggestions,
    emojiVersions,
    commentReplies,
    publishTime: {
      recommended: pickString(ptRaw ?? {}, ["recommended", "推荐时间"]) ?? fallback.publishTime.recommended,
      reason: pickString(ptRaw ?? {}, ["reason", "说明", "原因"]) ?? fallback.publishTime.reason,
      otherSlots,
    },
  };
}

export function isMomentsPack(pack: Record<string, unknown>): boolean {
  return pack.packType === "moments" || pack.platform === "朋友圈";
}

export function formatMomentsCopyAll(pack: Record<string, unknown>): string {
  const copies = (pack.momentsCopies as MomentsCopyItem[]) ?? [];
  const images = (pack.imageSuggestions as MomentsImageSuggestion[]) ?? [];
  const replies = (pack.commentReplies as MomentsCommentReply[]) ?? [];
  const pt = pack.publishTime as MomentsPublishTime | undefined;

  const sections = [
    "【朋友圈文案】",
    ...copies.map((c, i) => `${i + 1}. ${c.label}\n${c.content}`),
    "",
    "【配图建议】",
    ...images.map((g) => `${g.category}\n场景：${g.scene}\n风格：${g.style}\n关键词：${g.keywords}`),
    "",
    "【评论互动回复】",
    ...replies.map((r, i) => `${i + 1}. ${r.comment}\n回复：${r.reply}`),
    "",
    "【发布时间建议】",
    pt ? `${pt.recommended}\n${pt.reason}` : displayField(pack.publishTime),
  ];
  return sections.filter(Boolean).join("\n");
}
