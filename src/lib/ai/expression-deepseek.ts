import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import type { ExpressionGenerateKind } from "@/lib/api/expression/types";

export type ExpressionQuickResult = {
  text: string;
  titles: string[];
  tags: string[];
};

export type ExpressionChatReplyResult = {
  replies: string[];
  analysis: { attitude: string; relation: string; mood: string };
};

function mockQuick(prompt: string): ExpressionQuickResult {
  const p = prompt.slice(0, 24);
  return {
    text: `关于「${p}」\n\n今天不想卷，只想把生活调成喜欢的滤镜。慢一点也没关系，你已经在路上了。`,
    titles: [`${p}｜今天也要好好生活`, `写给${p}的一句温柔`],
    tags: ["生活感", "治愈", "氛围感"],
  };
}

function mockChatReply(prompt: string): ExpressionChatReplyResult {
  return {
    replies: [
      `懂你说的「${prompt.slice(0, 16)}」～要不今晚先歇会儿，明天再细聊？`,
      "哈哈收到，那我先不催你啦，有空喊我～",
    ],
    analysis: { attitude: "友好", relation: "熟悉", mood: "轻松" },
  };
}

function mockEmotion(prompt: string): { text: string; tags: string[] } {
  const slice = prompt.replace(/^\[[^\]]+\]\s*/, "").slice(0, 24);
  return {
    text: slice
      ? `懂你，「${slice}」这件事放谁身上都会不舒服。先别急着怪自己，我在呢，你慢慢说。`
      : "你不是矫情，你只是累了。乱七八糟地说也可以，我听着。",
    tags: ["今日状态：电量不足", "需要抱抱：是的"],
  };
}

function mockPlatform(prompt: string, kind: ExpressionGenerateKind): ExpressionQuickResult {
  const base = mockQuick(prompt);
  if (kind === "xhs_note" || kind === "xhs_title") {
    base.text = `${prompt ? `【${prompt.slice(0, 12)}】` : ""}真实分享｜不踩雷清单\n\n${base.text}\n\n#日常碎片 #好物分享 #生活方式`;
    base.tags = ["小红书", "干货", "生活方式"];
  } else if (kind === "moments" || kind === "wechat_status") {
    base.text = base.text.split("\n\n").slice(-1)[0] ?? base.text;
    base.tags = ["朋友圈", "日常", "氛围感"];
  }
  return base;
}

function systemForKind(kind: ExpressionGenerateKind): string {
  if (kind === "chat_reply") {
    return "你是高情商聊天军师，帮用户回复微信聊天。只输出 JSON：replies(2条可直接复制的回复，口语自然), analysis{attitude, relation, mood}。禁止输出【Mock】【接口预留】等字样。";
  }
  if (kind === "emotion_sign") {
    return "你是年轻人喜欢的情绪树洞搭子。只输出 JSON：text(120字内，像朋友聊天，共情不说教), tags(0-3个可选状态标签如「今日状态：电量不足」)。禁止心理学诊断、专业干预、你应该/你必须。";
  }
  if (kind === "xhs_note" || kind === "xhs_title") {
    return "你是小红书爆款笔记写手，面向90后00后。只输出 JSON：text(正文含适当emoji与分段), titles(2条标题), tags(3个标签无#)。网感、真实、不空洞。";
  }
  if (kind === "moments" || kind === "wechat_status") {
    return "你是朋友圈文案高手，面向90后00后。只输出 JSON：text(60-120字，精炼有画面感), titles(2条备选), tags(3个标签)。禁止营销腔和占位符。";
  }
  return "你是面向90后00后的中文短文案助手，适合朋友圈/状态/多平台。只输出 JSON：text(80-180字，口语有网感), titles(2条), tags(3个标签无#)。禁止【接口预留】【Mock】等字样。";
}

function normalizeQuick(raw: Record<string, unknown>): ExpressionQuickResult {
  const text = String(raw.text ?? "").trim();
  const titles = Array.isArray(raw.titles)
    ? raw.titles.map((t) => String(t)).filter(Boolean).slice(0, 3)
    : [];
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((t) => String(t)).filter(Boolean).slice(0, 5)
    : [];
  return { text: text || "生成完成，可复制使用～", titles, tags };
}

export async function generateExpressionContent(input: {
  kind: ExpressionGenerateKind;
  prompt: string;
  replyTone?: string;
}): Promise<{
  quick?: ExpressionQuickResult;
  chat?: ExpressionChatReplyResult;
  emotion?: { text: string; tags?: string[] };
  usedMock: boolean;
}> {
  const prompt = input.prompt.trim() || "今天想表达点什么";
  const kind = input.kind;

  if (kind === "chat_reply") {
    const { result, usedMock } = await generateWithBudget({
      budget: AI_GENERATE_BUDGET.expression_chat,
      system: systemForKind(kind),
      user: JSON.stringify({ chat: prompt, replyTone: input.replyTone ?? "自然" }),
      mock: () => mockChatReply(prompt) as Record<string, unknown>,
      normalize: (raw) => {
        const replies = Array.isArray(raw.replies)
          ? raw.replies.map((r) => String(r)).filter(Boolean).slice(0, 3)
          : mockChatReply(prompt).replies;
        const a = (raw.analysis as Record<string, unknown>) ?? {};
        return {
          replies,
          analysis: {
            attitude: String(a.attitude ?? "友好"),
            relation: String(a.relation ?? "熟悉"),
            mood: String(a.mood ?? "轻松"),
          },
        } as Record<string, unknown>;
      },
    });
    return { chat: result as unknown as ExpressionChatReplyResult, usedMock };
  }

  if (kind === "emotion_sign") {
    const { parsePersonaFromPrompt, treeholeEmotionSystem } = await import(
      "@/lib/ai/treehole-prompt"
    );
    const { personaId, userText } = parsePersonaFromPrompt(prompt);
    const { normalizeTreeholePersonaId } = await import("@/lib/mock/emotion-treehole");
    const pid = personaId ?? normalizeTreeholePersonaId("comfort");
    const { result, usedMock } = await generateWithBudget({
      budget: AI_GENERATE_BUDGET.expression_emotion,
      system: treeholeEmotionSystem(pid),
      user: JSON.stringify({ message: userText || prompt, mode: pid }),
      mock: () => mockEmotion(prompt) as Record<string, unknown>,
      normalize: (raw) => ({
        text: String(raw.text ?? mockEmotion(prompt).text),
        tags: Array.isArray(raw.tags)
          ? raw.tags.map((t) => String(t)).filter(Boolean).slice(0, 3)
          : [],
      }),
    });
    return {
      emotion: result as { text: string; tags?: string[] },
      usedMock,
    };
  }

  const { result, usedMock } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.expression_quick,
    system: systemForKind(kind),
    user: JSON.stringify({ topic: prompt, platform: kind }),
    mock: () => mockPlatform(prompt, kind) as Record<string, unknown>,
    normalize: (raw) => normalizeQuick(raw),
  });
  return { quick: result as unknown as ExpressionQuickResult, usedMock };
}
