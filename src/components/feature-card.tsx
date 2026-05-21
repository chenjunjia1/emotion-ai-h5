"use client";

import { ChevronRight, MessageCircle, Video, Heart } from "lucide-react";
import Link from "next/link";
import type { FeatureType } from "@/lib/types";
import { FEATURE_LIST } from "@/lib/constants";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const iconMap = {
  video: Video,
  comment: MessageCircle,
  private: Heart,
};

interface FeatureCardProps {
  featureId: FeatureType;
  highlighted?: boolean;
}

export function FeatureCard({ featureId, highlighted }: FeatureCardProps) {
  const item = FEATURE_LIST.find((f) => f.id === featureId)!;
  const Icon = iconMap[item.id];

  return (
    <Link
      href={`/generate?feature=${item.id}`}
      onClick={() =>
        trackEvent("click_feature", { feature: item.id })
      }
      className={cn(
        "flex items-center justify-between rounded-3xl border p-4 text-left transition",
        highlighted
          ? "border-rose-200 bg-white shadow-md shadow-rose-100"
          : "border-white bg-white/70 hover:border-rose-100 hover:bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-2xl",
            highlighted ? "bg-rose-100" : "bg-stone-100"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              highlighted ? "text-rose-500" : "text-stone-500"
            )}
          />
        </div>
        <div>
          <div className="font-semibold">{item.title}</div>
          <div className="mt-1 text-sm text-stone-500">{item.desc}</div>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-stone-300" />
    </Link>
  );
}
