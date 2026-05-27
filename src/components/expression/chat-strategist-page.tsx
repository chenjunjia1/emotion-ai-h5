"use client";

import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AiAssistantView } from "@/components/ai-assistant/ai-assistant-view";
import { ChatStrategistContent } from "@/components/expression/chat-strategist-content";
import { EmotionTreeholePage } from "@/components/expression/emotion-treehole-page";

export function ChatStrategistPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  if (mode === "assistant") {
    return (
      <AppShell>
        <AiAssistantView />
      </AppShell>
    );
  }

  if (mode === "strategist") {
    return (
      <AppShell homePage showHeader>
        <ChatStrategistContent />
      </AppShell>
    );
  }

  /** 底部「聊天」Tab 默认：情绪树洞深夜陪伴 */
  return <EmotionTreeholePage />;
}
