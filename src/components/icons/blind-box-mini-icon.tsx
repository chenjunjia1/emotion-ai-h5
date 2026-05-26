import { cn } from "@/lib/utils";

/** 灵感盲盒 · 礼盒造型（内容库统计 / 列表 / 入口统一） */
export function BlindBoxMiniIcon({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "h-4 w-4" : size === "lg" ? "h-6 w-6" : "h-5 w-5";

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(sizeClass, className)}
      fill="none"
      aria-hidden
    >
      <rect x="5" y="12" width="14" height="8" rx="2" fill="currentColor" />
      <rect x="4" y="8.5" width="16" height="4" rx="1.25" fill="currentColor" opacity="0.88" />
      <path
        d="M12 8.5v11.5"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.92"
      />
      <path
        d="M4 10.25h16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M12 5.5c-1.8 0-3.2-1-3.8-2.6.9.25 2 0.85 3.8 1.85 1.8-1 2.9-1.6 3.8-1.85-.6 1.6-2 2.6-3.8 2.6Z"
        fill="#FFE8A8"
        stroke="white"
        strokeWidth="0.85"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 5.2l.45.9.95.45-.95.45-.45.9-.45-.9-.95-.45.95-.45.45-.9Z"
        fill="#FFE8A8"
      />
    </svg>
  );
}
