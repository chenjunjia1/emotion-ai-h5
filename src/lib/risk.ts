import type { RiskLevel, RiskResult } from "./types/v1";

const RISKY_WORDS: { word: string; type: string; weight: number }[] = [
  { word: "保证收益", type: "金融收益承诺", weight: 2 },
  { word: "稳赚", type: "金融收益承诺", weight: 2 },
  { word: "暴利", type: "虚假宣传", weight: 2 },
  { word: "赌博", type: "违法违规", weight: 3 },
  { word: "色情", type: "色情低俗", weight: 3 },
  { word: "加微信", type: "过度私域引流", weight: 1 },
  { word: "私下转账", type: "诈骗引流", weight: 2 },
  { word: "治愈疾病", type: "医疗夸大承诺", weight: 2 },
  { word: "贷款包过", type: "金融收益承诺", weight: 2 },
  { word: "包治", type: "医疗夸大承诺", weight: 2 },
  { word: "仇恨", type: "仇恨攻击", weight: 2 },
];

export function checkContentRisk(text: string): RiskResult {
  const content = String(text || "");
  const hits = RISKY_WORDS.filter((r) => content.includes(r.word));
  const words = hits.map((h) => h.word);
  const types = [...new Set(hits.map((h) => h.type))];
  const score = hits.reduce((s, h) => s + h.weight, 0);

  let level: RiskLevel = "低";
  if (score >= 3 || words.length >= 2) level = "高";
  else if (score >= 1 || words.length >= 1) level = "中";

  const reason =
    level === "高"
      ? "包含多个高风险表达，可能触发平台限制或合规风险。"
      : level === "中"
        ? "存在潜在平台限流或合规风险表达。"
        : "无明显高风险词。";

  const suggestion =
    level === "高"
      ? "建议删除承诺收益、私域诱导或敏感表达后再生成。"
      : level === "中"
        ? "建议换成更温和、合规的表达。"
        : "内容风险较低，可正常使用。";

  return {
    level,
    words,
    types,
    reason,
    suggestion,
    safeVersion: level !== "低" ? content.replace(/保证收益|稳赚|暴利/g, "***") : undefined,
  };
}

export function canGenerate(level: RiskLevel): boolean {
  return level !== "高";
}

export function canCreateVideo(level: RiskLevel): boolean {
  return level === "低" || level === "中";
}
