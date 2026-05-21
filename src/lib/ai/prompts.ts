import type { GenerateFormData } from "@/lib/types";
import { FEATURE_LABELS } from "@/lib/constants";

const FEATURE_GUIDES: Record<string, string> = {
  video: `生成情感短视频口播文案，包含：
- mainTitle: 爆款标题（一句话）
- mainContent: 完整文案，分段标注【前3秒开场】【正文】【结尾互动】
- variants: 2个备选，如「评论区首评」「引导关注版」`,
  comment: `生成评论区高情商回复，针对用户评论内容，包含：
- mainTitle: 固定为「高情商回复」
- mainContent: 3~5条可直接复制的回复，每条标注版本名（如温柔版、幽默版）
- variants: 3个精简单条版本（title + content）`,
  private: `生成私信/chat高情商回复，包含：
- mainTitle: 固定为「高情商回复」
- mainContent: 2~3段完整话术（标注版本如温柔安抚版、专业解释版）
- variants: 3个单条精简版（温柔安抚版、专业解释版、促进转化版/不强销售版）`,
};

export function buildSystemPrompt(): string {
  return `你是「情绪价值助手」，专为婚恋红娘、情感博主、私域运营撰写高情商中文内容。
要求：自然、不油腻、不PUA、不过度销售；符合小红书温柔风；口语化、可复制粘贴。
必须严格输出 JSON，不要 markdown 代码块，格式如下：
{
  "mainTitle": "string",
  "mainContent": "string，可用\\n换行",
  "variants": [{ "title": "string", "content": "string" }]
}`;
}

export function buildUserPrompt(form: GenerateFormData): string {
  const featureLabel = FEATURE_LABELS[form.feature] ?? form.feature;
  const guide = FEATURE_GUIDES[form.feature] ?? FEATURE_GUIDES.private;

  return `功能类型：${featureLabel}
回复风格：${form.style}
目标人群：${form.audience}
用户输入：${form.input || "（用户未填写，请根据功能类型生成通用示例）"}

任务：${guide}

请根据以上信息生成 JSON 结果。`;
}
