import type { AdvancedPreferences, ContentGuess } from "@/lib/publish-pack/quick-package-types";
import { getStylePresets } from "@/lib/publish-pack/image-style-presets";
import { buildPresetImagePrompt } from "@/lib/publish-pack/pack-prompt-presets";

const BASE_REALISM =
  "realistic social media lifestyle photo, candid iPhone snapshot by a friend, natural pose, soft natural light, authentic daily life, Xiaohongshu style, WeChat moments aesthetic";

const BASE_NEGATIVE =
  "AI generated look, plastic skin, studio glamour, commercial poster, over-retouched, watermark, text overlay, fantasy, horror";

export function buildXinghuiPrompt(input: {
  topic: string;
  guess: ContentGuess;
  prefs?: AdvancedPreferences;
  role: "cover" | "gallery";
  index?: number;
}): { prompt: string; negativePrompt: string; styleName: string } {
  const { topic, guess, prefs, role, index = 0 } = input;
  const platform = prefs?.platforms?.[0] ?? guess.platform;
  const feeling = prefs?.feelings?.[0] ?? guess.personality;
  const goal = prefs?.goals?.[0] ?? guess.goal;

  const styleIds = prefs?.imageStyleIds?.length
    ? prefs.imageStyleIds
    : prefs?.imgVibes?.includes("CCD氛围感")
      ? ["ccd"]
      : ["film"];

  const styles = getStylePresets(styleIds);
  const stylePrompt = styles.map((s) => s.prompt).join(", ");
  const styleNegative = styles.map((s) => s.negativePrompt).join(", ");
  const styleName = styles.map((s) => s.name).join(" + ") || "生活随拍";

  const avoid = prefs?.avoidStyles?.length
    ? prefs.avoidStyles.map((a) => a.replace(/^不要/, "avoid ")).join(", ")
    : "";

  const scene = topic.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。]/g, " ").slice(0, 200);
  const presetScene = buildPresetImagePrompt(prefs?.scenePresetIds);

  const roleHint =
    role === "cover"
      ? "vertical 3:4 portrait, subject fills most of the frame, no large empty blank area at top or bottom, full-bleed lifestyle photo, natural composition"
      : `lifestyle detail shot ${index + 1}, different angle from cover, same mood and color palette`;

  const prompt = [
    BASE_REALISM,
    `platform mood: ${platform}, ${feeling}, goal: ${goal}`,
    `theme: ${scene}`,
    presetScene,
    stylePrompt,
    roleHint,
    "high quality, natural composition, no text or watermark in image",
  ]
    .filter(Boolean)
    .join(", ");

  const negativePrompt = [BASE_NEGATIVE, styleNegative, avoid].filter(Boolean).join(", ");

  return { prompt: prompt.slice(0, 1200), negativePrompt: negativePrompt.slice(0, 600), styleName };
}
