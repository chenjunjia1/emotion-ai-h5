import type {
  ContentGuess,
  QuickPublishPackage,
  ViralScoreBreakdown,
} from "@/lib/publish-pack/quick-package-types";
import { buildImagePromptEn } from "@/lib/publish-pack/prompt-builder";
import { inferContentGuess } from "@/lib/publish-pack/infer-guess";

function viralFromTopic(topic: string, guess: ContentGuess): ViralScoreBreakdown {
  const base = 72 + (topic.length % 18);
  const total = Math.min(96, base);
  return {
    total,
    titleClick: Math.min(98, total + 3),
    emotionResonance: Math.min(98, total + 5),
    commentInteraction: Math.min(95, total - 4),
    platformMatch: Math.min(98, total + 2),
    publishTimeMatch: Math.min(95, total - 2),
    stars: Math.min(5, Math.max(3, Math.round(total / 20))),
    highlights: [
      "🔥 适合晚上发",
      guess.goal.includes("评论") ? "🔥 容易引发评论" : "🔥 情绪共鸣强",
      `🔥 当前${guess.platform}热门结构`,
    ],
  };
}

export function mockQuickPublishPackage(input: {
  topic: string;
  guess?: ContentGuess;
  mode?: "quick" | "advanced";
}): QuickPublishPackage {
  const topic = input.topic.trim() || "今日想分享的小事";
  const guess = input.guess ?? inferContentGuess(topic);
  const viralScore = viralFromTopic(topic, guess);
  const short = topic.slice(0, 14);

  const titles = [
    `${short}，生活总要有一点光`,
    `普通人${guess.contentStyle}｜${short}`,
    `如果你也${topic.includes("累") ? "很累" : "有同感"}，先看这条`,
    `${guess.platform}爆款结构｜${short}`,
    `今天这条，适合想被看见的人`,
  ].map((text, i) => ({ id: `t${i}`, text }));

  const bodies = [
    `【开头】${topic}\n\n【正文】最近总在想，生活不需要很用力。${guess.personality}的表达方式，反而更容易让人停下来。\n\n【结尾】你今天最想分享的一件小事是什么？评论区聊聊～`,
    `很多人不是不会发内容，而是不知道用什么语气。试试${guess.contentStyle}：具体场景 + 真实感受 + 一句提问。\n\n${topic} 这件事，值得被温柔地记录下来。`,
    `如果这条内容只能帮到一个正在犹豫的人，那就够了。\n\n${topic} · 用${guess.platform}常见的「共鸣开头 + 细节 + 互动」结构，今天就能发。`,
  ].map((text, i) => ({ id: `b${i}`, text }));

  const tags = [
    `#${short.replace(/\s/g, "")}`,
    "#松弛感生活",
    "#慢生活",
    "#治愈系",
    "#今日份美好",
    `#${guess.platform}运营`,
    "#内容创作",
    "#打工人日常",
    "#生活记录",
    "#情绪价值",
  ];

  const seed = topic.length % 1000;
  const isQuick = (input.mode ?? "quick") === "quick";
  const images = isQuick
    ? []
    : [
        {
          id: "cover",
          url: `/api/cover-seed/studio-${seed}-cover?w=600&h=750`,
          role: "cover" as const,
          aspect: "4:5" as const,
          tier: "premium" as const,
          alt: topic,
        },
        ...[1, 2, 3].map((n) => ({
          id: `g${n}`,
          url: `/api/cover-seed/studio-${seed}-${n}?w=500&h=500`,
          role: "gallery" as const,
          aspect: "1:1" as const,
          tier: "regular" as const,
          alt: `${topic} 配图${n}`,
        })),
      ];

  return {
    packageId: `pkg_${Date.now()}`,
    topic,
    mode: input.mode ?? "quick",
    guess,
    viralScore,
    titles,
    bodies,
    tags,
    images,
    coverText: {
      main: titles[0]!.text.slice(0, 16),
      sub: guess.contentStyle,
      layoutTip: "主标题居中，副标题底部",
    },
    coverTexts: [
      titles[0]!.text.slice(0, 12),
      guess.contentStyle,
      "大字主标题 + 小字副标题",
      "留白上方放场景",
      "适合小红书 3:4",
    ],
    imageCount: isQuick ? undefined : (4 as const),
    publishAdvice: {
      platform: guess.platform,
      bestTime: "现在就能发 · 晚上刷笔记的人多，白天发也完全 OK",
      audience: "18–30 岁爱生活、爱互动的女性用户",
      commentHook: "你下班后会做什么放松呢？",
    },
    imagePromptEn: buildImagePromptEn(topic, guess),
  };
}
