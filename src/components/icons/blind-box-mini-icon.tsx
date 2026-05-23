/** 内容库等处的迷你盲盒图标 */
export function BlindBoxMiniIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden
    >
      <path
        d="M4 9h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9Z"
        fill="currentColor"
        opacity="0.95"
      />
      <path d="M4 9h16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v2Z" fill="currentColor" opacity="0.75" />
      <path
        d="M12 5v15M4 9h16"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 5c-1.5 0-3-1-3.5-2.5S10 2 12 2s3.5.5 4 2S13.5 5 12 5Z"
        fill="#FFE8A8"
        stroke="white"
        strokeWidth="1"
      />
    </svg>
  );
}
