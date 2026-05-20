"use client";

import {
  ChevronRight,
  Crown,
  Headphones,
  HelpCircle,
  Settings,
  UserRound,
} from "lucide-react";
import { PhoneShell } from "@/components/layout/phone-shell";
import { TopTitle } from "@/components/layout/top-title";
import { Card, CardContent } from "@/components/ui/card";

const menuItems = [
  {
    icon: Headphones,
    title: "联系客服",
    desc: "反馈问题或合作咨询",
  },
  {
    icon: HelpCircle,
    title: "使用说明",
    desc: "如何生成更自然的话术",
  },
  {
    icon: Settings,
    title: "关于我们",
    desc: "AI 情感运营助手",
  },
];

export default function MinePage() {
  return (
    <PhoneShell>
      <TopTitle title="我的" subtitle="个人中心" />

      <Card className="mt-5">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <UserRound className="h-8 w-8 text-rose-500" />
            </div>
            <div>
              <div className="text-lg font-bold">体验用户</div>
              <div className="mt-1 text-sm text-stone-500">
                今日剩余生成 3 次
              </div>
            </div>
          </div>
          <div className="mt-5 rounded-3xl bg-gradient-to-r from-rose-400 to-pink-400 p-4 text-white">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4" />
              会员功能预留
            </div>
            <p className="mt-2 text-sm opacity-90">
              后续可解锁更多场景、长期历史记录和企业话术库。
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 space-y-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              className="flex w-full items-center justify-between rounded-3xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50">
                  <Icon className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <div className="font-semibold">{item.title}</div>
                  <div className="mt-1 text-sm text-stone-500">{item.desc}</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-stone-300" />
            </button>
          );
        })}
      </div>
    </PhoneShell>
  );
}
