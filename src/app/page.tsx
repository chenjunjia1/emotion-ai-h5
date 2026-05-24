"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HomeBanner } from "@/components/home/home-banner";
import { HomePlayEntries } from "@/components/home/home-play-entries";
import { HomeHotTopicsTop3 } from "@/components/home/home-hot-topics-top3";
import { HomeTrendingScroll } from "@/components/home/home-trending-scroll";
import { HomeAiSuggest } from "@/components/home/home-ai-suggest";
import { HomeSuccessCases } from "@/components/home/home-success-cases";
import { HomeInvitePromo } from "@/components/home/home-invite-promo";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <HomeBanner />
        <HomeHotTopicsTop3 />
        <HomePlayEntries />
        <HomeTrendingScroll />
        <HomeAiSuggest />
        <HomeSuccessCases />
        <HomeInvitePromo />
      </div>
    </AppShell>
  );
}
