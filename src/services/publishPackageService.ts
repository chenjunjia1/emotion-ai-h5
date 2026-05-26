/**
 * AI 发布包 — 服务端编排
 */

import { chatJsonBudget, generateWithBudget } from "@/lib/ai/generate-budget";
import { hasDeepSeekKey } from "@/lib/ai/deepseek";
import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import { normalizePublishAdvice } from "@/lib/publish-pack/publish-advice";
import { inferContentGuess } from "@/lib/publish-pack/infer-guess";
import { mockQuickPublishPackage } from "@/lib/publish-pack/mock-quick-package";
import { buildImagePromptEn } from "@/lib/publish-pack/prompt-builder";
import { buildScenePreviewZh } from "@/lib/publish-pack/scene-preview";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type {
  AdvancedPreferences,
  ContentGuess,
  PackageBody,
  PackageTitle,
  QuickPublishPackage,
  RestyleOption,
  ViralScoreBreakdown,
} from "@/lib/publish-pack/quick-package-types";
import {
  generateAdvancedImages,
  generatePackageImages,
} from "@/services/imageService";

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}`;
}

function calcViralScore(
  topic: string,
  guess: ContentGuess,
  titles: PackageTitle[],
  full = false
): ViralScoreBreakdown {
  const base = 70 + Math.min(22, topic.length % 20) + (titles[0]?.text.includes("？") ? 4 : 0);
  const total = Math.min(96, base);
  const quick = {
    total,
    titleClick: Math.min(98, total + 2),
    emotionResonance: Math.min(98, total + 4),
    commentInteraction: full ? Math.min(95, total - 3) : Math.min(95, total - 2),
    platformMatch: full ? Math.min(98, total + 1) : Math.min(90, total),
    publishTimeMatch: Math.min(94, total - 1),
    stars: Math.min(5, Math.max(3, Math.round(total / 20))),
    highlights: full
      ? [
          "🔥 现在发也合适",
          "🔥 容易引发评论",
          `🔥 适合${guess.platform}的爆款结构`,
        ]
      : [
          "🔥 随时可发",
          "🔥 容易引发评论",
          "🔥 松弛感热门结构",
        ],
  };
  return quick;
}

function normalizeQuickPack(
  raw: Record<string, unknown>,
  topic: string,
  guess: ContentGuess,
  mode: "quick" | "advanced",
  prefs?: AdvancedPreferences
): Omit<QuickPublishPackage, "images" | "packageId"> {
  const titlesRaw = (raw.titles as string[]) ?? [];
  const bodiesRaw = (raw.bodies as string[]) ?? (raw.copies as string[]) ?? [];
  const tags = ((raw.tags as string[]) ?? []).map((t) =>
    t.startsWith("#") ? t : `#${t}`
  );

  const titles: PackageTitle[] = (titlesRaw.length ? titlesRaw : [topic]).slice(0, 5).map(
    (text, i) => ({ id: `t${i}`, text: String(text) })
  );

  const bodies: PackageBody[] = (bodiesRaw.length ? bodiesRaw : [String(raw.body ?? "")])
    .filter(Boolean)
    .slice(0, 3)
    .map((text, i) => ({ id: `b${i}`, text: String(text) }));

  const publishAdvice = normalizePublishAdvice({
    platform: String(raw.publishPlatform ?? guess.platform),
    bestTime: String(raw.bestTime ?? ""),
    audience: String(raw.audience ?? ""),
    commentHook: String(raw.commentHook ?? ""),
  });

  const viralScore = calcViralScore(topic, guess, titles, mode === "advanced");
  const coverTexts = ((raw.coverTexts as string[]) ?? []).slice(0, 5);

  return {
    topic,
    mode,
    guess,
    viralScore,
    titles,
    bodies: bodies.length ? bodies : mockQuickPublishPackage({ topic, guess }).bodies,
    tags: tags.length >= 5 ? tags.slice(0, 10) : mockQuickPublishPackage({ topic, guess }).tags,
    coverText: {
      main: String(raw.coverMain ?? titles[0]?.text.slice(0, 16) ?? topic.slice(0, 16)),
      sub: String(raw.coverSub ?? guess.contentStyle),
      layoutTip: String(raw.coverLayout ?? "主标题居中，副标题放底部，留安全边距"),
    },
    coverTexts: coverTexts.length
      ? coverTexts
      : [
          String(raw.coverMain ?? titles[0]?.text.slice(0, 12)),
          String(raw.coverSub ?? guess.contentStyle),
          "大字主标题 + 小字副标题",
          "留白上方放人物/场景",
          "适合小红书 3:4 封面",
        ],
    publishAdvice,
    imagePromptEn: buildImagePromptEn(topic, guess, prefs),
    scenePreviewZh: buildScenePreviewZh(topic, guess, prefs),
    preferences: prefs,
  };
}

async function generatePackageText(input: {
  topic: string;
  guess: ContentGuess;
  mode: "quick" | "advanced";
  extraNote?: string;
  prefs?: AdvancedPreferences;
}): Promise<{ partial: Omit<QuickPublishPackage, "images" | "packageId">; usedMock: boolean }> {
  const { topic, guess, mode, extraNote, prefs } = input;

  const userPayload = {
    topic,
    platform: guess.platform,
    personality: guess.personality,
    contentStyle: guess.contentStyle,
    goal: guess.goal,
    imageStyle: guess.imageStyle,
    extraNote: extraNote ?? "",
    preferences: prefs,
    mode,
  };

  const { result, usedMock } = await generateWithBudget({
    budget: { ...AI_GENERATE_BUDGET.publish_pack, maxTokens: mode === "advanced" ? 1800 : 1600 },
    system:
      mode === "advanced"
        ? "你是小红书/朋友圈爆款内容教练。只输出 JSON：titles(5), bodies(3,换行\\n), tags(10含#), coverTexts(5条封面文案短语), publishPlatform, bestTime, audience, commentHook, coverMain, coverSub, coverLayout。bestTime 写「更容易被刷到的参考时段」，须包含「现在就能发」的意思，禁止写「只能/必须某时发」。语气自然可直发。"
        : "你是小红书/短视频爆款内容教练。只输出 JSON：titles(5), bodies(3,换行\\n), tags(10含#), publishPlatform, bestTime, audience, commentHook。bestTime 须让用户感觉随时可发，只作流量参考。语气自然可直发。",
    user: JSON.stringify(userPayload),
    mock: () => {
      const m = mockQuickPublishPackage({ topic, guess, mode });
      return {
        titles: m.titles.map((t) => t.text),
        bodies: m.bodies.map((b) => b.text),
        tags: m.tags,
        coverTexts: m.coverTexts,
        publishPlatform: m.publishAdvice.platform,
        bestTime: m.publishAdvice.bestTime,
        audience: m.publishAdvice.audience,
        commentHook: m.publishAdvice.commentHook,
        coverMain: m.coverText.main,
        coverSub: m.coverText.sub,
        coverLayout: m.coverText.layoutTip,
      } as Record<string, unknown>;
    },
  });

  return {
    partial: normalizeQuickPack(result, topic, guess, mode, prefs),
    usedMock,
  };
}

/** 高级模式文案：与出图并行，用更长超时拿真实 DeepSeek 结果（不走 2s 快返 mock） */
async function generatePackageTextAdvanced(input: {
  topic: string;
  guess: ContentGuess;
  extraNote?: string;
  prefs?: AdvancedPreferences;
}): Promise<{ partial: Omit<QuickPublishPackage, "images" | "packageId">; usedMock: boolean }> {
  const { topic, guess, extraNote, prefs } = input;
  const mockRaw = () => {
    const m = mockQuickPublishPackage({ topic, guess, mode: "advanced" });
    return {
      titles: m.titles.map((t) => t.text),
      bodies: m.bodies.map((b) => b.text),
      tags: m.tags,
      coverTexts: m.coverTexts,
      publishPlatform: m.publishAdvice.platform,
      bestTime: m.publishAdvice.bestTime,
      audience: m.publishAdvice.audience,
      commentHook: m.publishAdvice.commentHook,
      coverMain: m.coverText.main,
      coverSub: m.coverText.sub,
      coverLayout: m.coverText.layoutTip,
    } as Record<string, unknown>;
  };

  if (!hasDeepSeekKey()) {
    return {
      partial: normalizeQuickPack(mockRaw(), topic, guess, "advanced", prefs),
      usedMock: true,
    };
  }

  try {
    const raw = await chatJsonBudget(
      "你是小红书/朋友圈爆款内容教练。只输出 JSON：titles(5), bodies(3,换行\\n), tags(10含#), coverTexts(5条封面文案短语), publishPlatform, bestTime, audience, commentHook, coverMain, coverSub, coverLayout。bestTime 写更容易被刷到的参考时段，须含「现在就能发」之意，禁止「只能/必须某时发」。语气自然可直发。",
      JSON.stringify({
        topic,
        platform: guess.platform,
        personality: guess.personality,
        contentStyle: guess.contentStyle,
        goal: guess.goal,
        extraNote: extraNote ?? "",
        preferences: prefs,
        mode: "advanced",
      }),
      { maxTokens: 1500, timeoutMs: 45_000, temperature: 0.65 }
    );
    return {
      partial: normalizeQuickPack(raw, topic, guess, "advanced", prefs),
      usedMock: false,
    };
  } catch {
    return {
      partial: normalizeQuickPack(mockRaw(), topic, guess, "advanced", prefs),
      usedMock: true,
    };
  }
}

/** 快速出文案 — 不生成图片 */
export async function generateQuickPackage(input: {
  topic: string;
  guess?: ContentGuess;
  extraNote?: string;
}): Promise<{ package: QuickPublishPackage; usedMock: boolean }> {
  const topic = input.topic.trim();
  const guess = input.guess ?? inferContentGuess(topic);
  const { partial, usedMock } = await generatePackageText({
    topic,
    guess,
    mode: "quick",
    extraNote: input.extraNote,
  });

  return {
    package: {
      packageId: uid("pkg"),
      ...partial,
      mode: "quick",
      images: [],
      imageCount: undefined,
    },
    usedMock,
  };
}

/** 高级图文包 — 按张数生成真实感图片 */
export async function generateAdvancedPackage(input: {
  topic: string;
  guess?: ContentGuess;
  imageCount?: ImageCountOption;
  extraNote?: string;
  preferences?: AdvancedPreferences;
  scenePreviewZh?: string;
}): Promise<{ package: QuickPublishPackage; usedMock: boolean }> {
  const topic = input.topic.trim();
  const guess = input.guess ?? inferContentGuess(topic);
  const imageCount = input.imageCount ?? 1;
  const prefs = input.preferences;

  const [{ partial, usedMock }, images] = await Promise.all([
    generatePackageTextAdvanced({
      topic,
      guess,
      extraNote: input.extraNote,
      prefs,
    }),
    generateAdvancedImages({
      topic,
      guess,
      count: imageCount,
      prefs,
    }),
  ]);

  return {
    package: {
      packageId: uid("pkg"),
      ...partial,
      mode: "advanced",
      images,
      imageCount,
      scenePreviewZh: input.scenePreviewZh ?? partial.scenePreviewZh,
      preferences: prefs,
    },
    usedMock,
  };
}

/** 兼容旧 API：按 mode 分发 */
export async function generatePublishPackage(input: {
  topic: string;
  guess?: ContentGuess;
  mode?: "quick" | "advanced";
  imageCount?: ImageCountOption;
  extraNote?: string;
  preferences?: AdvancedPreferences;
  scenePreviewZh?: string;
}): Promise<{ package: QuickPublishPackage; usedMock: boolean }> {
  if (input.mode === "advanced") {
    return generateAdvancedPackage(input);
  }
  return generateQuickPackage(input);
}

export async function enhanceUserInput(input: {
  topic: string;
  mode: "quick" | "advanced";
  guess?: ContentGuess;
  preferences?: AdvancedPreferences;
}): Promise<string> {
  const topic = input.topic.trim();
  const guess = input.guess ?? inferContentGuess(topic);

  const { result } = await generateWithBudget({
    budget: { maxTokens: 500, timeoutMs: 8000 },
    system:
      "你是内容创作助手。把用户的简短想法扩写成完整创作意图（中文，2-4句）。包含：主题、情绪、场景、语气、适合平台。不要输出 JSON，不要提提示词。",
    user: JSON.stringify({
      topic,
      mode: input.mode,
      guess,
      preferences: input.preferences,
    }),
    mock: () => ({
      enhanced:
        input.mode === "quick"
          ? `${topic}。想表达一种慢下来、治愈自己、生活还有一点光的感觉。适合小红书或朋友圈，语气温柔真实，不要太鸡汤，像普通人下班后的生活记录。`
          : `主题是${topic}。希望表达忙了一天后慢慢放松的感觉，适合小红书/朋友圈，语气温柔有生活感。图片像朋友用 iPhone 随手拍，场景可以是夜晚房间、窗边、热饮，自然不摆拍，不要 AI 感。`,
    }),
  });

  const text = String((result as { enhanced?: string }).enhanced ?? "").trim();
  if (text) return text;

  return input.mode === "quick"
    ? `${topic}。想表达治愈、松弛、真实的生活感，适合小红书或朋友圈，语气温柔不鸡汤。`
    : `${topic}。适合小红书/朋友圈，语气真实有生活感；图片像 iPhone 随手拍，暖光生活细节，不要 AI 感。`;
}

export async function upgradeAdvancedPackage(input: {
  pkg: QuickPublishPackage;
  targetCount: ImageCountOption;
}): Promise<QuickPublishPackage> {
  const current = input.pkg.images.length;
  const target = input.targetCount;
  if (target <= current) return input.pkg;

  const more = await generateAdvancedImages({
    topic: input.pkg.topic,
    guess: input.pkg.guess,
    count: target,
    prefs: input.pkg.preferences,
    promptOverride: input.pkg.imagePromptEn,
    existingUrls: input.pkg.images.map((i) => i.url),
  });

  return {
    ...input.pkg,
    images: more,
    imageCount: target,
  };
}

export async function generateTitles(topic: string, guess: ContentGuess): Promise<PackageTitle[]> {
  const { result } = await generateWithBudget({
    budget: { maxTokens: 400, timeoutMs: 2000 },
    system: "只输出 JSON：titles 数组5条",
    user: JSON.stringify({ topic, platform: guess.platform }),
    mock: () => ({
      titles: mockQuickPublishPackage({ topic, guess }).titles.map((t) => t.text),
    }),
  });
  const list = (result.titles as string[]) ?? [];
  return list.slice(0, 5).map((text, i) => ({ id: `t${i}`, text }));
}

export async function generateCopywriting(
  topic: string,
  guess: ContentGuess
): Promise<PackageBody[]> {
  const { result } = await generateWithBudget({
    budget: { maxTokens: 900, timeoutMs: 2000 },
    system: "只输出 JSON：bodies 数组3段正文",
    user: JSON.stringify({ topic, guess }),
    mock: () => ({
      bodies: mockQuickPublishPackage({ topic, guess }).bodies.map((b) => b.text),
    }),
  });
  const list = (result.bodies as string[]) ?? [];
  return list.slice(0, 3).map((text, i) => ({ id: `b${i}`, text }));
}

export function calculateViralScore(
  topic: string,
  guess: ContentGuess,
  titles: PackageTitle[],
  full = false
): ViralScoreBreakdown {
  return calcViralScore(topic, guess, titles, full);
}

export async function restylePackageCopy(input: {
  topic: string;
  guess: ContentGuess;
  style: RestyleOption;
  bodies: PackageBody[];
}): Promise<PackageBody[]> {
  const { result } = await generateWithBudget({
    budget: { maxTokens: 1100, timeoutMs: 2000 },
    system:
      "你是文案改写专家。只输出 JSON：bodies(3段)。保持主题不变，按用户指定风格改写。",
    user: JSON.stringify({
      topic: input.topic,
      style: input.style,
      guess: input.guess,
      original: input.bodies.map((b) => b.text),
    }),
    mock: () => ({
      bodies: input.bodies.map((b) => `【${input.style}】\n${b.text}`),
    }),
  });
  const list = (result.bodies as string[]) ?? [];
  return list.slice(0, 3).map((text, i) => ({ id: `b${i}`, text: String(text) }));
}

export async function savePackage(_packageId: string): Promise<{ saved: boolean }> {
  return { saved: true };
}
