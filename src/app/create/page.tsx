"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Bot, Flame, Wand2 } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { RiskCard } from "@/components/ui/risk-card";
import { AiDisclaimer } from "@/components/ui/ai-disclaimer";
import { useApp } from "@/contexts/app-context";
import { cn } from "@/lib/utils";
import type { RiskResult } from "@/lib/types/v1";

function CreateContent() {
  const searchParams = useSearchParams();
  const { generateDaily, generateViral, setVideoDraft, tr } = useApp();
  const [sub, setSub] = useState<"daily" | "viral">("daily");
  const [topic, setTopic] = useState("新手做账号第一周怎么发内容");
  const [viralTitle, setViralTitle] = useState(
    "普通人做账号，为什么越努力越没流量？"
  );
  const [viralCopy, setViralCopy] = useState(
    "很多人做账号没流量，不是因为不努力，而是一开始定位就太散了。"
  );
  const [risk, setRisk] = useState<RiskResult | null>(null);
  const [dailyResult, setDailyResult] = useState<Record<string, unknown> | null>(null);
  const [viralResult, setViralResult] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "viral") setSub("viral");
    if (tab === "daily") setSub("daily");
    const topicParam = searchParams.get("topic");
    if (topicParam) setTopic(topicParam);
  }, [searchParams]);

  const onDaily = async () => {
    const { result, risk: r } = await generateDaily(topic);
    setRisk(r);
    if (result) setDailyResult(result as Record<string, unknown>);
    else setDailyResult(null);
  };

  const onViral = async () => {
    const { result, risk: r } = await generateViral(viralTitle, viralCopy);
    setRisk(r);
    if (result) setViralResult(result as Record<string, unknown>);
    else setViralResult(null);
  };

  return (
    <AppShell>
      <SectionTitle
        eyebrow={tr("createEyebrow")}
        title={tr("createTitle")}
        desc={tr("createDesc")}
      />
      <div className="grid grid-cols-2 rounded-2xl bg-orange-50/80 p-1">
        <button
          type="button"
          onClick={() => {
            setSub("daily");
            setRisk(null);
          }}
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-bold",
            sub === "daily" ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"
          )}
        >
          {tr("tabDaily")}
        </button>
        <button
          type="button"
          onClick={() => {
            setSub("viral");
            setRisk(null);
          }}
          className={cn(
            "rounded-xl px-4 py-3 text-sm font-bold",
            sub === "viral" ? "bg-white text-rose-600 shadow-sm" : "text-slate-500"
          )}
        >
          {tr("tabViral")}
        </button>
      </div>

      {sub === "daily" ? (
        <Card className="mt-4">
          <CardContent className="space-y-4">
            <Field label={tr("labelTodayTopic")}>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-orange-100 px-4 py-3 text-sm leading-7 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </Field>
            <Button className="w-full" onClick={onDaily}>
              <Wand2 size={18} />
              {tr("createDailyBtn")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="mt-4">
          <CardContent className="space-y-4">
            <Field label={tr("labelViralTitle")}>
              <textarea
                value={viralTitle}
                onChange={(e) => setViralTitle(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-2xl border border-orange-100 px-4 py-3 text-sm outline-none focus:border-orange-300"
              />
            </Field>
            <Field label={tr("labelViralCopy")}>
              <textarea
                value={viralCopy}
                onChange={(e) => setViralCopy(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-2xl border border-orange-100 px-4 py-3 text-sm leading-7 outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
              />
            </Field>
            <Button className="w-full" onClick={onViral}>
              <Flame size={18} />
              {tr("createViralBtn")}
            </Button>
          </CardContent>
        </Card>
      )}

      {risk && (
        <div className="mt-4">
          <RiskCard risk={risk} />
        </div>
      )}

      {dailyResult && sub === "daily" && (
        <div className="mt-4 space-y-4">
          <Card className="bg-gradient-to-br from-orange-50 to-rose-50">
            <CardContent>
              <div className="font-bold">{tr("dailyGenerated")}</div>
              <p className="mt-2 text-sm text-slate-600">{String(dailyResult.topic)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-3 font-bold">{tr("labelViralTitle")}</h3>
              <div className="space-y-2">
                {(dailyResult.titles as string[])?.slice(0, 5).map((t, i) => (
                  <div key={t} className="rounded-2xl bg-orange-50 p-3 text-xs leading-6">
                    <b>{i + 1}.</b> {t}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-2 font-bold">{tr("labelAvatarScript")}</h3>
              <p className="text-sm leading-7 text-slate-600">
                <b>{tr("scriptHook")}</b>
                {String(dailyResult.hook)}
                <br />
                <b>{tr("scriptMid")}</b>
                {String(dailyResult.script)}
              </p>
            </CardContent>
          </Card>
          <AiDisclaimer />
          <Link
            href="/ai-video"
            onClick={() =>
              setVideoDraft({
                script: `${dailyResult.hook}\n${dailyResult.script}`,
              })
            }
          >
            <Button className="w-full">
              <Bot size={18} />
              {tr("oneClickVideo")}
            </Button>
          </Link>
        </div>
      )}

      {viralResult && sub === "viral" && (
        <div className="mt-4 space-y-4">
          <Card>
            <CardContent>
              <div className="font-bold">{tr("viralDone")}</div>
              <p className="mt-2 text-sm text-slate-600">
                {(viralResult.analysis as { reason: string })?.reason}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-3 font-bold">{tr("viralScripts")}</h3>
              <div className="space-y-2">
                {(viralResult.scripts as string[])?.map((s, i) => (
                  <div key={s} className="rounded-2xl bg-rose-50 p-3 text-xs leading-6">
                    <b>
                      {tr("scriptVersion")}
                      {i + 1}：
                    </b>
                    {s}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <AiDisclaimer />
          <Link
            href="/ai-video"
            onClick={() =>
              setVideoDraft({
                script: (viralResult.scripts as string[])?.[0] ?? "",
              })
            }
          >
            <Button className="w-full">
              <Bot size={18} />
              {tr("viralToVideo")}
            </Button>
          </Link>
        </div>
      )}
    </AppShell>
  );
}

export default function CreatePage() {
  const { tr } = useApp();
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-orange-600">{tr("loading")}</div>
      }
    >
      <CreateContent />
    </Suspense>
  );
}
