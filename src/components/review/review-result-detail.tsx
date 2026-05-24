"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { ReviewScoreMeter } from "@/components/review/review-score-meter";
import { displayField } from "@/lib/ai/normalize-ai-result";
import { labelClass, normalizeReviewResult } from "@/lib/review/result-shape";
import { cn } from "@/lib/utils";

function MetricCard({
  label,
  score,
  tag,
}: {
  label: string;
  score: number;
  tag: string;
}) {
  const tagLabel = tag as "好" | "一般" | "偏低";
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-[#FFE8F0]">
      <p className="text-[10px] font-bold text-[#8A94A6]">{label}</p>
      <div className="mt-1 flex items-end justify-between">
        <span className="text-2xl font-black text-[#1F2937]">{score}</span>
        <span className={cn("rounded-md px-1.5 py-0.5 text-[9px] font-black", labelClass(tagLabel))}>
          {tag}
        </span>
      </div>
    </div>
  );
}

export function ReviewResultDetail({
  result,
  title,
  demo = false,
}: {
  result: Record<string, unknown>;
  title: string;
  demo?: boolean;
}) {
  const r = normalizeReviewResult(result);
  const score = Number(r.performanceScore ?? 0);
  const stars = Math.min(5, Math.round(score / 20));

  return (
    <div className={cn("space-y-3", demo && "opacity-90")}>
      {demo ? (
        <p className="text-center text-[10px] font-bold text-[#8A94A6]">复盘结果示例</p>
      ) : null}

      <div className="overflow-hidden rounded-[24px] shadow-lg ring-1 ring-[#FFE8F0]">
        <div className="bg-gradient-to-r from-[#FF4F8B] via-[#FF7AAE] to-[#FF9A4D] px-4 py-4 text-white">
          <ReviewScoreMeter
            score={score}
            label={`数据表现 ${score} 分`}
            title={title || "未命名内容"}
          />
          <p className="mt-2 text-[10px] font-bold text-white/90">
            {"★".repeat(stars)}
            {"☆".repeat(5 - stars)} · 互动率 {displayField(r.engagementRate, "—")}%
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-[#FFF4F7] p-3">
          <MetricCard
            label="标题吸引力"
            score={Number(r.titleScore)}
            tag={String(r.titleScoreLabel)}
          />
          <MetricCard
            label="内容节奏"
            score={Number(r.pacingScore)}
            tag={String(r.pacingScoreLabel)}
          />
          <MetricCard
            label="互动表现"
            score={Number(r.interactionScore)}
            tag={String(r.interactionScoreLabel)}
          />
        </div>

        <div className="space-y-2 bg-white p-4 text-sm">
          <InsightBlock
            tone="good"
            title="主要优点"
            text={displayField(r.advantages)}
          />
          <InsightBlock
            tone="bad"
            title="核心问题"
            text={displayField(r.coreProblems)}
          />
          <InsightBlock tone="neutral" title="整体解读" text={displayField(r.summary)} />

          {(r.problems as string[])?.length ? (
            <div className="rounded-2xl bg-orange-50/70 p-3 text-xs">
              <p className="mb-1 font-black text-[#FF4F8B]">改进清单</p>
              <ul className="list-disc space-y-0.5 pl-4 text-[#1F2937]/80">
                {(r.problems as string[]).map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="rounded-2xl bg-[#FFF0F5]/60 p-3 ring-1 ring-[#FF4F8B]/10">
            <p className="text-[10px] font-black text-[#FF4F8B]">下一条建议</p>
            <p className="mt-1 text-xs font-semibold text-[#1F2937]/85">
              {displayField(r.nextSuggestion)}
            </p>
            <p className="mt-2 text-[10px] text-[#8A94A6]">
              推荐选题：{displayField(r.nextTopic)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 text-[11px] text-[#5A6478]">
            <p>🎯 钩子建议：{displayField(r.hookAdvice)}</p>
            <p>🕐 发布时间：{displayField(r.publishTimeAdvice)}</p>
            <p>✏️ 标题优化：{displayField(r.titleAdvice)}</p>
          </div>
        </div>
      </div>

      {!demo ? (
        <Link
          href={`/publish-pack?topic=${encodeURIComponent(displayField(r.nextTopic, ""))}`}
          className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] py-3.5 text-sm font-black text-white shadow-md"
        >
          <Sparkles size={18} />
          用推荐选题生成发布包
        </Link>
      ) : null}
    </div>
  );
}

function InsightBlock({
  tone,
  title,
  text,
}: {
  tone: "good" | "bad" | "neutral";
  title: string;
  text: string;
}) {
  const icon = tone === "good" ? "✅" : tone === "bad" ? "⚠️" : "💡";
  const bg =
    tone === "good"
      ? "bg-emerald-50/80"
      : tone === "bad"
        ? "bg-rose-50/80"
        : "bg-[#FFF4F7]";

  return (
    <div className={cn("rounded-2xl p-3 text-xs leading-relaxed", bg)}>
      <p className="mb-1 font-black text-[#1F2937]">
        {icon} {title}
      </p>
      <p className="text-[#1F2937]/80">{text}</p>
    </div>
  );
}
