"use client";

const EMOJIS = ["✨", "🎉", "💖", "🔥", "⭐", "🧋", "💫", "🎊"];

export function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {EMOJIS.map((e, i) => (
        <span
          key={`${e}-${i}`}
          className="play-confetti absolute text-base"
          style={{
            left: `${12 + (i * 11) % 76}%`,
            top: `${20 + (i * 7) % 40}%`,
            animationDelay: `${i * 0.06}s`,
          }}
        >
          {e}
        </span>
      ))}
    </div>
  );
}
