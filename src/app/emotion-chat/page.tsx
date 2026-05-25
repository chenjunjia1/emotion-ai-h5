"use client";

import { AppShell } from "@/components/layout/app-shell";
import { AiAssistantView } from "@/components/ai-assistant/ai-assistant-view";

export default function BuddyChatPage() {
  return (
    <AppShell>
      <AiAssistantView />
    </AppShell>
  );
}
