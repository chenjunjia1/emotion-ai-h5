"use client";

import { useState } from "react";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { useProduct } from "@/hooks/use-product";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const QUESTIONS = [
  { id: "q1", label: "你愿意露脸吗？", options: ["愿意", "不愿意", "看情况"] },
  { id: "q2", label: "你每天能投入多久？", options: ["30分钟", "1小时", "2小时以上"] },
  { id: "q3", label: "你更擅长？", options: ["口头表达", "整理资料", "都差不多"] },
  { id: "q4", label: "你的目标？", options: ["涨粉", "引流", "带货", "打造IP"] },
  { id: "q5", label: "感兴趣的赛道？", options: ["婚恋情感", "宠物", "电商", "职场", "本地生活", "小红书"] },
  { id: "q6", label: "有产品或服务可卖吗？", options: ["有", "没有", "正在准备"] },
  { id: "q7", label: "更喜欢？", options: ["短视频", "图文", "都可以"] },
  { id: "q8", label: "希望风格？", options: ["温柔", "干货", "真实", "搞笑", "种草"] },
];

export default function AccountTestPage() {
  const { tr } = useApp();
  const { runAccountTest } = useProduct();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Record<string, unknown> | null>(null);

  const onSubmit = async () => {
    const r = await runAccountTest(answers);
    if (r) setResult(r as Record<string, unknown>);
  };

  const dirs = (result?.directions as { name: string; platform: string; format: string }[]) ?? [];

  return (
    <AppShell>
      <SectionTitle
        eyebrow="✨"
        title={tr("accountTestTitle")}
        desc={tr("featAccountTestDesc")}
      />
      <Card className="mb-4">
        <CardContent className="space-y-4">
          {QUESTIONS.map((q) => (
            <div key={q.id}>
              <div className="mb-2 text-sm font-bold">{q.label}</div>
              <div className="flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: o }))}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-bold",
                      answers[q.id] === o
                        ? "bg-orange-500 text-white"
                        : "bg-orange-50 text-slate-600"
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={() => void onSubmit()}>
            <UserRound size={18} /> {tr("accountTestBtn")}
          </Button>
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardContent className="space-y-3 text-sm">
            <div className="font-bold text-rose-600">最适合你的3个方向</div>
            {dirs.map((d, i) => (
              <div key={i} className="rounded-2xl bg-rose-50 p-3">
                <b>{d.name}</b>
                <br />
                {d.platform} · {d.format}
              </div>
            ))}
            <Link
              href="/account-package"
              className={cn(
                "flex justify-center rounded-2xl py-3 font-bold text-white",
                `bg-gradient-to-r ${theme.primary}`
              )}
            >
              {tr("accountTestToPlan")}
            </Link>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}
