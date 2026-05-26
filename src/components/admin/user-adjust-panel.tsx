"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { apiAdminAdjustUser } from "@/lib/client/server-api";
import type { User } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

const PLANS: User["plan"][] = ["free", "pro", "premium", "studio"];

export function UserAdjustPanel({
  user,
  onUpdated,
  onToast,
}: {
  user: User | null;
  onUpdated?: (u: User) => void;
  onToast: (msg: string) => void;
}) {
  const [dailyQuota, setDailyQuota] = useState("");
  const [bonusQuota, setBonusQuota] = useState("");
  const [videoCoin, setVideoCoin] = useState("");
  const [plan, setPlan] = useState<User["plan"]>("free");
  const [resetUsed, setResetUsed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDailyQuota(String(user.dailyQuota));
    setBonusQuota(String(user.bonusQuota));
    setVideoCoin(String(user.videoCoin));
    setPlan(user.plan);
    setResetUsed(false);
  }, [user]);

  if (!user) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        请从列表中选择用户
      </p>
    );
  }

  const onSave = async () => {
    setSaving(true);
    try {
      const r = await apiAdminAdjustUser(user.id, {
        dailyQuota: dailyQuota ? Number(dailyQuota) : undefined,
        bonusQuota: bonusQuota ? Number(bonusQuota) : undefined,
        videoCoin: videoCoin ? Number(videoCoin) : undefined,
        plan,
        resetUsedCount: resetUsed,
        reason: "admin_panel",
      });
      if (r.user) {
        onToast(`已更新 ${r.user.mobile}`);
        onUpdated?.(r.user);
      } else {
        onToast("保存失败");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-orange-50 px-3 py-2 text-sm text-orange-900">
        <b>{user.mobile}</b>
        <span className="mx-2 text-orange-300">·</span>
        {user.plan}
        <span className="mx-2 text-orange-300">·</span>
        已用 {user.usedCount}/{user.dailyQuota}
        <span className="mx-2 text-orange-300">·</span>
        奖励 {user.bonusQuota}
        <span className="mx-2 text-orange-300">·</span>
        视频币 {user.videoCoin}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="日额度">
          <input
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={dailyQuota}
            onChange={(e) => setDailyQuota(e.target.value)}
          />
        </Field>
        <Field label="奖励额度">
          <input
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={bonusQuota}
            onChange={(e) => setBonusQuota(e.target.value)}
          />
        </Field>
        <Field label="视频币">
          <input
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={videoCoin}
            onChange={(e) => setVideoCoin(e.target.value)}
          />
        </Field>
        <Field label="会员套餐">
          <select
            className="w-full rounded-xl border border-orange-100 px-3 py-2 text-sm"
            value={plan}
            onChange={(e) => setPlan(e.target.value as User["plan"])}
          >
            {PLANS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={resetUsed}
          onChange={(e) => setResetUsed(e.target.checked)}
          className="rounded border-orange-200"
        />
        重置今日已用额度（used_count → 0）
      </label>

      <Button className="w-full sm:w-auto" disabled={saving} onClick={() => void onSave()}>
        {saving ? "保存中…" : "保存调整"}
      </Button>
    </div>
  );
}

export function UserRowButton({
  user,
  selected,
  onSelect,
  extra,
}: {
  user: User & { createdAt?: string };
  selected: boolean;
  onSelect: () => void;
  extra?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border px-3 py-2.5 text-left text-xs transition",
        selected
          ? "border-orange-300 bg-orange-50 ring-2 ring-orange-200"
          : "border-orange-100/80 bg-white hover:bg-orange-50/50"
      )}
    >
      <div className="font-bold text-slate-800">{user.mobile}</div>
      <div className="mt-0.5 text-slate-500">
        {user.plan} · 额度 {user.usedCount}/{user.dailyQuota} · 币 {user.videoCoin}
        {extra && <> · {extra}</>}
      </div>
    </button>
  );
}
