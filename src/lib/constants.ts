import type { FeatureItem, StyleType, AudienceType } from "./types";

export const FEATURE_LIST: FeatureItem[] = [
  {
    id: "video",
    title: "短视频文案",
    desc: "生成30秒情感口播",
  },
  {
    id: "comment",
    title: "评论区回复",
    desc: "生成高互动评论回复",
  },
  {
    id: "private",
    title: "私信回复",
    desc: "生成高情商私聊话术",
  },
];

export const STYLE_OPTIONS: StyleType[] = [
  "温柔",
  "高情商",
  "促转化",
  "现实",
  "幽默",
];

export const AUDIENCE_OPTIONS: AudienceType[] = [
  "25-35女生",
  "30+男性",
  "高净值男士",
  "离异用户",
];

export const FEATURE_LABELS: Record<string, string> = {
  video: "短视频文案",
  comment: "评论区回复",
  private: "私信回复",
};

export const GENERATE_STORAGE_KEY = "emotion-ai-generate-form";
export const RESULT_STORAGE_KEY = "emotion-ai-generate-result";
