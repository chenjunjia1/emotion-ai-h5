import { NextResponse } from "next/server";

/** POST /api/v2/expression/chat-ocr — 聊天截图 OCR（预留） */
export async function POST() {
  return NextResponse.json({
    ok: true,
    messages: [
      { role: "other", text: "在吗？" },
      { role: "me", text: "在的～刚看到消息" },
    ],
  });
}
