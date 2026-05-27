"use client";

import { cn } from "@/lib/utils";

export type TreeholeChatMsg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sticker?: string;
  statusTags?: string[];
};

export function TreeholeChatBubbles({
  messages,
  loading,
  night,
}: {
  messages: TreeholeChatMsg[];
  loading?: boolean;
  night?: boolean;
}) {
  if (messages.length === 0 && !loading) return null;

  return (
    <div className="treehole-chat-thread mb-3 space-y-2.5">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={cn(
            "flex",
            msg.role === "user" ? "justify-end treehole-msg-user-enter" : "justify-start treehole-msg-ai-enter"
          )}
        >
          {msg.role === "assistant" ? (
            <span className="mr-1.5 mt-1 shrink-0 text-base leading-none" aria-hidden>
              {msg.sticker ?? "🐱"}
            </span>
          ) : null}
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-3 py-2.5 text-[13px] leading-relaxed shadow-sm",
              msg.role === "user"
                ? night
                  ? "rounded-br-md bg-gradient-to-br from-[#FF4F8B] to-[#FF7AAE] text-white"
                  : "rounded-br-md bg-gradient-to-br from-[#FF6B9D] to-[#FF9A4D] text-white treehole-user-bubble"
                : night
                  ? "rounded-bl-md bg-white/12 text-white/95 ring-1 ring-white/15 backdrop-blur-sm"
                  : "rounded-bl-md bg-white text-[#374151] ring-1 ring-[#FFE8F0]"
            )}
          >
            <p className="whitespace-pre-wrap">{msg.text}</p>
            {msg.statusTags && msg.statusTags.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1">
                {msg.statusTags.map((tag) => (
                  <span
                    key={tag}
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold",
                      night
                        ? "bg-white/15 text-white/85"
                        : "bg-[#FFF0F5] text-[#FF4F8B]"
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ))}
      {loading ? (
        <div className="flex justify-start treehole-msg-ai-enter">
          <span className="mr-1.5 mt-1 text-base">🌙</span>
          <div
            className={cn(
              "rounded-2xl rounded-bl-md px-3 py-2 text-[12px] font-medium",
              night ? "bg-white/10 text-white/80" : "bg-white text-[#9CA3AF] ring-1 ring-[#FFE8F0]"
            )}
          >
            <span className="treehole-typing-dots">正在认真听你说…</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
