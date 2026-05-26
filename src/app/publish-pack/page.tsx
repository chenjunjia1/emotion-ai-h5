"use client";

/** 默认 V2；`?studio=1` 工作室；`?legacy=1` 旧版。路线见 docs/PUBLISH_PACK_ROADMAP.md */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PublishPackV2Page } from "@/components/publish-pack/v2/publish-pack-v2-page";
import { PublishPackStudioPage } from "@/components/publish-pack/studio/publish-pack-studio-page";
import { PublishPackLegacyPage } from "@/app/publish-pack/publish-pack-legacy-page";

function PublishPackRouter() {
  const params = useSearchParams();
  const legacy = params.get("legacy") === "1";
  const studio = params.get("studio") === "1";
  if (legacy) return <PublishPackLegacyPage />;
  if (studio) return <PublishPackStudioPage />;
  return <PublishPackV2Page />;
}

export default function PublishPackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
          加载中…
        </div>
      }
    >
      <PublishPackRouter />
    </Suspense>
  );
}
