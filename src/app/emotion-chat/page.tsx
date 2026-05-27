"use client";

import { Suspense } from "react";
import { ChatStrategistPage } from "@/components/expression/chat-strategist-page";
import { useApp } from "@/contexts/app-context";

function ChatPageInner() {
  return <ChatStrategistPage />;
}

export default function EmotionChatPage() {
  const { tr } = useApp();
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#FF4F8B]">{tr("loading")}</div>}>
      <ChatPageInner />
    </Suspense>
  );
}
