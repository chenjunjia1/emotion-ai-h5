"use client";

import { useState } from "react";
import Image from "next/image";
import { getPartnerAvatar, type AiAvatarId } from "@/lib/onboarding/options";
import { cn } from "@/lib/utils";

const SVG_FALLBACK: Record<AiAvatarId, string> = {
  "pink-girl": "/avatars/pink-girl.svg",
  "black-hair-boy": "/avatars/black-hair-boy.svg",
  "hat-girl": "/avatars/hat-girl.svg",
  "cap-boy": "/avatars/cap-boy.svg",
};

/** 搭子头像：高清 PNG（3D 盲盒风），失败回退 SVG */
export function PartnerAvatarImage({
  id,
  className,
  sizes = "80px",
  priority,
}: {
  id: AiAvatarId;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const item = getPartnerAvatar(id);
  const [useFallback, setUseFallback] = useState(false);
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-pink-100 to-rose-50 text-3xl",
          className
        )}
        aria-hidden
      >
        {item.previewEmoji}
      </span>
    );
  }

  const src = useFallback ? SVG_FALLBACK[id] : item.image;

  return (
    <Image
      src={src}
      alt=""
      aria-hidden
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.endsWith(".png")}
      className={cn("object-cover object-center", className)}
      onError={() => {
        if (!useFallback) {
          setUseFallback(true);
          return;
        }
        setFailed(true);
      }}
    />
  );
}
