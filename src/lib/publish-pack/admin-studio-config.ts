import { STUDIO_QUOTA, PRO_DAILY_IMAGE_GRANTS, GENERATION_STEP_LABELS } from "@/lib/publish-pack/studio-config";

/** Admin 后台展示用（与代码常量同步） */
export const ADMIN_STUDIO_CONFIG = {
  quota: STUDIO_QUOTA,
  proDailyGrants: PRO_DAILY_IMAGE_GRANTS,
  generationSteps: GENERATION_STEP_LABELS,
  imageProviders: {
    regular: "AI配图（fal.ai，未配置则 Pexels/占位图）",
    premium: "AI高级封面（OpenAI Images，未配置则 fal/占位）",
  },
  promptHint:
    "用户中文主题 → 自动英文 prompt（见 lib/publish-pack/prompt-builder.ts），页面不展示 provider 名称。",
} as const;
