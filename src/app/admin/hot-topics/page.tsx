"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminCard,
  AdminPagination,
  AdminShell,
} from "@/components/admin/admin-shell";
import { AdminEditSheet } from "@/components/admin/admin-edit-sheet";
import { AdminHotTopicRowCard } from "@/components/admin/admin-hot-topic-row";
import {
  HotTopicEditor,
  emptyHotTopicForm,
  type HotTopicFormState,
} from "@/components/admin/hot-topic-editor";
import { useApp } from "@/contexts/app-context";
import {
  apiAdminCreateHotTopic,
  apiAdminListHotTopics,
  apiAdminPurgeCronHotTopics,
  apiAdminUpdateHotTopic,
  isClientServerMode,
  type AdminHotTopicRow,
} from "@/lib/client/server-api";
import { cn } from "@/lib/utils";

function rowToForm(row: AdminHotTopicRow): HotTopicFormState {
  return {
    displayTitle: row.display_title,
    rawTitle: row.raw_title,
    summary: row.summary,
    category: row.category,
    platform: row.platform,
    heatValue: row.heat_value,
    coverImage: row.cover_image,
    viralScore: String(row.viral_score),
    tags: row.tags.join(","),
    status: row.status,
    isNew: row.is_new,
    badgeLabel: row.badge_label ?? "",
    likesLabel: row.likes_label ?? "",
    savesLabel: row.saves_label ?? "",
    commentsLabel: row.comments_label ?? "",
    displayOrder: String(row.display_order ?? 0),
  };
}

function formToPayload(form: HotTopicFormState) {
  return {
    displayTitle: form.displayTitle,
    rawTitle: form.rawTitle || form.displayTitle,
    summary: form.summary,
    category: form.category,
    platform: form.platform,
    heatValue: form.heatValue,
    coverImage: form.coverImage,
    viralScore: Number(form.viralScore) || 70,
    tags: form.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    status: form.status,
    isNew: form.isNew,
    badgeLabel: form.badgeLabel || null,
    likesLabel: form.likesLabel || null,
    savesLabel: form.savesLabel || null,
    commentsLabel: form.commentsLabel || null,
    displayOrder: Number(form.displayOrder) || 0,
  };
}

export default function AdminHotTopicsPage() {
  const { showToast } = useApp();
  const serverMode = isClientServerMode();
  const editorRef = useRef<HTMLDivElement>(null);
  const [batch, setBatch] = useState("");
  const [batches, setBatches] = useState<string[]>([]);
  const [category, setCategory] = useState("全部");
  const [categoryStats, setCategoryStats] = useState<{ category: string; count: number }[]>(
    []
  );
  const [status, setStatus] = useState("active");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<AdminHotTopicRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<AdminHotTopicRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [purging, setPurging] = useState(false);
  const [sourceCounts, setSourceCounts] = useState<{
    cron: number;
    xhsInspiration: number;
    total: number;
  } | null>(null);
  const [platformFilter, setPlatformFilter] = useState<"xhs" | "cron" | "all">("xhs");
  const limit = 15;

  const openEditor = useCallback((row: AdminHotTopicRow | null, create: boolean) => {
    if (create) {
      setCreating(true);
      setEditing(null);
    } else if (row) {
      setEditing(row);
      setCreating(false);
    }
    requestAnimationFrame(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }, []);

  const load = useCallback(async () => {
    if (!serverMode) return;
    setLoading(true);
    try {
      const r = await apiAdminListHotTopics({
        batch: batch || undefined,
        status,
        category: category === "全部" ? undefined : category,
        platformFilter,
        q: q || undefined,
        page,
        limit,
      });
      if (r.error) {
        const msg =
          (r as { message?: string }).message ||
          (r.error === "forbidden" ? "无管理员权限" : "加载失败");
        showToast(msg);
        if (r.items?.length) {
          setItems(r.items);
          setTotal(r.total ?? 0);
        }
        return;
      }
      setItems(r.items ?? []);
      setTotal(r.total ?? 0);
      if (r.categoryStats?.length) setCategoryStats(r.categoryStats);
      if (r.sourceCounts) setSourceCounts(r.sourceCounts);
      if (r.batches?.length) {
        setBatches(r.batches);
        if (!batch) setBatch(r.batches[0]);
      } else if (r.resolvedBatch && !batch) {
        setBatch(r.resolvedBatch);
      }
    } finally {
      setLoading(false);
    }
  }, [serverMode, batch, status, category, platformFilter, q, page, showToast]);

  const onPurgeCron = async () => {
    const cronCount = sourceCounts?.cron ?? 0;
    if (!cronCount) {
      showToast("当前批次没有 Cron 来源数据");
      return;
    }
    const msg = `将删除本批次 ${cronCount} 条非 TikHub 热点（抖音/微博等 Cron 写入）。\n真实 TikHub 小红书数据在「小红书灵感」页，不受影响。\n\n确定继续？`;
    if (!window.confirm(msg)) return;
    setPurging(true);
    try {
      const r = await apiAdminPurgeCronHotTopics({
        batchDate: batch || undefined,
        scope: "cron",
        confirm: true,
      });
      if (r.deleted !== undefined) {
        showToast(`已删除 ${r.deleted} 条 Cron 热点`);
        if (r.after) setSourceCounts(r.after);
        setPage(1);
        void load();
      } else {
        showToast(r.message || r.error || "清理失败");
      }
    } finally {
      setPurging(false);
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const closeEditor = () => {
    setEditing(null);
    setCreating(false);
  };

  const onSaveEdit = async (form: HotTopicFormState) => {
    if (!editing) return;
    setSaving(true);
    try {
      const r = await apiAdminUpdateHotTopic(editing.id, formToPayload(form));
      if (r.item) {
        showToast("已保存");
        closeEditor();
        void load();
      } else showToast("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const onSaveCreate = async (form: HotTopicFormState) => {
    setSaving(true);
    try {
      const r = await apiAdminCreateHotTopic(formToPayload(form));
      if (r.item) {
        showToast("已创建");
        closeEditor();
        void load();
      } else showToast("创建失败");
    } finally {
      setSaving(false);
    }
  };

  const editorPanel =
    creating || editing ? (
      <HotTopicEditor
        key={editing?.id ?? "new"}
        initial={creating ? emptyHotTopicForm() : rowToForm(editing!)}
        saving={saving}
        onSave={creating ? onSaveCreate : onSaveEdit}
        onCancel={closeEditor}
      />
    ) : (
      <p className="py-12 text-center text-sm text-slate-500">
        点击列表项或右侧铅笔编辑；手机端会弹出编辑面板
      </p>
    );

  return (
    <AdminShell
      title="热点配置"
      desc="管理 hot_topics 表；真实 TikHub 小红书图文请在「小红书灵感」配置"
    >
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs leading-relaxed text-amber-950">
        <p className="font-bold">数据来源说明</p>
        <p className="mt-1 text-amber-900/90">
          列表中来源为 <strong>douyin / weibo</strong> 等的是每日 Cron 抓取，<strong>不是 TikHub API</strong>
          。TikHub 真实数据在{" "}
          <Link href="/admin/today-hot-topics" className="font-bold text-orange-700 underline">
            今日热点
          </Link>
          （表 <code className="rounded bg-white/80 px-1">xhs_hot_notes_daily</code>）。
        </p>
        {sourceCounts && sourceCounts.cron > 0 && (
          <p className="mt-2 text-amber-900">
            当前批次仍有 <strong>{sourceCounts.cron}</strong> 条 Cron 来源，可一键清理。
          </p>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <select
          className="rounded-xl border border-orange-100 px-3 py-2 text-xs"
          value={batch}
          onChange={(e) => {
            setBatch(e.target.value);
            setPage(1);
          }}
        >
          {(batches.length ? batches : [batch || "—"]).map((d) => (
            <option key={d} value={d}>
              批次 {d}
            </option>
          ))}
        </select>
        <select
          className="rounded-xl border border-orange-100 px-3 py-2 text-xs"
          value={platformFilter}
          onChange={(e) => {
            setPlatformFilter(e.target.value as "xhs" | "cron" | "all");
            setPage(1);
          }}
        >
          <option value="xhs">仅小红书灵感行</option>
          <option value="cron">仅 Cron 来源</option>
          <option value="all">全部来源</option>
        </select>
        <select
          className="rounded-xl border border-orange-100 px-3 py-2 text-xs"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">全部状态</option>
          <option value="active">上架</option>
          <option value="inactive">下架</option>
          <option value="rejected">拒绝</option>
        </select>
        <input
          className="min-w-[120px] flex-1 rounded-xl border border-orange-100 px-3 py-2 text-xs"
          placeholder="搜索标题"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
        />
        <button
          type="button"
          className="rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-800"
          onClick={() => void load()}
        >
          搜索
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-3 py-2 text-xs font-bold text-white"
          onClick={() => openEditor(null, true)}
        >
          <Plus size={14} />
          新建
        </button>
        {(sourceCounts?.cron ?? 0) > 0 && (
          <button
            type="button"
            disabled={purging}
            className="flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 disabled:opacity-50"
            onClick={() => void onPurgeCron()}
          >
            <Trash2 size={14} />
            {purging ? "清理中…" : `删除 Cron 数据 (${sourceCounts?.cron})`}
          </button>
        )}
      </div>

      {categoryStats.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-slate-500">分类热榜（点击筛选）</p>
          <div className="flex flex-wrap gap-1.5">
            {categoryStats.map((c) => (
              <button
                key={c.category}
                type="button"
                onClick={() => {
                  setCategory(c.category);
                  setPage(1);
                }}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[11px] font-bold transition",
                  category === c.category
                    ? "bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-orange-100"
                )}
              >
                {c.category}
                <span className="ml-1 opacity-80">({c.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <AdminCard
            title={
              category === "全部"
                ? `热点列表 (${total})`
                : `「${category}」热榜 (${total})`
            }
          >
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-400">加载中…</p>
            ) : (
              <ul className="space-y-2">
                {items.map((row, i) => (
                  <li key={row.id}>
                    <AdminHotTopicRowCard
                      row={row}
                      index={i}
                      selected={editing?.id === row.id}
                      onEdit={() => openEditor(row, false)}
                    />
                  </li>
                ))}
                {!items.length && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    {platformFilter === "cron"
                      ? "当前批次已无 Cron 来源热点"
                      : platformFilter === "xhs"
                        ? "暂无小红书灵感行；真实 TikHub 数据请去「小红书灵感」"
                        : "该分类下暂无热点，可换分类或调整筛选"}
                  </p>
                )}
              </ul>
            )}
            <AdminPagination page={page} total={total} limit={limit} onPage={setPage} />
          </AdminCard>
        </div>

        <div ref={editorRef} className="hidden lg:col-span-2 lg:block">
          <AdminCard
            title={creating ? "新建热点" : editing ? "编辑热点" : "编辑区"}
            className="sticky top-36"
          >
            {editorPanel}
          </AdminCard>
        </div>
      </div>

      <AdminEditSheet
        open={Boolean(creating || editing)}
        title={creating ? "新建热点" : "编辑热点"}
        onClose={closeEditor}
      >
        {editorPanel}
      </AdminEditSheet>
    </AdminShell>
  );
}
