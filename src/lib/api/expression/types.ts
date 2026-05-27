/** AI灵感 — 接口类型预留（V2） */

export type ExpressionGenerateKind =
  | "quick"
  | "moments"
  | "wechat_status"
  | "xhs_note"
  | "xhs_title"
  | "video_pack"
  | "chat_reply"
  | "image_caption"
  | "emotion_sign"
  | "private_domain"
  | "account_diagnosis"
  | "commerce_pack";

export type ExpressionGenerateRequest = {
  kind: ExpressionGenerateKind;
  prompt?: string;
  imageBase64?: string;
  chatText?: string;
  platform?: string;
  style?: string;
  /** 聊天军师：回复类型 */
  replyTone?: string;
};

export type AccountDiagnosisDayPlan = {
  day: number;
  theme: string;
  content: string;
  tip: string;
};

export type AccountDiagnosisPayload = {
  summary: string;
  contentDirection: string[];
  hotTopics: string[];
  publishPlan: AccountDiagnosisDayPlan[];
  monetization: string[];
};

export type CommerceMaterialPackPayload = {
  productSummary: string;
  sellingPoints: string[];
  videoScript: string;
  xhsNote: string;
  liveScript: string;
};

export type ExpressionGenerateResponse = {
  ok: boolean;
  text?: string;
  titles?: string[];
  tags?: string[];
  replies?: string[];
  diagnosis?: AccountDiagnosisPayload;
  commercePack?: CommerceMaterialPackPayload;
  analysis?: {
    attitude?: string;
    relation?: string;
    mood?: string;
    suggestions?: string[];
  };
  quotaCost?: number;
  usedMock?: boolean;
  user?: import("@/lib/types/v1").User;
  error?: string;
  message?: string;
};

export type ExpressionResultPayload = {
  text: string;
  titles?: string[];
  tags?: string[];
  prompt?: string;
  quotaCost?: number;
  usedMock?: boolean;
};

export const EXPRESSION_RESULT_STORAGE_KEY = "expression_result_v2";

/** 图片识别配文 — 预留视觉模型 */
export type ImageCaptionRequest = {
  imageUrl?: string;
  imageBase64?: string;
  hint?: string;
  platforms?: ("moments" | "xhs" | "wechat_status")[];
};

export type ImageCaptionResponse = {
  ok: boolean;
  moments?: string;
  xhs?: string;
  wechatStatus?: string;
  moodScore?: number;
  quotaCost?: number;
  usedMock?: boolean;
  user?: import("@/lib/types/v1").User;
  error?: string;
  message?: string;
};

/** OCR 聊天截图 — 预留 */
export type ChatOcrRequest = {
  imageBase64: string;
};

export type ChatOcrResponse = {
  ok: boolean;
  messages?: { role: "me" | "other"; text: string }[];
  error?: string;
};

/** 热点 API — 预留抖音/小红书/视频号 */
export type HotTopicPlatform = "douyin" | "xhs" | "channels" | "moments" | "all";

export type HotTopicItem = {
  id: string;
  title: string;
  heat: string;
  platform: HotTopicPlatform;
};

export type HotTopicsResponse = {
  ok: boolean;
  items: HotTopicItem[];
  updatedAt?: string;
};
