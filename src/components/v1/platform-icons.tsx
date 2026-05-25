"use client";

import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { SiBilibili, SiKuaishou, SiTiktok, SiWechat } from "react-icons/si";
import { cn } from "@/lib/utils";

/** 统一规格：64×64，圆角 20px，轻阴影（图标本身不加描边） */
export const PLATFORM_ICON_BASE = 64;
const RADIUS_PX = 20;
const SHELL_SHADOW = "shadow-[0_4px_14px_rgba(0,0,0,0.08)]";

const VIDEO_CHANNEL_ICON = "/icons/video-channel.svg";

export type PlatformIconKey =
  | "douyin"
  | "xiaohongshu"
  | "video_channel"
  | "moments"
  | "kuaishou"
  | "bilibili";

type PlatformVisual = {
  shellClass: string;
  renderGlyph: (size: number) => ReactNode;
};

function shellStyle(size: number): CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: (size / PLATFORM_ICON_BASE) * RADIUS_PX,
  };
}

function glyphPx(size: number) {
  return Math.round(size * 0.56);
}

function IconShell({
  size,
  shellClass,
  children,
  className,
}: {
  size: number;
  shellClass: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        !shellClass.includes("shadow-") && SHELL_SHADOW,
        shellClass,
        className
      )}
      style={shellStyle(size)}
    >
      {children}
    </div>
  );
}

/** 抖音：SiTiktok + 青/红/白三层错位 */
function DouyinGlyph({ size }: { size: number }) {
  const icon = Math.round(size * 0.625);
  const off = Math.max(2, Math.round(size * 0.047));
  const offY = Math.max(2, Math.round(size * 0.031));
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: icon, height: icon }}
      aria-hidden
    >
      <SiTiktok
        size={icon}
        className="absolute text-[#25F4EE]"
        style={{ transform: `translate(${-off}px, ${offY}px)` }}
      />
      <SiTiktok
        size={icon}
        className="absolute text-[#FE2C55]"
        style={{ transform: `translate(${off}px, ${-offY}px)` }}
      />
      <SiTiktok size={icon} className="relative text-white" />
    </div>
  );
}

/** 视频号：本地静态双环 SVG（/public/icons/video-channel.svg），非 TSX 手绘 */
function VideoChannelGlyph({ size }: { size: number }) {
  const px = Math.round(size * 0.58);
  return (
    <Image
      src={VIDEO_CHANNEL_ICON}
      alt=""
      width={px}
      height={px}
      className="object-contain"
      draggable={false}
      unoptimized
    />
  );
}

const PLATFORM_VISUAL: Record<PlatformIconKey, PlatformVisual> = {
  douyin: {
    shellClass: "bg-black shadow-[0_10px_25px_rgba(0,0,0,0.18)]",
    renderGlyph: (size) => <DouyinGlyph size={size} />,
  },
  xiaohongshu: {
    shellClass: "bg-[#FF2442]",
    renderGlyph: (size) => (
      <span
        className="font-black leading-none text-white"
        style={{ fontSize: Math.round(glyphPx(size) * 0.48) }}
        aria-hidden
      >
        小红书
      </span>
    ),
  },
  video_channel: {
    shellClass:
      "border border-orange-100 bg-white shadow-[0_10px_25px_rgba(255,138,0,0.18)]",
    renderGlyph: (size) => <VideoChannelGlyph size={size} />,
  },
  kuaishou: {
    shellClass: "bg-[#FF6600]",
    renderGlyph: (size) => (
      <SiKuaishou size={glyphPx(size)} className="text-white" aria-hidden />
    ),
  },
  bilibili: {
    shellClass: "bg-[#FB7299]",
    renderGlyph: (size) => (
      <SiBilibili size={glyphPx(size)} className="text-white" aria-hidden />
    ),
  },
  moments: {
    shellClass: "bg-[#07C160]",
    renderGlyph: (size) => (
      <SiWechat size={glyphPx(size)} className="text-white" aria-hidden />
    ),
  },
};

function PlatformIconTile({
  platformKey,
  size = PLATFORM_ICON_BASE,
  className,
}: {
  platformKey: PlatformIconKey;
  size?: number;
  className?: string;
}) {
  const visual = PLATFORM_VISUAL[platformKey];
  return (
    <IconShell size={size} shellClass={visual.shellClass} className={className}>
      {visual.renderGlyph(size)}
    </IconShell>
  );
}

export function DouyinIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="douyin" {...props} />;
}
export function XiaohongshuIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="xiaohongshu" {...props} />;
}
export function VideoChannelIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="video_channel" {...props} />;
}
export function KuaishouIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="kuaishou" {...props} />;
}
export function BilibiliIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="bilibili" {...props} />;
}
export function MomentsIcon(props: { size?: number; className?: string }) {
  return <PlatformIconTile platformKey="moments" {...props} />;
}

const ICON_BY_KEY = {
  douyin: DouyinIcon,
  xiaohongshu: XiaohongshuIcon,
  video_channel: VideoChannelIcon,
  moments: MomentsIcon,
  kuaishou: KuaishouIcon,
  bilibili: BilibiliIcon,
} as const;

export const platformList = [
  { key: "douyin" as const, name: "抖音", desc: "短视频脚本", Icon: DouyinIcon },
  { key: "xiaohongshu" as const, name: "小红书", desc: "种草笔记", Icon: XiaohongshuIcon },
  { key: "video_channel" as const, name: "视频号", desc: "短视频脚本", Icon: VideoChannelIcon },
  { key: "kuaishou" as const, name: "快手", desc: "短视频脚本", Icon: KuaishouIcon },
  { key: "bilibili" as const, name: "B站", desc: "中长视频脚本", Icon: BilibiliIcon },
  { key: "moments" as const, name: "朋友圈", desc: "朋友圈文案", Icon: MomentsIcon },
];

export function PlatformIconByKey({
  platformKey,
  size = PLATFORM_ICON_BASE,
  className,
}: {
  platformKey: PlatformIconKey;
  size?: number;
  className?: string;
}) {
  return <PlatformIconTile platformKey={platformKey} size={size} className={className} />;
}

const NAME_TO_KEY: Record<string, PlatformIconKey> = {
  抖音: "douyin",
  douyin: "douyin",
  小红书: "xiaohongshu",
  xiaohongshu: "xiaohongshu",
  视频号: "video_channel",
  video_channel: "video_channel",
  shipinhao: "video_channel",
  朋友圈: "moments",
  moments: "moments",
  快手: "kuaishou",
  kuaishou: "kuaishou",
  B站: "bilibili",
  bilibili: "bilibili",
};

export function resolvePlatformIconKey(platform: string): PlatformIconKey {
  return NAME_TO_KEY[platform] ?? NAME_TO_KEY[platform.trim()] ?? "xiaohongshu";
}

export function PlatformIconByName({
  platform,
  size = PLATFORM_ICON_BASE,
  className,
}: {
  platform: string;
  size?: number;
  className?: string;
}) {
  return (
    <PlatformIconByKey
      platformKey={resolvePlatformIconKey(platform)}
      size={size}
      className={className}
    />
  );
}
