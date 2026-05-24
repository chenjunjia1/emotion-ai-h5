"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HomeBanner } from "@/components/home/home-banner";
import { HomePlayEntries } from "@/components/home/home-play-entries";
import { HomeHotTopicsTop3 } from "@/components/home/home-hot-topics-top3";
import { HomeInspirationRail } from "@/components/home/home-inspiration-rail";
import { HomeAiSuggest } from "@/components/home/home-ai-suggest";
import { HomeInvitePromo } from "@/components/home/home-invite-promo";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-3">
        <HomeBanner />
        <HomeHotTopicsTop3 />
        <HomePlayEntries />
        <HomeInspirationRail />
        <HomeAiSuggest />
        <HomeInvitePromo />
      </div>
    </AppShell>
  );
}
