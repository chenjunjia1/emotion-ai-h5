"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { GradientButton } from "@/components/expression/ui";

/** 聊天截图 OCR 入口（Mock + 接口预留） */
export default function ChatScreenshotPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <Link href="/emotion-chat?mode=strategist" className="text-[12px] font-bold text-[#FF4F8B]">
          ← 返回聊天军师
        </Link>
        <h1 className="text-[18px] font-black">上传聊天截图</h1>
        <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-[#FFE8F0] bg-white py-16">
          <span className="text-5xl">💬</span>
          <p className="mt-3 text-[13px] font-bold text-[#374151]">选择截图上传</p>
          <p className="mt-1 text-[11px] text-[#9CA3AF]">OCR 接口已预留 · 当前为 Mock 演示</p>
        </div>
        <GradientButton href="/emotion-chat?mode=strategist" className="w-full">
          使用 Mock 结果继续分析
        </GradientButton>
      </div>
    </AppShell>
  );
}
