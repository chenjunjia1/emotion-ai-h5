"use client";

import { AppShell } from "@/components/layout/app-shell";
import { HomeBanner } from "@/components/home/home-banner";
import { HomeBetaBanner } from "@/components/home/home-beta-banner";
import { HomeInvitePromo } from "@/components/home/home-invite-promo";
import { HomePlayEntries } from "@/components/home/home-play-entries";

export default function HomePage() {
  return (
    <AppShell>
      <div className="space-y-5">
        <HomeBetaBanner />
        <HomeBanner />
        <HomePlayEntries />
        <HomeInvitePromo />
      </div>
    </AppShell>
  );
}
