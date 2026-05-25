/** 发布包「补充说明」快捷选项 — 面向新手 */
export const EXTRA_NOTE_PRESETS = [
  {
    id: "newbie",
    label: "我是新手",
    desc: "粉丝少、设备简单，想要好拍易上手",
    text: "我是新手创作者，粉丝还很少，希望内容简单好拍、口语化。",
  },
  {
    id: "real",
    label: "要真实感",
    desc: "日常场景、不摆拍，像跟朋友聊天",
    text: "希望内容真实接地气，不要假大空，适合普通人日常拍摄。",
  },
  {
    id: "short",
    label: "短平快",
    desc: "30 秒内拍完，步骤直接照着念",
    text: "希望脚本短一点，30秒内能拍完，步骤直接照着念。",
  },
  {
    id: "emotion",
    label: "共鸣向",
    desc: "引发评论区讨论，适合情感生活号",
    text: "想要引发评论区共鸣，适合情感/生活类账号风格。",
  },
  {
    id: "hook",
    label: "强钩子",
    desc: "前 3 秒抓住眼球，让人愿意看完",
    text: "前3秒钩子要狠一点，让人愿意看完。",
  },
  {
    id: "xhs",
    label: "小红书风",
    desc: "种草氛围，标题封面偏图文感",
    text: "偏小红书图文感，标题和封面文案要有种草氛围。",
  },
] as const;

export type ExtraNotePreset = (typeof EXTRA_NOTE_PRESETS)[number];
