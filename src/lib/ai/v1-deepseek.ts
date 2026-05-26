import {
  normalizePublishPackResult,
  normalizeReviewResult,
  normalizeTitleGachaResult,
  normalizeTopicBoxResult,
} from "@/lib/ai/normalize-ai-result";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import {
  mockAccountPersonalityTest,
  mockEmotionChat,
  mockOperationConsultant,
  mockGodReplies,
  mockPostReview,
  mockPublishPack,
  mockTitleGacha,
  mockTopicBlindBox,
  mockViralScore,
} from "@/lib/mock/content-v1";
import { mockMomentsPack, normalizeMomentsPackResult } from "@/lib/publish-pack/moments-result";
import {
  mockAccountPackage,
  mockDailyVideo,
  mockViralCopy,
} from "@/lib/mock/v1-generators";

export async function generateAccountPackage(input: {
  platform: string;
  track: string;
  goal: string;
  style: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.account,
    system:
      "你是短视频起号顾问。只输出 JSON：positioning, audience, persona, names(5个), bios(3个), pillars(3个), hooks(3个), firstWeekPlan(对象含day1-day3每天title和tasks数组), riskTips(2条)。简短有力。",
    user: JSON.stringify(input),
    mock: () => mockAccountPackage(input) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generateDailyVideo(topic: string): Promise<{
  result: Record<string, unknown>;
  usedMock: boolean;
  fastPath?: boolean;
}> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.daily,
    system:
      "你是短视频脚本策划。只输出 JSON：title, hook, outline(3条), script(口播约150字), shots(3项含scene和line), cta, hashtags(5个)。",
    user: `选题：${topic}`,
    mock: () => mockDailyVideo(topic) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generateViralCopy(
  title: string,
  copy: string
): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.viral,
    system:
      "你是爆款文案改写专家。只输出 JSON：analysis(对象含reason和hook), rewrites(数组2项含title和copy), hooks(3个), comments(3条), risks(1条)。",
    user: JSON.stringify({ title, copy }),
    mock: () => mockViralCopy(title, copy) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generatePublishPack(input: {
  topic: string;
  platform: string;
  track: string;
  goal: string;
  style: string;
  withXhs?: boolean;
  extraNote?: string;
  accountType?: string;
  momentsContentTypes?: string[];
  momentsDirections?: string[];
  hotTopicContext?: {
    topicId?: string;
    summary?: string;
    angles?: unknown;
    targetUsers?: unknown;
  };
  inspirationRewriteOnly?: boolean;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const isMoments = input.platform === "朋友圈";
  const hotCtx = input.hotTopicContext;
  const rewriteHint = input.inspirationRewriteOnly
    ? "【重要】用户仅提供小红书热门灵感方向，你必须完全原创改写，禁止复用、抄袭或近似照搬任何原文标题/正文/标签。图片建议使用用户自拍或 Pexels 素材，勿直接使用小红书原图。"
    : "";
  const userPayload = {
    topic: input.topic,
    platform: input.platform,
    track: input.track,
    goal: input.goal,
    style: input.style,
    withXhs: input.withXhs,
    extraNote: input.extraNote,
    accountType: input.accountType,
    momentsContentTypes: input.momentsContentTypes,
    momentsDirections: input.momentsDirections,
    hotTopicSummary: hotCtx?.summary,
    hotTopicAngles: hotCtx?.angles,
    hotTopicTargetUsers: hotCtx?.targetUsers,
  };

  const budget = isMoments
    ? { ...AI_GENERATE_BUDGET.publish_pack, maxTokens: 1500 }
    : input.topic.length > 20
      ? AI_GENERATE_BUDGET.publish_pack
      : { ...AI_GENERATE_BUDGET.publish_pack, maxTokens: 1200 };

  if (isMoments) {
    const { result, usedMock, fastPath } = await generateWithBudget({
      budget,
      system:
        "你是朋友圈文案和私域运营专家。只输出 JSON：packType(moments), topic, platform(朋友圈), momentsCopies(3条含label/category/content), imageSuggestions(3组含category/scene/style/keywords), gridSuggestions(9条含slot/title/content), emojiVersions(simple/cute/premium), commentReplies(3条含comment/reply), publishTime(recommended/reason/otherSlots数组含time/suitable)。文案自然口语化，适合微信朋友圈，可直接复制。",
      user: JSON.stringify(userPayload),
      mock: () =>
        mockMomentsPack({
          topic: input.topic,
          contentTypes: input.momentsContentTypes,
          directions: input.momentsDirections,
          extraNote: input.extraNote,
        }) as unknown as Record<string, unknown>,
      normalize: (raw) =>
        normalizeMomentsPackResult(raw, {
          topic: input.topic,
          contentTypes: input.momentsContentTypes,
          directions: input.momentsDirections,
          extraNote: input.extraNote,
        }) as unknown as Record<string, unknown>,
    });
    return { result, usedMock, fastPath };
  }

  const { result, usedMock, fastPath } = await generateWithBudget({
    budget,
    system:
      `${rewriteHint}你是短视频运营教练。只输出 JSON：packName, topic, platform, track, titles(3条), recommendedTitle, script30s(约120字口播), xhsNote(可选80字), coverCopy, firstComment, commentReplies(3条), tags(10个话题标签), publishTime, publishTips, shootTips(拍摄画面建议), imageSuggestions(3条文字建议，勿引用小红书原图), safetyScore(数字), safetyLevel。结合热点解读与切入方向创作。`,
    user: JSON.stringify(userPayload),
    mock: () => mockPublishPack(input) as Record<string, unknown>,
    normalize: (raw) => normalizePublishPackResult(raw, input),
  });
  return { result, usedMock, fastPath };
}

export async function generateTopicBox(input: {
  platform: string;
  track: string;
  goal: string;
  style: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.topic_box,
    system:
      "你是短视频选题策划。只输出 JSON：topic, format, track, angle, titleHint, whyToday, platform, goal, style。每项一句话。",
    user: JSON.stringify(input),
    mock: () => mockTopicBlindBox(input) as Record<string, unknown>,
    normalize: (raw) => normalizeTopicBoxResult(raw, input),
  });
  return { result, usedMock, fastPath };
}

export async function generateTitleGacha(input: {
  platform: string;
  track: string;
  theme: string;
  style: string;
  goal: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.title_gacha,
    system:
      "你是爆款标题专家。只输出 JSON：titles(数组5项含text和type), recommendedIndex, recommended, reason。",
    user: JSON.stringify(input),
    mock: () => mockTitleGacha(input) as Record<string, unknown>,
    normalize: (raw) => normalizeTitleGachaResult(raw, input),
  });
  return { result, usedMock, fastPath };
}

export async function generateEmotionChat(input: {
  chat: string;
  relationship: string;
  goal: string;
  style: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.emotion_chat,
    system:
      "你是短视频账号运营顾问，专门帮助用户做抖音、小红书、视频号起号和内容优化。只输出 JSON：analysis(200字内口语化分析), todayTopics(3条今日建议选题字符串数组), titleSuggestions(3条标题), contentStructure(3条内容结构建议), publishTips(2条发布建议), recommendPublishPack(布尔), recommendHotTopic(一条热点选题或空字符串)。回答要具体实用，可主动推荐生成发布包或查看今日热点。",
    user: JSON.stringify(input),
    mock: () => mockOperationConsultant(input) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generatePostReview(input: Record<string, string | number>): Promise<{
  result: Record<string, unknown>;
  usedMock: boolean;
  fastPath?: boolean;
}> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.review,
    system:
      "你是短视频数据复盘教练。只输出 JSON：performanceScore(0-99), titleScore, pacingScore, interactionScore, titleScoreLabel(好/一般/偏低), pacingScoreLabel, interactionScoreLabel, advantages(主要优点一句话), coreProblems(核心问题一句话), summary, problems(2-3条), nextSuggestion, nextTopic, engagementRate(数字), hookAdvice, publishTimeAdvice, titleAdvice。",
    user: JSON.stringify(input),
    mock: () => mockPostReview(input) as Record<string, unknown>,
    normalize: (raw) => normalizeReviewResult(raw as Record<string, unknown>),
  });
  return { result, usedMock, fastPath };
}

export async function generateViralScore(input: {
  title: string;
  script: string;
  xhs?: string;
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.score,
    system:
      "你是短视频爆款潜力分析师。只输出 JSON：totalScore(0-99整数), hookScore, emotionScore, commentScore, riskLevel(低/中/高), tips(3条字符串), proTips(2条字符串)。",
    user: JSON.stringify(input),
    mock: () => mockViralScore(input) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generateAccountPersonalityTest(
  answers: Record<string, string>
): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.account_test,
    system:
      "你是短视频起号顾问。根据问卷答案只输出 JSON：directions(3项含name/platform/format/difficulty/monetize), recommended(与directions[0]同结构), week1(7条字符串), personaKeywords(4个), answers(原样回传), timeBudget(字符串)。",
    user: JSON.stringify(answers),
    mock: () => mockAccountPersonalityTest(answers) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}

export async function generateGodReplies(comment: string): Promise<{
  result: Record<string, unknown>;
  usedMock: boolean;
  fastPath?: boolean;
}> {
  const { result, usedMock, fastPath } = await generateWithBudget({
    budget: AI_GENERATE_BUDGET.reply,
    system:
      "你是评论区高情商回复助手。只输出 JSON：replies(3条{tone,text}), bestIndex(0-2), tip(一条使用建议)。",
    user: `评论：${comment}`,
    mock: () => mockGodReplies(comment) as Record<string, unknown>,
  });
  return { result, usedMock, fastPath };
}
