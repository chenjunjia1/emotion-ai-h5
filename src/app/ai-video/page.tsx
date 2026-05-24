"use client";

import Link from "next/link";
import { Clapperboard, Sparkles } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { SectionTitle } from "@/components/section-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";

export default function AiVideoPage() {
  const { tr } = useApp();

  return (
    <AppShell>
      <SectionTitle
        eyebrow="🎬"
        title="AI 成片"
        desc="V1 专注能直接发的文本内容与运营陪跑"
      />

      <Card className="mb-4 border-orange-100/80 bg-gradient-to-br from-[#FFF8EE] to-[#FFF0F5]">
        <CardContent className="flex flex-col items-center py-8 text-center">
          <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-md ring-1 ring-orange-100">
            <Clapperboard className="text-[#FF7AAE]" size={28} />
          </span>
          <p className="text-sm font-black text-slate-800">{tr("noVideoV1")}</p>
          <p className="mt-2 max-w-[18rem] text-[11px] leading-relaxed text-slate-500">
            当前版本已开通：选题盲盒、发布包、情绪聊天、内容复盘、每日热点等文本创作全流程。
            AI 成片 / 数字人口播将在后续版本接入（需配置 VIDEO_PROVIDER）。
          </p>
          <Link href="/create" className="mt-5 w-full max-w-[240px]">
            <Button className="w-full gap-1.5">
              <Sparkles size={16} />
              去创作工坊
            </Button>
          </Link>
          <Link
            href="/publish-pack"
            className="mt-2 text-[11px] font-bold text-[#FF7AAE] underline-offset-2 hover:underline"
          >
            或先生成今日发布包 →
          </Link>
        </CardContent>
      </Card>
    </AppShell>
  );
}
