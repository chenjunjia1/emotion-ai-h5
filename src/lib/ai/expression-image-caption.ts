import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";

export type ImageCaptionResult = {
  moments: string;
  xhs: string;
  wechatStatus: string;
  moodScore: number;
};

function mockCaptions(hint: string): ImageCaptionResult {
  const h = hint.trim() || "日常氛围";
  return {
    moments: `关于「${h.slice(0, 16)}」\n今天的光很软，把普通日子也拍成了喜欢的样子。`,
    xhs: `${h.slice(0, 12)}｜氛围感记录 ✨\n把生活过成想要的滤镜，每一帧都值得收藏。`,
    wechatStatus: "慢慢变好 · 今天也要开心",
    moodScore: 86,
  };
}

function normalize(raw: Record<string, unknown>, hint: string): ImageCaptionResult {
  const fallback = mockCaptions(hint);
  const mood = Number(raw.moodScore);
  return {
    moments: String(raw.moments ?? fallback.moments).trim() || fallback.moments,
    xhs: String(raw.xhs ?? fallback.xhs).trim() || fallback.xhs,
    wechatStatus: String(raw.wechatStatus ?? fallback.wechatStatus).trim() || fallback.wechatStatus,
    moodScore: Number.isFinite(mood) ? Math.min(99, Math.max(60, Math.round(mood))) : fallback.moodScore,
  };
}

async function chatVisionCaption(
  imageBase64: string,
  hint: string
): Promise<ImageCaptionResult | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) return null;

  const model = process.env.DEEPSEEK_VISION_MODEL?.trim() || "deepseek-chat";
  const dataUrl = imageBase64.startsWith("data:")
    ? imageBase64
    : `data:image/jpeg;base64,${imageBase64}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_GENERATE_BUDGET.expression_quick.timeoutMs + 2000);

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content:
              "你是识图配文助手，面向90后00后。只输出 JSON：moments(朋友圈60-120字), xhs(小红书正文含emoji), wechatStatus(短状态12字内), moodScore(60-99整数)。口语自然，禁止占位符。",
          },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: dataUrl } },
              {
                type: "text",
                text: hint
                  ? `用户补充：${hint}。请根据图片写多平台文案。`
                  : "请根据图片写朋友圈、小红书、微信状态文案。",
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: 900,
      }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as Record<string, unknown>;
    return normalize(parsed, hint);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function generateImageCaptions(input: {
  hint?: string;
  imageBase64?: string;
}): Promise<{ result: ImageCaptionResult; usedMock: boolean }> {
  const hint = input.hint?.trim() ?? "";

  if (input.imageBase64 && hasDeepSeekKey()) {
    const vision = await chatVisionCaption(input.imageBase64, hint);
    if (vision) return { result: vision, usedMock: false };
  }

  const { result, usedMock } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.expression_quick,
    system:
      "你是识图配文助手（用户已选图）。根据场景描述写多平台文案。只输出 JSON：moments, xhs, wechatStatus, moodScore(60-99)。",
    user: JSON.stringify({ scene: hint || "生活氛围感日常", note: "用户已上传图片" }),
    mock: () => mockCaptions(hint) as Record<string, unknown>,
    normalize: (raw) => normalize(raw, hint) as unknown as Record<string, unknown>,
  });

  return { result: result as unknown as ImageCaptionResult, usedMock };
}
