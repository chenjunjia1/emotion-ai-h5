"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download, PlayCircle, Save, Share2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { AiDisclaimer } from "@/components/ui/ai-disclaimer";
import { RiskCard } from "@/components/ui/risk-card";
import { useApp } from "@/contexts/app-context";
import { canCreateVideo, checkContentRisk } from "@/lib/risk";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import type { RiskResult } from "@/lib/types/v1";

export default function AiVideoPage() {
  const {
    user,
    videoDraft,
    createVideoTask,
    tasks,
    showToast,
    setLoginOpen,
    tr,
  } = useApp();
  const [sub, setSub] = useState<"avatar" | "auto">("avatar");
  const [script, setScript] = useState(
    "如果你是新手，第一周别急着追爆款，先把账号方向跑清楚。"
  );
  const [risk, setRisk] = useState<RiskResult | null>(null);

  useEffect(() => {
    if (videoDraft?.script) setScript(videoDraft.script);
  }, [videoDraft]);

  const cost = sub === "avatar" ? 25 : 59;

  const create = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    const r = checkContentRisk(script);
    setRisk(r);
    if (!canCreateVideo(r.level)) {
      showToast(tr("videoRiskBlock"));
      return;
    }
    createVideoTask({
      taskType: sub,
      script,
      duration: 30,
    });
  };

  return (
    <AppShell>
      <SectionTitle
        eyebrow={tr("videoEyebrow")}
        title={tr("videoTitle")}
        desc={tr("videoDesc")}
      />
      <div className="grid grid-cols-2 rounded-2xl bg-orange-50/80 p-1">
        <button
          type="button"
          onClick={() => setSub("avatar")}
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-bold",
            sub === "avatar" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"
          )}
        >
          {tr("tabAvatar")}
        </button>
        <button
          type="button"
          onClick={() => setSub("auto")}
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-bold",
            sub === "auto" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
          )}
        >
          {tr("tabAuto")}
        </button>
      </div>

      <Card>
        <CardContent className="space-y-4">
          <Field
            label={sub === "avatar" ? tr("labelAvatarScript") : tr("labelAutoScript")}
          >
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={6}
              className={cn(
                "w-full resize-none rounded-2xl border bg-white px-4 py-3 text-sm leading-7 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100",
                theme.border
              )}
            />
          </Field>
          <div className="rounded-3xl bg-gradient-to-br from-[#F9735B] to-[#D9468F] p-4 text-white">
            <div className="text-xs text-white/80">{tr("videoCostLabel")}</div>
            <div className="mt-1 text-3xl font-bold">
              {cost} {tr("videoCoinUnit")}
            </div>
            <div className="mt-2 text-xs text-white/75">
              {tr("videoBalance")}：{user?.videoCoin ?? 0} · {tr("videoFrozen")}：
              {user?.frozenVideoCoin ?? 0}
            </div>
          </div>
          <Button className="w-full" onClick={create}>
            <PlayCircle size={18} />
            {tr("videoCreateTask")}
          </Button>
          <p className="text-center text-[11px] text-slate-400">{tr("videoHint")}</p>
          {user && user.videoCoin < cost && (
            <Link href="/profile?pricing=1">
              <Button variant="secondary" className="w-full">
                {tr("videoBuyCoins")}
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {risk && <RiskCard risk={risk} />}

      <Card>
        <CardContent>
          <h3 className="mb-3 font-bold">{tr("recentTasks")}</h3>
          {tasks.length ? (
            tasks.slice(0, 6).map((t) => (
              <div
                key={t.id}
                className="mb-2 rounded-2xl bg-orange-50/80 p-3 text-xs leading-6 text-orange-900"
              >
                <b>{t.taskType === "avatar" ? tr("tabAvatar") : tr("tabAuto")}</b> ·{" "}
                {t.status} · {t.costVideoCoin}
                {tr("videoCoinUnit")}
                {t.status === "success" && (
                  <div className="mt-2 rounded-xl bg-gradient-to-r from-orange-100 to-rose-100 p-3">
                    <div className="text-[10px] text-orange-700">{tr("mockMp4")}</div>
                    <div className="mt-1 font-mono text-[10px]">{t.videoUrl}</div>
                  </div>
                )}
                {t.errorMessage && (
                  <div className="mt-1 text-rose-600">{t.errorMessage}</div>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">{tr("noTasks")}</p>
          )}
        </CardContent>
      </Card>

      <AiDisclaimer />
      <div className="grid grid-cols-3 gap-2">
        <Button variant="secondary" onClick={() => showToast(tr("shareV11"))}>
          <Share2 size={16} /> {tr("share")}
        </Button>
        <Button variant="secondary" onClick={() => showToast(tr("download"))}>
          <Download size={16} /> {tr("download")}
        </Button>
        <Button variant="secondary" onClick={() => showToast(tr("saved"))}>
          <Save size={16} /> {tr("save")}
        </Button>
      </div>
    </AppShell>
  );
}
