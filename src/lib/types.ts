export type FeatureType = "video" | "comment" | "private";

export type StyleType = "温柔" | "高情商" | "促转化" | "现实" | "幽默";

export type AudienceType =
  | "25-35女生"
  | "30+男性"
  | "高净值男士"
  | "离异用户";

export interface FeatureItem {
  id: FeatureType;
  title: string;
  desc: string;
}

export interface GenerateFormData {
  feature: FeatureType;
  input: string;
  style: StyleType;
  audience: AudienceType;
}

export interface ResultVariant {
  title: string;
  content: string;
}

export interface GenerateResult {
  feature: FeatureType;
  featureLabel: string;
  style: StyleType;
  mainTitle: string;
  mainContent: string;
  variants: ResultVariant[];
}

export interface HistoryRecord {
  id: string;
  featureType: FeatureType;
  featureLabel: string;
  userInput: string;
  aiResult: string;
  style: StyleType;
  createdAt: string;
  displayTime: string;
}

export type UserEventType =
  | "view_home"
  | "click_feature"
  | "submit_generate"
  | "generate_success"
  | "copy_content"
  | "regenerate";

// --- V1 短视频运营助手 ---
export type PlanType = "free" | "pro" | "premium" | "studio";
export type Lang = "zh" | "en";
export type RiskLevel = "低" | "中" | "高";
export type OrderStatus = "pending" | "paid" | "failed" | "closed";
export type VideoTaskStatus = "pending" | "processing" | "success" | "failed";
export type GenerationType = "account" | "daily" | "viral";

export interface User {
  id: string;
  mobile: string;
  role: "user" | "admin";
  plan: PlanType;
  dailyQuota: number;
  usedCount: number;
  bonusQuota: number;
  videoCoin: number;
  frozenVideoCoin: number;
  membershipExpireAt?: string;
  language: Lang;
}

export interface Order {
  id: string;
  orderNo: string;
  productType: "membership" | "video_coin";
  productName: string;
  amount: number;
  status: OrderStatus;
  benefitGranted: boolean;
  benefitGrantedAt?: string;
  meta?: Record<string, unknown>;
  createdAt: string;
}

export interface VideoTask {
  id: string;
  taskType: "avatar" | "auto";
  script: string;
  status: VideoTaskStatus;
  costVideoCoin: number;
  videoUrl?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  type: string;
  topic: string;
  createdAt: string;
  output?: Record<string, unknown>;
}

export interface RiskResult {
  level: RiskLevel;
  words: string[];
  types: string[];
  reason: string;
  suggestion: string;
  safeVersion?: string;
}

export interface ProductDef {
  productType: "membership" | "video_coin";
  productName: string;
  amount: number;
  plan?: PlanType;
  quota?: number;
  coin?: number;
  desc?: string;
}

export interface FlowLog {
  id: string;
  type:
    | "quota_logs"
    | "video_coin_logs"
    | "order_logs"
    | "sms_logs"
    | "risk_records"
    | "support_feedbacks";
  message: string;
  createdAt: string;
}

export interface SupportFeedback {
  id: string;
  userId?: string;
  type: string;
  contact: string;
  description: string;
  relatedOrderNo?: string;
  relatedTaskId?: string;
  status: "pending" | "processed";
  createdAt: string;
}
