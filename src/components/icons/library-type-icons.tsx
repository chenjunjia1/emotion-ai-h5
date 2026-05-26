import { cn } from "@/lib/utils";
import { BlindBoxMiniIcon } from "@/components/icons/blind-box-mini-icon";

export type LibraryIconSize = "sm" | "md" | "lg";

const SIZE: Record<LibraryIconSize, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-6 w-6",
};

type IconProps = { className?: string; size?: LibraryIconSize };

export function LibraryPackIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(SIZE[size], className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M13 2.5 5.5 13.5H11l-1.2 8.2L18.5 10.5H13l1-8Z"
        fill="currentColor"
        stroke="white"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LibraryEmotionIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(SIZE[size], className)}
      fill="none"
      aria-hidden
    >
      <path
        d="M5.5 6.25h13A2.75 2.75 0 0 1 21.25 9v5.25A2.75 2.75 0 0 1 18.5 17h-6.9l-3.35 2.45a1 1 0 0 1-1.55-.88V17H5.5A2.75 2.75 0 0 1 2.75 14.25V9A2.75 2.75 0 0 1 5.5 6.25Z"
        fill="currentColor"
      />
      <circle cx="9.25" cy="11.25" r="1.05" fill="white" opacity="0.92" />
      <circle cx="14.75" cy="11.25" r="1.05" fill="white" opacity="0.92" />
      <path
        d="M8.75 13.75c.85 1.05 2.05 1.6 3.25 1.6s2.4-.55 3.25-1.6"
        stroke="white"
        strokeWidth="1.15"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M17.25 4.75 18 6.2l1.55.22-1.12 1.1.26 1.55-1.4-.75-1.4.75.26-1.55-1.12-1.1 1.55-.22Z"
        fill="white"
        opacity="0.88"
      />
    </svg>
  );
}

export function LibraryReviewIcon({ className, size = "md" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn(SIZE[size], className)}
      fill="none"
      aria-hidden
    >
      <rect x="5" y="12" width="3" height="7" rx="1" fill="currentColor" />
      <rect x="10.5" y="8" width="3" height="11" rx="1" fill="currentColor" opacity="0.9" />
      <rect x="16" y="5" width="3" height="14" rx="1" fill="currentColor" opacity="0.8" />
      <path
        d="M4 20h16"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export type LibraryIconKind = "pack" | "blindbox" | "emotion" | "review";

export function LibraryTypeIcon({
  kind,
  className,
  size = "md",
}: {
  kind: LibraryIconKind;
  className?: string;
  size?: LibraryIconSize;
}) {
  switch (kind) {
    case "pack":
      return <LibraryPackIcon className={className} size={size} />;
    case "blindbox":
      return <BlindBoxMiniIcon className={className} size={size} />;
    case "emotion":
      return <LibraryEmotionIcon className={className} size={size} />;
    case "review":
      return <LibraryReviewIcon className={className} size={size} />;
  }
}
