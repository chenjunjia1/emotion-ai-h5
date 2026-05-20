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
