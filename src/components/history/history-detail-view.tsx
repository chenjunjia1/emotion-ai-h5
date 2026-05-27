"use client";

import Link from "next/link";
import { ArrowLeft, Copy } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  displayField,
  isConsultantHistoryOutput,
  isEmotionHistoryOutput,
  isTreeholeHistoryOutput,
  pickStringFromOutput,
} from "@/lib/ai/normalize-ai-result";
import { historyTypeMeta, formatHistoryWhen } from "@/lib/history/library-meta";
import type { HistoryItem } from "@/lib/types/v1";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function CopyBlock({ label, text }: { label: string; text: string }) {
  const { showToast, tr } = useApp();
  if (!text.trim()) return null;
  return (
    <div className="rounded-2xl bg-white/95 p-3 ring-1 ring-orange-100/80">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-black text-[#FF7AAE]">{label}</span>
        <button
          type="button"
          className="text-[10px] font-bold text-[#FF7AAE]"
          onClick={() => {
            void copyToClipboard(text);
            showToast(tr("copied"));
          }}
        >
          <Copy size={12} className="inline" /> 复制
        </button>
      </div>
      <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

function PackDetail({ output }: { output: Record<string, unknown> }) {
  const titles = (output.titles as string[]) ?? [];
  const godReplies = (output.godReplies as { style?: string; text: string }[]) ?? [];

  return (
    <div className="space-y-2">
      <CopyBlock label="推荐标题" text={displayField(output.recommendedTitle)} />
      {titles.length > 0 ? (
        <div className="rounded-2xl bg-[#FFF0F5]/60 p-3 ring-1 ring-[#FF7AAE]/15">
          <p className="mb-2 text-[10px] font-black text-[#FF7AAE]">备选标题</p>
          <ul className="space-y-1 text-xs text-slate-700">
            {titles.map((t, i) => (
              <li key={i}>
                {i + 1}. {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <CopyBlock label="口播脚本" text={displayField(output.script)} />
      {output.xhsNote ? (
        <CopyBlock label="小红书图文" text={displayField(output.xhsNote)} />
      ) : null}
      <CopyBlock label="首评引导" text={displayField(output.firstComment)} />
      {godReplies.map((r, i) => (
        <CopyBlock key={i} label={r.style ?? `神回复 ${i + 1}`} text={r.text} />
      ))}
    </div>
  );
}

function ConsultantDetail({ output, topic }: { output: Record<string, unknown>; topic: string }) {
  const analysis =
    pickStringFromOutput(output, ["analysis", "insight", "reply", "text", "content"]) ?? "";
  const todayTopics = (output.todayTopics as string[]) ?? [];
  const titleSuggestions = (output.titleSuggestions as string[]) ?? [];
  const contentStructure =
    (output.contentStructure as string[]) ?? (output.tips as string[]) ?? [];
  const publishTips = (output.publishTips as string[]) ?? [];
  const recommendHotTopic = pickStringFromOutput(output, ["recommendHotTopic"]) ?? "";

  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-slate-100/90 px-3 py-2.5">
        <p className="text-[9px] font-bold text-slate-500">你的问题</p>
        <p className="mt-1 text-xs text-slate-700">{topic || "—"}</p>
      </div>

      {analysis ? (
        <CopyBlock label="AI 建议" text={analysis} />
      ) : (
        <p className="rounded-2xl bg-orange-50 px-3 py-4 text-center text-xs text-slate-500">
          主回复未保存完整，可重新提问生成。
        </p>
      )}

      {todayTopics.length > 0 ? (
        <div className="rounded-2xl bg-[#FFF0F5]/60 p-3 ring-1 ring-[#FF7AAE]/15">
          <p className="mb-2 text-[10px] font-black text-[#FF7AAE]">推荐选题</p>
          <ul className="space-y-1 text-xs text-slate-700">
            {todayTopics.map((t, i) => (
              <li key={i}>
                {i + 1}. {t}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {titleSuggestions.length > 0 ? (
        <div className="rounded-2xl bg-white/95 p-3 ring-1 ring-orange-100/80">
          <p className="mb-2 text-[10px] font-black text-[#FF7AAE]">标题建议</p>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {titleSuggestions.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {contentStructure.length > 0 ? (
        <div className="rounded-2xl bg-[#FFFBFC] p-3 ring-1 ring-[#FFE8F0]">
          <p className="mb-2 text-[10px] font-black text-[#FF7AAE]">内容结构</p>
          <ul className="space-y-1 text-xs text-slate-600">
            {contentStructure.map((line, i) => (
              <li key={i}>
                · {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {publishTips.length > 0 ? (
        <div className="rounded-2xl bg-[#FFFBF8] p-3 ring-1 ring-[#FFE8F0]">
          <p className="mb-2 text-[10px] font-black text-[#FF7AAE]">发布小贴士</p>
          <ul className="space-y-1 text-xs text-slate-600">
            {publishTips.map((tip, i) => (
              <li key={i}>
                💡 {tip}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {recommendHotTopic ? (
        <p className="text-[10px] font-bold text-[#FF7AAE]">推荐热点：{recommendHotTopic}</p>
      ) : null}
    </div>
  );
}

function TreeholeDetail({ output, topic }: { output: Record<string, unknown>; topic: string }) {
  const userMsg =
    pickStringFromOutput(output, ["userMessage", "chat", "prompt"]) ?? topic;
  const reply = pickStringFromOutput(output, ["text", "reply", "content"]) ?? "";
  const tags = (output.tags as string[]) ?? [];
  const persona = pickStringFromOutput(output, ["persona"]) ?? "";

  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-slate-100/90 px-3 py-2.5">
        <p className="text-[9px] font-bold text-slate-500">你说</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">{userMsg}</p>
      </div>
      {persona ? (
        <p className="px-0.5 text-[10px] font-bold text-violet-500">搭子 · {persona}</p>
      ) : null}
      {reply ? (
        <CopyBlock label="树洞回复" text={reply} />
      ) : (
        <p className="rounded-2xl bg-orange-50 px-3 py-4 text-center text-xs text-slate-500">
          回复内容未完整保存，可回到树洞再聊一句。
        </p>
      )}
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600 ring-1 ring-violet-100"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function EmotionDetail({ output, topic }: { output: Record<string, unknown>; topic: string }) {
  const replies = (output.replies as { tone?: string; style?: string; text: string }[]) ?? [];
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-slate-100/90 px-3 py-2.5">
        <p className="text-[9px] font-bold text-slate-500">Ta 说</p>
        <p className="mt-1 text-xs text-slate-700">{displayField(output.chat, topic)}</p>
      </div>
      <div className="rounded-2xl bg-gradient-to-r from-[#FFF0F5] to-white p-3 ring-1 ring-[#FF7AAE]/20">
        <p className="text-[10px] font-black text-[#FF7AAE]">
          {displayField(output.stage)} · 心动 {displayField(output.heartbeat)} ·{" "}
          {displayField(output.heartbeatLabel)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-slate-700">
          {displayField(output.insight)}
        </p>
        {(output.tips as string[])?.map((tip, i) => (
          <p key={i} className="mt-1 text-[10px] text-slate-500">
            · {tip}
          </p>
        ))}
      </div>
      {replies.map((r, i) => (
        <CopyBlock
          key={i}
          label={i === 0 ? `最推荐 · ${r.tone ?? r.style ?? "回复"}` : r.tone ?? r.style ?? `回复 ${i + 1}`}
          text={r.text}
        />
      ))}
    </div>
  );
}

function ReplyDetail({ output, topic }: { output: Record<string, unknown>; topic: string }) {
  const replies = (output.replies as { style?: string; text: string }[]) ?? [];
  return (
    <div className="space-y-2">
      <CopyBlock label="粉丝评论" text={displayField(output.comment, topic)} />
      {replies.map((r, i) => (
        <CopyBlock key={i} label={r.style ?? `回复 ${i + 1}`} text={r.text} />
      ))}
    </div>
  );
}

function ReviewDetail({ output }: { output: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-violet-50 p-4 text-center">
        <p className="text-[10px] font-bold text-[#FF7AAE]">表现评分</p>
        <p className="text-4xl font-black text-[#FF5C8A]">
          {displayField(output.performanceScore)}
        </p>
      </div>
      <CopyBlock label="总结" text={displayField(output.summary)} />
      {(output.problems as string[])?.length ? (
        <div className="rounded-2xl bg-orange-50/80 p-3 text-xs">
          <p className="font-bold text-[#FF7AAE]">可改进</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-slate-600">
            {(output.problems as string[]).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <CopyBlock label="下一条建议" text={displayField(output.nextSuggestion)} />
      <CopyBlock label="推荐选题" text={displayField(output.nextTopic)} />
    </div>
  );
}

function TopicDetail({ output }: { output: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <CopyBlock label="今日选题" text={displayField(output.topic)} />
      <CopyBlock label="开场钩子" text={displayField(output.hook)} />
      {(output.angles as string[])?.map((a, i) => (
        <CopyBlock key={i} label={`角度 ${i + 1}`} text={String(a)} />
      ))}
    </div>
  );
}

function ScoreDetail({ output }: { output: Record<string, unknown> }) {
  return (
    <div className="space-y-2">
      <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-violet-50 p-4 text-center">
        <p className="text-[10px] font-bold text-[#FF7AAE]">爆款潜力</p>
        <p className="text-4xl font-black text-[#FF5C8A]">
          {displayField(output.totalScore)}
          <span className="text-lg">分</span>
        </p>
      </div>
      <ul className="space-y-1 rounded-2xl bg-white/95 p-3 text-xs text-slate-600 ring-1 ring-orange-100">
        {(output.tips as string[])?.map((t, i) => (
          <li key={i}>
            · {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ViralDetail({ output }: { output: Record<string, unknown> }) {
  const analysis =
    output.analysis && typeof output.analysis === "object"
      ? (output.analysis as Record<string, unknown>)
      : null;
  return (
    <div className="space-y-2">
      {analysis ? (
        <>
          <CopyBlock label="为什么能爆" text={displayField(analysis.reason)} />
          <CopyBlock label="钩子" text={displayField(analysis.hook)} />
        </>
      ) : null}
      {(output.scripts as string[])?.map((s, i) => (
        <CopyBlock key={i} label={`可复用脚本 ${i + 1}`} text={s} />
      ))}
    </div>
  );
}

function unwrapHistoryOutput(raw: Record<string, unknown>): Record<string, unknown> {
  for (const key of ["result", "data", "output"]) {
    const nested = raw[key];
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as Record<string, unknown>;
    }
  }
  return raw;
}

function renderBody(item: HistoryItem) {
  const output = item.output ? unwrapHistoryOutput(item.output) : undefined;
  if (!output || Object.keys(output).length === 0) {
    return (
      <p className="rounded-2xl bg-orange-50 px-3 py-6 text-center text-sm text-slate-500">
        这条记录生成时未保存详情，请重新生成一次即可收录完整内容。
      </p>
    );
  }

  const type = item.type;
  if (type.includes("树洞") || isTreeholeHistoryOutput(output)) {
    return <TreeholeDetail output={output} topic={item.topic} />;
  }
  if (type.includes("情绪") || type.includes("助手")) {
    if (isConsultantHistoryOutput(output)) {
      return <ConsultantDetail output={output} topic={item.topic} />;
    }
    if (isEmotionHistoryOutput(output)) {
      return <EmotionDetail output={output} topic={item.topic} />;
    }
    return <ConsultantDetail output={output} topic={item.topic} />;
  }
  if (type.includes("发布包") || type.includes("爆品")) return <PackDetail output={output} />;
  if (type.includes("复盘")) return <ReviewDetail output={output} />;
  if (type.includes("盲盒") || type.includes("选题")) return <TopicDetail output={output} />;
  if (type.includes("神回复")) return <ReplyDetail output={output} topic={item.topic} />;
  if (type.includes("打分")) return <ScoreDetail output={output} />;
  if (type.includes("拆解")) return <ViralDetail output={output} />;
  return (
    <pre className="max-h-[50vh] overflow-auto rounded-2xl bg-slate-50 p-3 text-[10px] text-slate-600">
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}

export function HistoryDetailView({ item }: { item: HistoryItem }) {
  const meta = historyTypeMeta(item.type);

  return (
    <div className="space-y-3">
      <Link
        href="/history"
        className="inline-flex items-center gap-1 text-xs font-bold text-[#FF7AAE]"
      >
        <ArrowLeft size={14} />
        返回内容库
      </Link>

      <div className={cn("overflow-hidden rounded-[28px] ring-1", meta.ring)}>
        <div className={cn("px-4 py-3.5 text-white bg-gradient-to-br", meta.grad)}>
          <p className="text-[10px] font-bold text-white/85">{meta.label}</p>
          <p className="mt-1 line-clamp-3 text-base font-black">{item.topic || "未命名内容"}</p>
          <p className="mt-1 text-[10px] text-white/80">{formatHistoryWhen(item.createdAt)}</p>
        </div>
        <div className="bg-[#FFF7F0]/50 p-3">{renderBody(item)}</div>
      </div>

      {item.type.includes("发布包") || item.type.includes("爆品") ? (
        <Link
          href={`/publish-pack?topic=${encodeURIComponent(item.topic)}`}
          className={cn(
            "flex w-full items-center justify-center rounded-2xl py-3 text-sm font-black text-white",
            `bg-gradient-to-r ${theme.primary}`
          )}
        >
          基于此选题再生成一版 →
        </Link>
      ) : null}
      {item.type.includes("树洞") || isTreeholeHistoryOutput(item.output ?? {}) ? (
        <Link
          href="/emotion-chat"
          className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#FF4F8B] py-3 text-sm font-black text-white shadow-md"
        >
          再去树洞聊聊 →
        </Link>
      ) : null}
      {item.type.includes("情绪") || item.type.includes("助手") ? (
        <Link
          href="/emotion-chat?mode=assistant"
          className="flex w-full items-center justify-center rounded-2xl bg-[#FFF0F5] py-3 text-sm font-black text-[#FF5C8A] ring-2 ring-[#FF7AAE]/25"
        >
          再去问一句 →
        </Link>
      ) : null}
    </div>
  );
}
