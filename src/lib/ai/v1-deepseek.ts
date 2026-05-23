import {
  normalizePublishPackResult,
  normalizeTitleGachaResult,
  normalizeTopicBoxResult,
} from "@/lib/ai/normalize-ai-result";
import { generateWithBudget } from "@/lib/ai/generate-budget";
import { AI_GENERATE_BUDGET } from "@/lib/constants/performance";
import {
  mockAccountPersonalityTest,
  mockEmotionChat,
  mockGodReplies,
  mockPostReview,
  mockPublishPack,
  mockTitleGacha,
  mockTopicBlindBox,
  mockViralScore,
} from "@/lib/mock/content-v1";
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
}): Promise<{ result: Record<string, unknown>; usedMock: boolean; fastPath?: boolean }> {
  const budget =
    input.topic.length > 20
      ? AI_GENERATE_BUDGET.publish_pack
      : { ...AI_GENERATE_BUDGET.publish_pack, maxTokens: 1200 };

  const { result, usedMock, fastPath } = await generateWithBudget({
    budget,
    system:
      "你是短视频运营教练。只输出 JSON：packName, topic, platform, track, titles(3条), recommendedTitle, script30s(约120字口播), xhsNote(可选80字), coverCopy, firstComment, commentReplies(3条), publishTime, publishTips(1条), safetyScore(数字), safetyLevel。",
    user: JSON.stringify(input),
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
      "你是恋爱沟通教练。只输出 JSON：stage, heartbeat(0-100整数), heartbeatLabel, insight, tips(3条字符串), replies(3条{tone,text})。语气符合用户选择的风格。",
    user: JSON.stringify(input),
    mock: () => mockEmotionChat(input) as Record<string, unknown>,
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
      "你是短视频数据复盘教练。只输出 JSON：performanceScore(0-99), summary, problems(2-3条), nextSuggestion, nextTopic, engagementRate(数字)。",
    user: JSON.stringify(input),
    mock: () => mockPostReview(input) as Record<string, unknown>,
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
