"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronRight, ExternalLink, Settings2 } from "lucide-react";
import { Field } from "@/components/ui/field";
import type { XhsAudience, XhsContentType, XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

const CONTENT_TYPES: XhsContentType[] = ["小红书图文", "朋友圈文案", "抖音短文案"];
const AUDIENCES: XhsAudience[] = ["女生爱发", "男生爱发", "通用"];

type Props = {
  note: XhsHotNote;
  onChange: (patch: Partial<XhsHotNote>) => void;
  className?: string;
};

/** 今日热点 · 单条笔记的扩展字段（Tab 筛选、标签等） */
export function AdminXhsNoteMoreConfig({ note, onChange, className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("rounded-xl border border-dashed border-orange-200/80 bg-orange-50/40", className)}>
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <Settings2 size={14} className="shrink-0 text-orange-600" />
        <span className="flex-1 text-xs font-bold text-orange-900">更多配置</span>
        <span className="hidden text-[10px] text-orange-700/80 sm:inline">
          标签 · 内容类型 · 作者
        </span>
        {open ? (
          <ChevronDown size={14} className="shrink-0 text-orange-700" />
        ) : (
          <ChevronRight size={14} className="shrink-0 text-orange-700" />
        )}
      </button>

      {open ? (
        <div className="space-y-2 border-t border-orange-100/80 px-3 pb-3 pt-2">
          <p className="text-[10px] leading-relaxed text-slate-500">
            影响用户端 Tab 筛选与卡片标签；改完请点页顶「保存全部」。
          </p>

          <div className="grid gap-2 sm:grid-cols-2">
            <Field label="内容类型">
              <select
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                value={note.contentType}
                onChange={(e) =>
                  onChange({ contentType: e.target.value as XhsContentType })
                }
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="氛围标签">
              <select
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                value={note.audience}
                onChange={(e) => onChange({ audience: e.target.value as XhsAudience })}
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="标签（逗号分隔）">
            <input
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              value={note.tags.join("，")}
              placeholder="种草，治愈，周末"
              onChange={(e) =>
                onChange({
                  tags: e.target.value
                    .split(/[,，]/)
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>

          <Field label="作者昵称">
            <input
              className="w-full rounded-lg border px-2 py-1.5 text-sm"
              value={note.authorName}
              onChange={(e) => onChange({ authorName: e.target.value })}
            />
          </Field>

          <div className="grid grid-cols-2 gap-2">
            <Field label="分享数">
              <input
                type="number"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                value={note.shareCount}
                onChange={(e) =>
                  onChange({ shareCount: Number(e.target.value) || 0 })
                }
              />
            </Field>
            <Field label="热度分">
              <input
                type="number"
                className="w-full rounded-lg border px-2 py-1.5 text-sm"
                value={note.hotScore}
                onChange={(e) => onChange({ hotScore: Number(e.target.value) || 0 })}
              />
            </Field>
          </div>

          <Field label="noteId（只读）">
            <input
              className="w-full rounded-lg border bg-slate-50 px-2 py-1.5 text-[11px] text-slate-500"
              value={note.noteId}
              readOnly
            />
          </Field>

          <Link
            href="/admin/hot-topics"
            className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-white px-3 py-2 text-[11px] font-bold text-orange-800 ring-1 ring-orange-100"
          >
            <ExternalLink size={12} />
            去 Cron 热点库配置其他独立条目
          </Link>
        </div>
      ) : null}
    </div>
  );
}
