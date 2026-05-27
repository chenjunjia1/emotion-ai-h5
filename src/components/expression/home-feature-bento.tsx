"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CreateFeaturedCard,
  CreateToolTile,
  CreateTreeholeLink,
} from "@/components/expression/create-hub-cards";
import { SectionHeader } from "@/components/expression/ui";
import {
  CREATE_HUB_ENTRIES,
  CREATE_HUB_FEATURED_ID,
} from "@/lib/mock/expression-assistant";
import { runWhenIdle } from "@/lib/client/defer-idle";

/** 首页 · 常用能力（与创作页「常用工具」同款 UI） */
export function HomeFeatureBento() {
  const router = useRouter();

  const featuredEntry = useMemo(
    () => CREATE_HUB_ENTRIES.find((e) => e.id === CREATE_HUB_FEATURED_ID),
    []
  );

  const { gridTools, treeholeEntry } = useMemo(() => {
    const tools = CREATE_HUB_ENTRIES.filter((e) => !e.featured);
    return {
      gridTools: tools.filter((e) => e.id !== "treehole"),
      treeholeEntry: tools.find((e) => e.id === "treehole"),
    };
  }, []);

  useEffect(() => {
    runWhenIdle(() => {
      for (const entry of CREATE_HUB_ENTRIES) {
        router.prefetch(entry.href);
      }
      router.prefetch("/create");
    });
  }, [router]);

  return (
    <section className="home-tools-panel home-tools-bento relative z-20 space-y-2.5 rounded-[22px] p-3 ring-1 ring-[#FFE4EC]/90">
      <SectionHeader
        title="常用能力"
        sub="AI 生活感配图 · 与创作页同款"
        action={
          <Link
            href="/create"
            className="mb-0.5 shrink-0 text-[11px] font-bold text-[#FF4F8B] active:opacity-70"
          >
            创作中心
          </Link>
        }
      />

      {featuredEntry ? <CreateFeaturedCard entry={featuredEntry} /> : null}

      <div className="grid grid-cols-2 gap-2">
        {gridTools.map((entry, i) => (
          <CreateToolTile key={entry.id} entry={entry} tintIndex={i} />
        ))}
      </div>

      {treeholeEntry ? <CreateTreeholeLink entry={treeholeEntry} /> : null}
    </section>
  );
}
