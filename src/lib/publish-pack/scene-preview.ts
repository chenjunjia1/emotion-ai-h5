import type { AdvancedPreferences } from "@/lib/publish-pack/quick-package-types";
import type { ContentGuess } from "@/lib/publish-pack/quick-package-types";
import { buildPresetTopicHint } from "@/lib/publish-pack/pack-prompt-presets";

export function buildScenePreviewZh(
  topic: string,
  guess: ContentGuess,
  prefs?: AdvancedPreferences,
  variant: "default" | "xhs" | "moments" | "real" = "default"
): string {
  const platform =
    prefs?.platforms?.[0] ?? guess.platform ?? "小红书";
  const feeling = prefs?.feelings?.[0] ?? guess.personality ?? "温柔治愈";
  const vibe = prefs?.imgVibes?.[0] ?? guess.imageStyle ?? "iPhone随手拍";
  const avoid = prefs?.avoidStyles?.length
    ? prefs.avoidStyles.join("、")
    : "不要AI感、不要影楼风";
  const presetHint = buildPresetTopicHint(prefs?.scenePresetIds);

  const platformLine =
    variant === "xhs"
      ? "更像小红书博主随手发的生活笔记"
      : variant === "moments"
        ? "更像朋友圈低调高级的日常分享"
        : variant === "real"
          ? "更贴近普通人真实生活记录"
          : `适合${platform}发布`;

  return [
    `真实生活感的${platform}风照片，主题围绕「${topic.slice(0, 40)}」。`,
    presetHint ? `画面参考：${presetHint}。` : "",
    `画面氛围${feeling}，${platformLine}。`,
    `拍摄感觉像${vibe}，光线自然柔和，有生活细节，构图不刻意。`,
    `人物姿态放松自然，${avoid}，画面温暖有呼吸感。`,
  ].join("");
}
