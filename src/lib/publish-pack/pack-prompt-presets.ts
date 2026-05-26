/** 发布包 — 可点选的「画面 / 拍摄」提示词，拼进 Seedream 英文 prompt */

export type PromptPresetCategory = "scene" | "shot";

export type PackPromptPreset = {
  id: string;
  category: PromptPresetCategory;
  label: string;
  /** 给用户看的补充句（可选写入主题框） */
  topicLine: string;
  /** 给 Seedream 的英文画面描述 */
  imagePrompt: string;
};

export const PACK_SCENE_PRESETS: PackPromptPreset[] = [
  {
    id: "cafe-window",
    category: "scene",
    label: "咖啡店窗边",
    topicLine: "咖啡店窗边，一杯拿铁，午后暖光",
    imagePrompt:
      "cozy cafe by large window, latte on wooden table, soft afternoon sunlight, blurred street outside, lived-in details",
  },
  {
    id: "home-warm",
    category: "scene",
    label: "家里暖光",
    topicLine: "晚上回家，房间暖黄灯，沙发毯子",
    imagePrompt:
      "warm home interior at night, soft lamp light, cozy sofa blanket, slippers, quiet domestic moment",
  },
  {
    id: "commute",
    category: "scene",
    label: "下班路上",
    topicLine: "下班路上，城市傍晚，有点累但很真实",
    imagePrompt:
      "evening commute street, city lights starting, tired but calm mood, walking perspective, realistic urban background",
  },
  {
    id: "weekend-walk",
    category: "scene",
    label: "周末闲逛",
    topicLine: "周末随便走走，小店招牌，生活碎片",
    imagePrompt:
      "casual weekend stroll, small shop signs, street life, relaxed pace, documentary lifestyle feel",
  },
  {
    id: "desk-work",
    category: "scene",
    label: "办公桌一角",
    topicLine: "办公桌一角，电脑、水杯、便签",
    imagePrompt:
      "desk corner still life, laptop edge, water cup, sticky notes, natural office clutter, soft daylight",
  },
  {
    id: "rain-window",
    category: "scene",
    label: "雨天窗边",
    topicLine: "下雨天在窗边，玻璃水珠，安静发呆",
    imagePrompt:
      "rainy day by window, water droplets on glass, muted grey-blue light, contemplative quiet mood",
  },
  {
    id: "park-bench",
    category: "scene",
    label: "公园长椅",
    topicLine: "公园长椅晒太阳，树影斑驳",
    imagePrompt:
      "park bench in dappled sunlight, trees, gentle breeze feel, peaceful outdoor break",
  },
  {
    id: "kitchen-cook",
    category: "scene",
    label: "厨房做饭",
    topicLine: "厨房简单做饭，蒸汽、砧板、烟火气",
    imagePrompt:
      "home kitchen cooking moment, steam, cutting board, ingredients, warm tungsten light, authentic food prep",
  },
];

export const PACK_SHOT_PRESETS: PackPromptPreset[] = [
  {
    id: "iphone-candid",
    category: "shot",
    label: "iPhone随手拍",
    topicLine: "像朋友用手机随手拍，不要摆拍",
    imagePrompt:
      "candid iPhone photo taken by a friend, slight motion blur acceptable, imperfect framing, authentic snapshot",
  },
  {
    id: "friend-angle",
    category: "shot",
    label: "朋友视角",
    topicLine: "第三人称朋友视角，自然互动",
    imagePrompt:
      "third-person friend perspective, natural interaction distance, not selfie, relaxed body language",
  },
  {
    id: "detail-close",
    category: "shot",
    label: "生活细节特写",
    topicLine: "手部或物品特写，有生活痕迹",
    imagePrompt:
      "close-up lifestyle detail, hands or objects with wear marks, shallow depth of field, tactile textures",
  },
  {
    id: "over-shoulder",
    category: "shot",
    label: "肩后视角",
    topicLine: "过肩或背影，有故事感",
    imagePrompt:
      "over-the-shoulder or back view, storytelling composition, subject not facing camera directly",
  },
  {
    id: "golden-hour",
    category: "shot",
    label: "黄金时刻光",
    topicLine: "傍晚金色侧光，皮肤自然",
    imagePrompt:
      "golden hour side light, natural skin texture, warm highlights, no harsh flash",
  },
  {
    id: "indoor-soft",
    category: "shot",
    label: "室内柔光",
    topicLine: "室内柔和散射光，不高对比",
    imagePrompt:
      "soft diffused indoor light, low contrast, gentle shadows, film-like roll-off",
  },
];

export const ALL_PACK_PROMPT_PRESETS: PackPromptPreset[] = [
  ...PACK_SCENE_PRESETS,
  ...PACK_SHOT_PRESETS,
];

const PRESET_MAP = new Map(ALL_PACK_PROMPT_PRESETS.map((p) => [p.id, p]));

export function getPackPromptPresets(ids?: string[]): PackPromptPreset[] {
  if (!ids?.length) return [];
  return ids.map((id) => PRESET_MAP.get(id)).filter(Boolean) as PackPromptPreset[];
}

export function buildPresetImagePrompt(ids?: string[]): string {
  return getPackPromptPresets(ids)
    .map((p) => p.imagePrompt)
    .join(", ");
}

export function buildPresetTopicHint(ids?: string[]): string {
  return getPackPromptPresets(ids)
    .map((p) => p.topicLine)
    .join("；");
}
