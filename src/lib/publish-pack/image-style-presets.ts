/** 高级模式图片风格词库 — 选中后拼接进星绘 prompt */

export type ImageStylePreset = {
  id: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  prompt: string;
  negativePrompt: string;
  suitableScenes: string[];
};

export const IMAGE_STYLE_PRESETS: ImageStylePreset[] = [
  {
    id: "ccd",
    name: "CCD相机",
    shortDesc: "复古闪光感，像旧相机随手拍",
    longDesc: "有一点颗粒、有一点直闪，像以前 CCD 拍出来的青春生活照。",
    prompt:
      "CCD camera aesthetic, direct flash, slight grain, retro digital camera snapshot, candid lifestyle, natural indoor light mix",
    negativePrompt:
      "no AI look, no studio glamour, no over-polished skin, no poster layout, no watermark text",
    suitableScenes: ["日常", "街头", "青春感"],
  },
  {
    id: "film",
    name: "胶片风",
    shortDesc: "暖调颗粒感，像电影截图",
    longDesc: "色彩偏暖、轻微颗粒与褪色感，像日常胶片扫出来的生活照。",
    prompt:
      "35mm film photography, warm tones, subtle film grain, soft highlights, authentic daily life snapshot",
    negativePrompt: "no AI look, no plastic skin, no commercial poster, no harsh HDR",
    suitableScenes: ["旅行", "海边", "散步", "窗边"],
  },
  {
    id: "overexposure",
    name: "过曝",
    shortDesc: "亮白通透，空气感更强",
    longDesc: "画面偏亮、高光柔和，有夏日过曝的通透生活感。",
    prompt:
      "slightly overexposed lifestyle photo, bright airy mood, soft blown highlights, dreamy but realistic",
    negativePrompt: "no dark moody studio, no AI fantasy, no text overlay",
    suitableScenes: ["晴天", "窗边", "户外", "下午茶"],
  },
  {
    id: "portrait",
    name: "写真感",
    shortDesc: "自然写实，像博主随手拍",
    longDesc: "像朋友帮你拍的轻写真，背景干净，人物自然。",
    prompt:
      "natural portrait lifestyle photo, shallow depth of field, clean background, soft skin texture, candid pose",
    negativePrompt: "no studio glamour, no heavy retouch, no AI plastic face",
    suitableScenes: ["人像", "自拍", "探店", "日常"],
  },
  {
    id: "polaroid",
    name: "拍立得",
    shortDesc: "像即时成像的生活纪念照",
    longDesc: "有拍立得成像的复古质感，像记录瞬间的小卡片。",
    prompt:
      "polaroid instant photo aesthetic, nostalgic color cast, casual snapshot, white frame feeling",
    negativePrompt: "no digital sharp HDR, no AI illustration, no poster text",
    suitableScenes: ["聚会", "旅行", "礼物", "日常碎片"],
  },
  {
    id: "pixel",
    name: "像素风",
    shortDesc: "复古像素画，像小游戏角色",
    longDesc: "轻像素复古游戏感，适合可爱、趣味、年轻向内容。",
    prompt:
      "retro pixel art inspired lifestyle still life, cute mood, limited color palette, playful",
    negativePrompt: "no realistic photo confusion, no horror, no watermark",
    suitableScenes: ["游戏", "可爱", "宠物", "趣味"],
  },
  {
    id: "3d-cartoon",
    name: "3D卡通",
    shortDesc: "可爱立体感，像动画人物",
    longDesc: "柔和3D卡通渲染，适合治愈、轻量、可爱向封面。",
    prompt:
      "soft 3D cartoon render, cozy lifestyle scene, gentle lighting, cute aesthetic, clean composition",
    negativePrompt: "no horror, no realistic photo, no busy text",
    suitableScenes: ["治愈", "盲盒", "好物", "可爱日常"],
  },
];

export function getStylePreset(id: string): ImageStylePreset | undefined {
  return IMAGE_STYLE_PRESETS.find((s) => s.id === id);
}

export function getStylePresets(ids: string[]): ImageStylePreset[] {
  return ids.map((id) => getStylePreset(id)).filter(Boolean) as ImageStylePreset[];
}
