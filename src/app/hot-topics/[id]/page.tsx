"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, Flame, Star } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/app-context";
import { apiGetHotTopicDetail } from "@/lib/client/server-api";
import { HotTopicCover } from "@/components/hot-topics/hot-topic-cover";
import { enrichHotTopic, type HotTopicDisplay } from "@/lib/content/hot-topic-enrichment";
import { cn } from "@/lib/utils";

export default function HotTopicDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { tr } = useApp();
  const id = decodeURIComponent(params.id ?? "");
  const [topic, setTopic] = useState<HotTopicDisplay | null>(null);
  const [related, setRelated] = useState<HotTopicDisplay[]>([]);

  useEffect(() => {
    void apiGetHotTopicDetail(id).then((r) => {
      if (r.item) setTopic(enrichHotTopic(r.item));
      if (r.related?.length) setRelated(r.related.map((item) => enrichHotTopic(item)));
    });
  }, [id]);

  const filmTips = useMemo(
    () =>
      topic?.recommendAngles?.length
        ? [...topic.recommendAngles, "日常vlog跟拍", "一人食晚餐特写"].slice(0, 4)
        : ["日常vlog跟拍下班路", "一人食晚餐特写", "房间灯光氛围感", "周末放松小确幸"],
    [topic]
  );

  if (!topic) {
    return (
      <AppShell>
        <p className="p-6 text-center text-sm text-[#8A94A6]">今日热点正在更新中，请稍后再来看看。</p>
      </AppShell>
    );
  }

  const stars = Math.min(5, Math.round(topic.viralScore / 20));

  return (
    <AppShell showHeader={false}>
      <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-orange-100/70 bg-[#FFF4F7]/95 px-4 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#FF4F8B] shadow-sm active:scale-95"
          aria-label="返回"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-base font-black text-[#1F2937]">{tr("hotTopicDetailTitle")}</h1>
      </div>

      <div className="space-y-4 px-4 pb-32 pt-4">
        <div className="relative h-44 overflow-hidden rounded-[24px] shadow-lg">
          <HotTopicCover item={topic} className="h-full w-full rounded-[24px]" iconSize={32} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
          <Flame className="absolute -right-4 -top-4 h-32 w-32 text-white/15" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h2 className="text-lg font-black text-white">{topic.title}</h2>
            <p className="mt-1 text-[11px] text-white/85">
              {tr("homeHotHeat")} {topic.heatValue} · {topic.platform} · {tr("hotTopicDetailUpdated")}{" "}
              08:00
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <StatCard label={tr("hotTopicDetailViral")} value={`${topic.viralScore}%`} accent />
          <StatCard
            label={tr("hotTopicDetailRecommend")}
            value={`${"★".repeat(stars)}${"☆".repeat(5 - stars)}`}
          />
        </div>

        <Section title={tr("hotTopicDetailInterpret")}>
          <p className="text-sm leading-7 text-[#1F2937]/80">{topic.desc}</p>
        </Section>

        <Section title={tr("hotTopicDetailTarget")}>
          <div className="flex flex-wrap gap-2">
            {topic.targetUsers.map((u) => (
              <Tag key={u} label={u} />
            ))}
          </div>
        </Section>

        <Section title={tr("hotTopicDetailAngles")}>
          <div className="flex flex-wrap gap-2">
            {topic.recommendAngles.map((a) => (
              <Tag key={a} label={a} pink />
            ))}
          </div>
        </Section>

        <Section title={tr("hotTopicDetailHowFilm")}>
          <div className="grid grid-cols-2 gap-2">
            {filmTips.map((tip) => (
              <div
                key={tip}
                className="rounded-2xl bg-gradient-to-br from-[#FFF4F7] to-[#FFF3E8] p-3 text-[11px] font-bold text-[#1F2937]"
              >
                📷 {tip}
              </div>
            ))}
          </div>
        </Section>

        {related.length > 0 && (
          <Section title={tr("hotTopicDetailRelated")}>
            <div className="space-y-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/hot-topics/${encodeURIComponent(r.id)}`}
                  className="flex items-center justify-between rounded-2xl border border-orange-100/60 bg-white px-3 py-2.5 text-sm font-bold text-[#1F2937] active:scale-[0.99]"
                >
                  <span className="line-clamp-1">{r.title}</span>
                  <span className="shrink-0 text-[10px] text-[#FF4F8B]">{r.heatValue}</span>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>

      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 px-4">
        <Button
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#FF4F8B] to-[#FF9A4D] text-base font-black shadow-lg"
          onClick={() =>
            router.push(
              `/publish-pack?topic_id=${encodeURIComponent(topic.id)}&topic=${encodeURIComponent(topic.title)}`
            )
          }
        >
          <Star size={18} className="mr-2" />
          {tr("hotTopicDetailGenCta")}
        </Button>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cream-card rounded-[22px] p-4">
      <h3 className="mb-2 text-sm font-black text-[#1F2937]">{title}</h3>
      {children}
    </section>
  );
}

function Tag({ label, pink }: { label: string; pink?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[11px] font-bold",
        pink ? "bg-[#FFF0F5] text-[#FF4F8B]" : "bg-[#FFF3E8] text-[#FF9A4D]"
      )}
    >
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="cream-card rounded-2xl p-3 text-center">
      <p className="text-[10px] font-bold text-[#8A94A6]">{label}</p>
      <p className={cn("mt-1 text-xl font-black", accent ? "text-[#FF4F8B]" : "text-[#FF9A4D]")}>
        {value}
      </p>
    </div>
  );
}
