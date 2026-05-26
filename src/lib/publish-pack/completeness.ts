import type { PublishStudioMode } from "@/lib/publish-pack/quick-package-types";

export type CompletenessItem = { label: string; done: boolean };

export function calcCompleteness(
  input: string,
  mode: PublishStudioMode,
  advanced?: {
    platforms?: string[];
    feelings?: string[];
    goals?: string[];
    imgVibes?: string[];
    imageStyleIds?: string[];
    scenePresetIds?: string[];
    avoidStyles?: string[];
    avoid?: string[];
  }
): { score: number; items: CompletenessItem[] } {
  const t = input.trim();
  const hasTheme = t.length >= 4;
  const hasScene =
    /房间|咖啡|下班|窗边|路上|店|家|夜|周末|猫|办公/.test(t) ||
    (advanced?.scenePresetIds?.length ?? 0) > 0 ||
    (advanced?.imageStyleIds?.length ?? 0) > 0 ||
    (advanced?.imgVibes?.length ?? 0) > 0;
  const hasEmotion =
    /累|治愈|松弛|emo|开心|难过|温柔|高级|嘴替/.test(t) ||
    (advanced?.feelings?.length ?? 0) > 0;
  const hasTone =
    /真实|不要|温柔|口语|碎碎念|鸡汤|营销/.test(t) ||
    (advanced?.avoidStyles?.length ?? 0) > 0 ||
    (advanced?.avoid?.length ?? 0) > 0;
  const hasImageReq =
    mode === "advanced" &&
    (/图|拍|画面|iPhone|随手|氛围|CCD/.test(t) ||
      (advanced?.scenePresetIds?.length ?? 0) > 0 ||
      (advanced?.imageStyleIds?.length ?? 0) > 0 ||
      (advanced?.imgVibes?.length ?? 0) > 0);
  const hasAvoid =
    mode === "advanced" &&
    ((advanced?.avoidStyles?.length ?? 0) > 0 || (advanced?.avoid?.length ?? 0) > 0);

  const items: CompletenessItem[] = [
    { label: "主题明确", done: hasTheme },
    { label: "场景描述", done: hasScene },
    { label: "情绪方向", done: hasEmotion },
    { label: "语气要求", done: hasTone },
  ];
  if (mode === "advanced") {
    items.push(
      { label: "图片要求", done: hasImageReq },
      { label: "避免风格", done: hasAvoid }
    );
  }

  const doneCount = items.filter((i) => i.done).length;
  const score = Math.round((doneCount / items.length) * 100);
  return { score, items };
}
