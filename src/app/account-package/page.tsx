"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Save, Share2, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Pill } from "@/components/ui/pill";
import { RiskCard } from "@/components/ui/risk-card";
import { SelectField } from "@/components/ui/select-field";
import { useApp } from "@/contexts/app-context";
import { AiDisclaimer } from "@/components/ui/ai-disclaimer";
import {
  GOAL_VALUES,
  labeledGoals,
  labeledPlatforms,
  labeledStyles,
  labeledTracks,
  TRACK_VALUES,
} from "@/lib/i18n/form-options";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import type { RiskResult } from "@/lib/types/v1";

function AccountPackageContent() {
  const searchParams = useSearchParams();
  const { generateAccount, showToast, tr } = useApp();
  const [platform, setPlatform] = useState("抖音");
  const [track, setTrack] = useState("婚恋情感");
  const [goal, setGoal] = useState("涨粉");
  const [style, setStyle] = useState("温柔走心");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [risk, setRisk] = useState<RiskResult | null>(null);

  const goals = labeledGoals(tr);

  useEffect(() => {
    const fromUrl = searchParams.get("track");
    if (fromUrl && (TRACK_VALUES as readonly string[]).includes(fromUrl)) {
      setTrack(fromUrl);
    }
  }, [searchParams]);

  const generate = async () => {
    const { result: res, risk: r } = await generateAccount({
      platform,
      track,
      goal,
      style,
    });
    setRisk(r);
    if (res) setResult(res as Record<string, unknown>);
    else setResult(null);
  };

  const copyAll = async () => {
    if (!result) return;
    await copyToClipboard(JSON.stringify(result, null, 2));
    showToast(tr("copied"));
  };

  return (
    <AppShell>
      <SectionTitle
        eyebrow={tr("accountEyebrow")}
        title={tr("accountTitle")}
        desc={tr("accountDesc")}
      />
      <Card>
        <CardContent className="space-y-4">
          <Field label={tr("labelPlatform")}>
            <SelectField
              value={platform}
              onChange={setPlatform}
              labeledOptions={labeledPlatforms(tr)}
            />
          </Field>
          <Field label={tr("labelTrack")}>
            <SelectField
              value={track}
              onChange={setTrack}
              labeledOptions={labeledTracks(tr)}
            />
          </Field>
          <Field label={tr("labelGoal")}>
            <div className="flex flex-wrap gap-2">
              {GOAL_VALUES.map((value) => {
                const label = goals.find((g) => g.value === value)?.label ?? value;
                return (
                  <Pill
                    key={value}
                    active={goal === value}
                    onClick={() => setGoal(value)}
                  >
                    {label}
                  </Pill>
                );
              })}
            </div>
          </Field>
          <Field label={tr("labelStyle")}>
            <SelectField
              value={style}
              onChange={setStyle}
              labeledOptions={labeledStyles(tr)}
            />
          </Field>
          <Button className="w-full" onClick={generate}>
            <Sparkles size={18} />
            {tr("accountGenerateBtn")}
          </Button>
        </CardContent>
      </Card>

      {risk && <RiskCard risk={risk} />}

      {result && (
        <div className="mt-4 space-y-4">
          <Card className="border-orange-100 bg-gradient-to-br from-orange-50 to-rose-50">
            <CardContent>
              <div className="font-bold">{tr("accountGenerated")}</div>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {String(result.positioning)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-2 font-bold">{tr("personaDesign")}</h3>
              <p className="text-sm leading-7 text-slate-600">{String(result.persona)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-3 font-bold">{tr("nameSuggestions")}</h3>
              <div className="flex flex-wrap gap-2">
                {(result.names as string[])?.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <h3 className="mb-3 font-bold">{tr("week7Preview")}</h3>
              <div className="space-y-2">
                {(result.week7 as { day: string; theme: string; title: string }[])?.map(
                  (d) => (
                    <div
                      key={d.day}
                      className="rounded-2xl bg-orange-50 p-3 text-xs leading-6 text-orange-900"
                    >
                      <b>
                        {d.day} · {d.theme}
                      </b>
                      <br />
                      {d.title}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
          <AiDisclaimer />
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" onClick={copyAll}>
              <Copy size={16} /> {tr("copy")}
            </Button>
            <Button variant="secondary" onClick={() => showToast(tr("savedToHistory"))}>
              <Save size={16} /> {tr("save")}
            </Button>
            <Button variant="secondary" onClick={() => showToast(tr("shareV11"))}>
              <Share2 size={16} /> {tr("share")}
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default function AccountPackagePage() {
  const { tr } = useApp();
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-orange-600">{tr("loading")}</div>
      }
    >
      <AccountPackageContent />
    </Suspense>
  );
}
