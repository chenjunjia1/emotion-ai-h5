"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Save, Search } from "lucide-react";
import { AdminTodayHotRowCard } from "@/components/admin/admin-today-hot-row";
import { AdminCard, AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminGetXhsNotes,
  apiAdminQueryTodayHotTopics,
  apiAdminSaveXhsNotes,
  isClientServerMode,
} from "@/lib/client/server-api";
import type { XhsFeedTab } from "@/lib/xhs/xhs-page-tabs";
import { XHS_FEED_TABS } from "@/lib/xhs/xhs-page-tabs";
import type { XhsHotNote } from "@/lib/xhs/types";
import { buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import { cn } from "@/lib/utils";

type PageMode = "query" | "edit";

export default function AdminTodayHotTopicsPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();

  const [mode, setMode] = useState<PageMode>("query");
  const [dateKey, setDateKey] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [tab, setTab] = useState<XhsFeedTab>("hot");
  const [category, setCategory] = useState("全部");
  const [categoryStats, setCategoryStats] = useState<{ category: string; count: number }[]>(
    []
  );
  const [q, setQ] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [items, setItems] = useState<
    import("@/lib/admin/today-hot-query-types").AdminTodayHotQueryRow[]
  >([]);
  const [rawTotal, setRawTotal] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [fetchedAt, setFetchedAt] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const [editNotes, setEditNotes] = useState<XhsHotNote[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const runQuery = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminQueryTodayHotTopics({
        date: dateKey || undefined,
        tab,
        category: category === "全部" ? undefined : category,
        q: q || undefined,
      });
      if (r.error) {
        showToast("查询失败");
        return;
      }
      setItems(r.items ?? []);
      setRawTotal(r.rawTotal ?? 0);
      setFilteredTotal(r.filteredTotal ?? 0);
      setFetchedAt(r.fetchedAt);
      if (r.dateKey) setDateKey(r.dateKey);
      if (r.availableDates?.length) setAvailableDates(r.availableDates);
      if (r.categoryStats?.length) setCategoryStats(r.categoryStats);
    } finally {
      setLoading(false);
    }
  }, [serverMode, dateKey, tab, category, q, showToast]);

  const loadEditNotes = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const [meta, r] = await Promise.all([
        apiAdminQueryTodayHotTopics({ date: dateKey || undefined }),
        apiAdminGetXhsNotes(dateKey || undefined),
      ]);
      if (r.error) {
        showToast("加载失败");
        return;
      }
      setEditNotes(r.notes ?? []);
      if (r.dateKey) setDateKey(r.dateKey);
      setRawTotal(r.notes?.length ?? 0);
      setFetchedAt(r.fetchedAt);
      if (meta.availableDates?.length) setAvailableDates(meta.availableDates);
    } finally {
      setLoading(false);
    }
  }, [serverMode, dateKey, showToast]);

  useEffect(() => {
    if (mode === "query") void runQuery();
    else void loadEditNotes();
  }, [mode, tab, category, dateKey, q, runQuery, loadEditNotes]);

  const onSearch = () => {
    setQ(searchInput.trim());
  };

  const switchToEdit = (noteId?: string) => {
    setMode("edit");
    void loadEditNotes().then(() => {
      if (noteId) setExpanded(noteId);
    });
  };

  const updateNote = (id: string, patch: Partial<XhsHotNote>) => {
    setEditNotes((list) => list.map((n) => (n.id === id ? { ...n, ...patch } : n)));
  };

  const moveNote = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= editNotes.length) return;
    const copy = [...editNotes];
    const [row] = copy.splice(index, 1);
    copy.splice(next, 0, row);
    setEditNotes(copy);
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const r = await apiAdminSaveXhsNotes(editNotes, dateKey);
      if (r.ok) {
        showToast(`已保存 ${editNotes.length} 条`);
        setMode("query");
        void runQuery();
      } else showToast("保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      title="今日热点"
      desc="查询用户端 /hot-topics 展示内容（TikHub → xhs_hot_notes_daily），Tab 筛选与用户端一致"
    >
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode("query")}
          className={cn(
            "rounded-full px-4 py-2 text-xs font-bold",
            mode === "query"
              ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white"
              : "bg-white text-slate-600 ring-1 ring-orange-100"
          )}
        >
          内容查询
        </button>
        <button
          type="button"
          onClick={() => switchToEdit()}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold",
            mode === "edit"
              ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white"
              : "bg-white text-slate-600 ring-1 ring-orange-100"
          )}
        >
          <Pencil size={12} />
          编辑排序
        </button>
        <a
          href="/hot-topics"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto rounded-full bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800"
        >
          打开用户端预览 ↗
        </a>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <select
          className="rounded-xl border border-orange-100 px-3 py-2 text-xs"
          value={dateKey}
          onChange={(e) => setDateKey(e.target.value)}
        >
          {(availableDates.length ? availableDates : [dateKey || "今日"]).map((d) => (
            <option key={d} value={d}>
              日期 {d}
            </option>
          ))}
        </select>
        {mode === "query" ? (
          <>
            <select
              className="rounded-xl border border-orange-100 px-3 py-2 text-xs"
              value={tab}
              onChange={(e) => setTab(e.target.value as XhsFeedTab)}
            >
              {XHS_FEED_TABS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                  {t.hint ? `（${t.hint}）` : ""}
                </option>
              ))}
            </select>
            <input
              className="min-w-[120px] flex-1 rounded-xl border border-orange-100 px-3 py-2 text-xs"
              placeholder="搜索标题 / 展示标题 / noteId"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
            <button
              type="button"
              className="flex items-center gap-1 rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-800"
              onClick={onSearch}
            >
              <Search size={14} />
              查询
            </button>
          </>
        ) : (
          <Button className="ml-auto gap-1" disabled={saving} onClick={() => void onSave()}>
            <Save size={14} />
            {saving ? "保存中…" : "保存全部"}
          </Button>
        )}
      </div>

      {mode === "query" && categoryStats.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {categoryStats.map((c) => (
            <button
              key={c.category}
              type="button"
              onClick={() => {
                setCategory(c.category);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11px] font-bold",
                category === c.category
                  ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white"
                  : "bg-white text-slate-600 ring-1 ring-orange-100"
              )}
            >
              {c.category} ({c.count})
            </button>
          ))}
        </div>
      ) : null}

      <p className="mb-3 text-[11px] text-slate-500">
        库内共 <strong>{rawTotal}</strong> 条
        {mode === "query" ? (
          <>
            ，当前 Tab「{XHS_FEED_TABS.find((t) => t.id === tab)?.label}」筛选后{" "}
            <strong>{filteredTotal}</strong> 条
          </>
        ) : null}
        {fetchedAt ? (
          <span className="ml-2 text-slate-400">
            抓取于 {new Date(fetchedAt).toLocaleString("zh-CN")}
          </span>
        ) : null}
      </p>

      {mode === "query" ? (
        <AdminCard title={`查询结果 (${filteredTotal})`}>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">查询中…</p>
          ) : items.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-500">
              <p>暂无数据。请确认已配置 TIKHUB_API_KEY 并执行 Cron 刷新。</p>
              <Link
                href="/admin/content"
                className="mt-2 inline-block text-orange-700 underline"
              >
                去内容统计手动刷新
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((row) => (
                <li key={row.note.id}>
                  <AdminTodayHotRowCard
                    row={row}
                    tabHot={tab === "hot"}
                    onEdit={() => switchToEdit(row.note.id)}
                  />
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      ) : (
        <AdminCard title={`编辑排序 (${editNotes.length})`}>
          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
          ) : editNotes.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">当日暂无笔记可编辑</p>
          ) : (
            <ul className="space-y-3">
              {editNotes.map((note, index) => {
                const copy = buildXhsCardCopy(note);
                const open = expanded === note.id;
                return (
                  <li
                    key={note.id}
                    className="overflow-hidden rounded-xl border border-orange-100/80 bg-white"
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2.5 text-left"
                      onClick={() => setExpanded(open ? null : note.id)}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-black/60 text-[9px] font-black text-white">
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-bold">
                        {copy.headline}
                      </span>
                      <span className="text-[10px] text-slate-400">{note.category}</span>
                    </button>
                    {open ? (
                      <div className="space-y-2 border-t border-orange-50 px-3 py-3">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="rounded border px-2 py-1 text-[10px]"
                            onClick={() => moveNote(index, -1)}
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            className="rounded border px-2 py-1 text-[10px]"
                            onClick={() => moveNote(index, 1)}
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <Field label="原标题（影响展示标题）">
                          <input
                            className="w-full rounded-lg border px-2 py-1.5 text-sm"
                            value={note.title}
                            onChange={(e) => updateNote(note.id, { title: e.target.value })}
                          />
                        </Field>
                        <Field label="副文案">
                          <input
                            className="w-full rounded-lg border px-2 py-1.5 text-sm"
                            value={note.desc}
                            onChange={(e) => updateNote(note.id, { desc: e.target.value })}
                          />
                        </Field>
                        <Field label="分类">
                          <input
                            className="w-full rounded-lg border px-2 py-1.5 text-sm"
                            value={note.category}
                            onChange={(e) =>
                              updateNote(note.id, {
                                category: e.target.value as XhsHotNote["category"],
                              })
                            }
                          />
                        </Field>
                        <div className="grid grid-cols-3 gap-2">
                          <Field label="点赞">
                            <input
                              type="number"
                              className="w-full rounded-lg border px-2 py-1.5 text-sm"
                              value={note.likedCount}
                              onChange={(e) =>
                                updateNote(note.id, {
                                  likedCount: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </Field>
                          <Field label="收藏">
                            <input
                              type="number"
                              className="w-full rounded-lg border px-2 py-1.5 text-sm"
                              value={note.collectedCount}
                              onChange={(e) =>
                                updateNote(note.id, {
                                  collectedCount: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </Field>
                          <Field label="评论">
                            <input
                              type="number"
                              className="w-full rounded-lg border px-2 py-1.5 text-sm"
                              value={note.commentCount}
                              onChange={(e) =>
                                updateNote(note.id, {
                                  commentCount: Number(e.target.value) || 0,
                                })
                              }
                            />
                          </Field>
                        </div>
                        <Field label="封面 URL">
                          <input
                            className="w-full rounded-lg border px-2 py-1.5 text-sm"
                            value={note.images[0] ?? ""}
                            onChange={(e) =>
                              updateNote(note.id, {
                                images: e.target.value
                                  ? [e.target.value, ...note.images.slice(1)]
                                  : note.images.slice(1),
                              })
                            }
                          />
                        </Field>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>
      )}
    </AdminShell>
  );
}
