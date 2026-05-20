"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { PhoneShell } from "@/components/layout/phone-shell";
import { TopTitle } from "@/components/layout/top-title";
import { FeatureCard } from "@/components/feature-card";
import { FEATURE_LIST } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";

export default function HomePage() {
  useEffect(() => {
    trackEvent("view_home");
  }, []);

  return (
    <PhoneShell>
      <TopTitle
        title="情绪价值助手"
        subtitle="AI帮你生成高情商情感内容与聊天回复"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5 rounded-[28px] bg-gradient-to-r from-rose-400 to-pink-400 p-5 text-white shadow-lg shadow-rose-100"
      >
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Sparkles className="h-4 w-4" />
          今日可免费生成 3 次
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-snug">
          不会回消息？
          <br />
          让 AI 帮你高情商表达
        </h2>
        <p className="mt-2 text-sm leading-6 opacity-90">
          适合红娘、情感博主、新媒体运营、私域客服快速生成内容。
        </p>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {FEATURE_LIST.map((item) => (
          <FeatureCard key={item.id} featureId={item.id} />
        ))}
      </div>
    </PhoneShell>
  );
}
