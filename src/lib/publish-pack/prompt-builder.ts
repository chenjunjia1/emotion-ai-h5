import type {
  AdvancedPreferences,
  ContentGuess,
} from "@/lib/publish-pack/quick-package-types";

const REALISM_SUFFIX = [
  "realistic social media photo",
  "candid lifestyle photography",
  "taken like an iPhone photo by a friend",
  "natural pose",
  "not overly perfect",
  "authentic daily life",
  "soft natural light",
  "Xiaohongshu style",
  "no AI look",
  "no plastic skin",
  "no fantasy style",
  "no over-polished studio look",
].join(", ");

/** 中文主题 → 英文生图 prompt（不暴露 provider） */
export function buildImagePromptEn(
  topic: string,
  guess: ContentGuess,
  prefs?: AdvancedPreferences
): string {
  const mood =
    guess.personality.includes("治愈") || guess.personality.includes("温柔")
      ? "emotional healing atmosphere, soft warm light"
      : guess.personality.includes("搞笑") || guess.personality.includes("嘴替")
        ? "playful lifestyle, candid moment"
        : "authentic lifestyle, natural light";

  const platform =
    prefs?.platforms?.[0] ?? guess.platform;
  const platformStyle =
    platform.includes("小红书")
      ? "Xiaohongshu cozy lifestyle photography, cream tone palette"
      : platform.includes("抖音")
        ? "vertical social media lifestyle, vibrant but natural"
        : platform.includes("朋友圈")
          ? "WeChat moments aesthetic, clean minimal composition"
          : "social media lifestyle photography";

  const vibe = prefs?.imgVibes?.join(", ") || guess.imageStyle;
  const avoid = prefs?.avoidStyles?.length
    ? prefs.avoidStyles
        .map((a) => a.replace(/^不要/, "avoid "))
        .join(", ")
    : "avoid AI look, avoid studio glamour";

  const scene = topic.slice(0, 120).replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, " ");

  return [
    platformStyle,
    mood,
    `theme: ${scene || "daily life moment"}`,
    vibe,
    avoid,
    REALISM_SUFFIX,
    "no text overlay, no watermark",
  ].join(", ");
}