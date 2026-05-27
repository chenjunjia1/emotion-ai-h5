"use client";

import Link from "next/link";
import { ChevronRight, Handshake, Mail, MessageCircle } from "lucide-react";
import { LegalShell } from "@/components/layout/legal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import {
  PARTNER_CONTACT,
  PARTNER_RECRUITMENT,
} from "@/lib/content/partner-recruitment";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export default function PartnerPage() {
  const { showToast } = useApp();
  const r = PARTNER_RECRUITMENT;

  const copyWechat = () => {
    void copyToClipboard(PARTNER_CONTACT.wechat);
    showToast("微信号已复制");
  };

  return (
    <LegalShell title={r.title}>
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-[#FFA040] via-[#FF7AAE] to-[#FF4E93] shadow-lg">
        <CardContent className="relative p-4 text-white">
          <span
            className="pointer-events-none absolute -right-4 -top-6 h-24 w-24 rounded-full bg-white/20 blur-2xl"
            aria-hidden
          />
          <div className="relative flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/25 ring-2 ring-white/35 backdrop-blur-sm">
              <Handshake size={26} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-black">{r.title}</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-white/92">{r.subtitle}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {r.heroTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold ring-1 ring-white/30"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {r.highlights.map((item) => (
          <Card key={item.title} className="border-orange-100/80">
            <CardContent className="p-3">
              <span className="text-xl" aria-hidden>
                {item.emoji}
              </span>
              <p className="mt-1 text-[13px] font-black text-slate-800">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-3">
        <CardContent className="space-y-3">
          <h3 className="text-sm font-black text-slate-800">合作方式</h3>
          {r.partnerTypes.map((item) => (
            <div
              key={item.title}
              className={cn(
                "rounded-2xl border px-3 py-2.5",
                theme.border,
                theme.softOrange
              )}
            >
              <p className="text-[13px] font-bold text-orange-700">{item.title}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardContent className="space-y-2 text-sm text-slate-600">
          <h3 className="font-black text-slate-800">我们希望您</h3>
          <ul className="list-disc space-y-1.5 pl-4 text-[12px] leading-relaxed">
            {r.requirements.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <h3 className="pt-2 font-black text-slate-800">合作流程</h3>
          <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed">
            {r.process.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      <Card className="mt-3">
        <CardContent className="space-y-2">
          <h3 className="text-sm font-black text-slate-800">常见问题</h3>
          {r.faq.map((item) => (
            <div key={item.q} className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-[12px] font-bold text-slate-800">{item.q}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{item.a}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="mt-3 border-orange-200 bg-gradient-to-br from-orange-50 to-rose-50">
        <CardContent className="space-y-3">
          <h3 className="text-sm font-black text-slate-800">立即咨询 · 商务对接</h3>
          <p className="text-[11px] leading-relaxed text-slate-500">{r.contactNote}</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={copyWechat}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-left active:scale-[0.99]",
                theme.border
              )}
            >
              <span className="flex items-center gap-2">
                <MessageCircle size={18} className="text-orange-500" />
                <span>
                  <span className="block text-[10px] text-slate-400">商务微信</span>
                  <span className="text-sm font-bold text-slate-800">{PARTNER_CONTACT.wechat}</span>
                </span>
              </span>
              <span className="text-[11px] font-bold text-orange-600">复制</span>
            </button>
            <a
              href={`mailto:${PARTNER_CONTACT.email}?subject=${encodeURIComponent("AI灵感创作-加盟合伙人咨询")}`}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 active:scale-[0.99]",
                theme.border
              )}
            >
              <span className="flex items-center gap-2">
                <Mail size={18} className="text-orange-500" />
                <span>
                  <span className="block text-[10px] text-slate-400">商务邮箱</span>
                  <span className="text-sm font-bold text-slate-800">{PARTNER_CONTACT.email}</span>
                </span>
              </span>
              <ChevronRight size={16} className="text-slate-300" />
            </a>
          </div>
          <Button className="w-full" onClick={copyWechat}>
            复制微信，马上咨询
          </Button>
          <Link
            href="/support?tab=feedback"
            className="flex items-center justify-center gap-1 text-[12px] font-bold text-orange-600 active:opacity-70"
          >
            或去意见反馈留言「加盟咨询」
            <ChevronRight size={14} />
          </Link>
        </CardContent>
      </Card>
    </LegalShell>
  );
}
