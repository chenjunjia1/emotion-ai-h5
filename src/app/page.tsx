"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { HomeBanner } from "@/components/home/home-banner";
import { HomePlayEntries } from "@/components/home/home-play-entries";
import { HomeHotTopicsTop3 } from "@/components/home/home-hot-topics-top3";
import { HomeAiSuggest } from "@/components/home/home-ai-suggest";
import { cn } from "@/lib/utils";

const HOME_SEEN_KEY = "home_flow_seen";

export default function HomePage() {
  const [skipEnterAnim] = useState(
    () => typeof window !== "undefined" && !!sessionStorage.getItem(HOME_SEEN_KEY)
  );

  useEffect(() => {
    try {
      sessionStorage.setItem(HOME_SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <AppShell homePage>
      <div
        className={cn(
          "home-flow flex flex-col gap-4 pb-1",
          skipEnterAnim && "home-flow-stable"
        )}
      >
        <HomeBanner />
        <HomePlayEntries />
        <HomeHotTopicsTop3 />
        <HomeAiSuggest />
      </div>
    </AppShell>
  );
}
