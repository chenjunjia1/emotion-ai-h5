"use client";

import {
  CreamPlatformIcon,
  type CreamIconSize,
  resolveCreamPlatform,
} from "@/components/v1/platform-cream-icon";

/** @deprecated 请直接用 CreamPlatformIcon；保留别名兼容旧引用 */
export function PlatformBrandIcon({
  platform,
  size = 48,
  active = false,
}: {
  platform: string;
  size?: number;
  active?: boolean;
}) {
  const creamSize: CreamIconSize =
    size <= 32 ? "banner" : size <= 36 ? "sm" : size <= 40 ? "md" : size <= 48 ? "lg" : "xl";

  return (
    <CreamPlatformIcon
      platform={platform}
      pixelSize={size}
      size={creamSize}
      active={active}
    />
  );
}

export function getPlatformBrand(platform: string) {
  return { label: platform, key: resolveCreamPlatform(platform) };
}
