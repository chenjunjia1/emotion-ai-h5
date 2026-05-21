import type { GenerateFormData, GenerateResult, ResultVariant } from "@/lib/types";
import { FEATURE_LABELS } from "@/lib/constants";

interface RawAiJson {
  mainTitle?: string;
  mainContent?: string;
  variants?: Array<{ title?: string; content?: string }>;
}

export function parseAiResponse(
  raw: string,
  form: GenerateFormData
): GenerateResult {
  const featureLabel = FEATURE_LABELS[form.feature] ?? "私信回复";
  let parsed: RawAiJson;

  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    parsed = JSON.parse(cleaned) as RawAiJson;
  } catch {
    return {
      feature: form.feature,
      featureLabel,
      style: form.style,
      mainTitle: "AI生成结果",
      mainContent: cleaned || raw,
      variants: [],
    };
  }

  const variants: ResultVariant[] = (parsed.variants ?? [])
    .filter((v) => v.title && v.content)
    .map((v) => ({
      title: String(v.title),
      content: String(v.content),
    }));

  return {
    feature: form.feature,
    featureLabel,
    style: form.style,
    mainTitle: parsed.mainTitle || "AI生成结果",
    mainContent: parsed.mainContent || cleaned,
    variants,
  };
}
