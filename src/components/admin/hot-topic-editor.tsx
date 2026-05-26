"use client";

import { useEffect, useState } from "react";
import { AdminImageUpload } from "@/components/admin/admin-image-upload";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";

export type HotTopicFormState = {
  displayTitle: string;
  rawTitle: string;
  summary: string;
  category: string;
  platform: string;
  heatValue: string;
  coverImage: string;
  viralScore: string;
  tags: string;
  status: "active" | "inactive" | "rejected";
  isNew: boolean;
  badgeLabel: string;
  likesLabel: string;
  savesLabel: string;
  commentsLabel: string;
  displayOrder: string;
};

export const emptyHotTopicForm = (): HotTopicFormState => ({
  displayTitle: "",
  rawTitle: "",
  summary: "",
  category: "宠物萌系",
  platform: "xiaohongshu_inspiration",
  heatValue: "19.6w",
  coverImage: "/images/hot/pet.svg",
  viralScore: "75",
  tags: "种草方向,萌宠",
  status: "active",
  isNew: true,
  badgeLabel: "最多人点",
  likesLabel: "19.6w",
  savesLabel: "1.5w",
  commentsLabel: "9.6k",
  displayOrder: "0",
});

type Props = {
  initial?: Partial<HotTopicFormState>;
  saving?: boolean;
  onSave: (form: HotTopicFormState) => void | Promise<void>;
  onCancel?: () => void;
};

export function HotTopicEditor({ initial, saving, onSave, onCancel }: Props) {
  const [form, setForm] = useState<HotTopicFormState>({
    ...emptyHotTopicForm(),
    ...initial,
  });
  const [uploadHint, setUploadHint] = useState("");

  useEffect(() => {
    if (initial) setForm({ ...emptyHotTopicForm(), ...initial });
  }, [initial]);

  const set = (key: keyof HotTopicFormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const coverPreview = form.coverImage?.trim() || "/images/hot/default.svg";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
        <img
          src={coverPreview}
          alt=""
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
          referrerPolicy="no-referrer"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/images/hot/default.svg";
          }}
        />
        <p className="text-[11px] leading-relaxed text-slate-500">
          封面预览（改「封面 URL」可实时看效果）
        </p>
      </div>
      <Field label="展示标题 *">
        <input
          className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
          value={form.displayTitle}
          onChange={(e) => set("displayTitle", e.target.value)}
          placeholder="贴贴预警 | 宠物萌系爆款方向"
        />
      </Field>
      <Field label="副标题 / 策略说明">
        <input
          className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
          value={form.summary}
          onChange={(e) => set("summary", e.target.value)}
          placeholder="萌感互动 + 一句口语标题"
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="分类标签">
          <input
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          />
        </Field>
        <Field label="平台 key">
          <input
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={form.platform}
            onChange={(e) => set("platform", e.target.value)}
            placeholder="douyin / bilibili"
          />
        </Field>
      </div>
      <Field label="角标文案（如 最多人点）">
        <input
          className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
          value={form.badgeLabel}
          onChange={(e) => set("badgeLabel", e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="点赞展示">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.likesLabel}
            onChange={(e) => set("likesLabel", e.target.value)}
          />
        </Field>
        <Field label="收藏展示">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.savesLabel}
            onChange={(e) => set("savesLabel", e.target.value)}
          />
        </Field>
        <Field label="评论展示">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.commentsLabel}
            onChange={(e) => set("commentsLabel", e.target.value)}
          />
        </Field>
      </div>
      <Field label="标签（逗号分隔）">
        <input
          className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
        />
      </Field>
      <Field label="封面图">
        <AdminImageUpload
          label="从相册 / 本地上传"
          onUploaded={(url) => {
            set("coverImage", url);
            setUploadHint("上传成功，记得点下方「保存」");
          }}
          onError={(msg) => setUploadHint(msg)}
        />
        {uploadHint ? (
          <p
            className={`mt-2 text-[11px] ${uploadHint.includes("成功") ? "text-emerald-600" : "text-rose-600"}`}
          >
            {uploadHint}
          </p>
        ) : null}
        <input
          className="mt-2 w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
          value={form.coverImage}
          onChange={(e) => set("coverImage", e.target.value)}
          placeholder="/generated/xxx.jpg 或粘贴外链"
        />
        <p className="mt-1 text-[10px] text-slate-400">
          上传后自动填入地址；开发环境存到 public/generated，上线可配 COS
        </p>
      </Field>
      <div className="grid grid-cols-3 gap-2">
        <Field label="热度">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.heatValue}
            onChange={(e) => set("heatValue", e.target.value)}
          />
        </Field>
        <Field label="爆款率">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.viralScore}
            onChange={(e) => set("viralScore", e.target.value)}
          />
        </Field>
        <Field label="排序">
          <input
            className="w-full rounded-xl border border-orange-100 px-2 py-2 text-sm"
            value={form.displayOrder}
            onChange={(e) => set("displayOrder", e.target.value)}
          />
        </Field>
      </div>
      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm">
          <select
            className="rounded-lg border border-orange-100 px-2 py-1 text-sm"
            value={form.status}
            onChange={(e) =>
              set("status", e.target.value as HotTopicFormState["status"])
            }
          >
            <option value="active">上架</option>
            <option value="inactive">下架</option>
            <option value="rejected">拒绝</option>
          </select>
          状态
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isNew}
            onChange={(e) => set("isNew", e.target.checked)}
          />
          NEW 角标
        </label>
      </div>
      <div className="flex gap-2">
        <Button disabled={saving} onClick={() => void onSave(form)}>
          {saving ? "保存中…" : "保存"}
        </Button>
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            取消
          </Button>
        ) : null}
      </div>
    </div>
  );
}
