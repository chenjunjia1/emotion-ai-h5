/** AI 发布包 — 完整可发布内容包 */

export type PublishStudioMode = "quick" | "advanced";

export type ImageCountOption = 1 | 2 | 4;

export type ContentGuess = {
  platform: string;
  personality: string;
  contentStyle: string;
  goal: string;
  imageStyle: string;
};

export type AdvancedPreferences = {
  platforms: string[];
  feelings: string[];
  goals?: string[];
  /** @deprecated 用 imageStyleIds */
  imgVibes?: string[];
  imageStyleIds?: string[];
  avoidStyles: string[];
  /** 画面 / 拍摄预设 id，来自 pack-prompt-presets */
  scenePresetIds?: string[];
};

export type ViralScoreBreakdown = {
  total: number;
  titleClick: number;
  emotionResonance: number;
  commentInteraction: number;
  platformMatch: number;
  publishTimeMatch: number;
  stars: number;
  highlights: string[];
};

export type PackageTitle = {
  id: string;
  text: string;
};

export type PackageBody = {
  id: string;
  text: string;
};

export type PackageImage = {
  id: string;
  url: string;
  role: "cover" | "gallery";
  aspect: "1:1" | "3:4" | "4:5" | "9:16";
  tier: "regular" | "premium";
  alt?: string;
};

export type PublishAdvice = {
  platform: string;
  bestTime: string;
  audience: string;
  commentHook: string;
};

export type CoverTextSet = {
  main: string;
  sub: string;
  layoutTip?: string;
};

export type QuickPublishPackage = {
  packageId: string;
  topic: string;
  mode: PublishStudioMode;
  guess: ContentGuess;
  viralScore: ViralScoreBreakdown;
  titles: PackageTitle[];
  bodies: PackageBody[];
  tags: string[];
  images: PackageImage[];
  coverText: CoverTextSet;
  coverTexts?: string[];
  publishAdvice: PublishAdvice;
  imageCount?: ImageCountOption;
  scenePreviewZh?: string;
  preferences?: AdvancedPreferences;
  /** 英文生图 prompt（内部，不展示 provider） */
  imagePromptEn?: string;
};

export type RestyleOption =
  | "改短一点"
  | "更高级一点"
  | "更温柔一点"
  | "更像朋友圈"
  | "更像小红书"
  | "更适合抖音"
  | "更情绪化一点"
  | "更像真人写的"
  | "更容易引发评论";
