"use client";

import type { AiAvatarId } from "@/lib/onboarding/options";
import { PartnerAvatarImage } from "@/components/onboarding/partner-avatar-image";
import { cn } from "@/lib/utils";

export function PartnerAvatarArt({
  id,
  className,
  size = "md",
}: {
  id: AiAvatarId;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "h-16 w-16" : size === "sm" ? "h-10 w-10" : "h-12 w-12";

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-pink-50 to-purple-50",
        dim,
        className
      )}
    >
      <PartnerAvatarImage id={id} />
    </div>
  );
}
