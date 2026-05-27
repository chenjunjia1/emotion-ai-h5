"use client";

import { useEffect, useMemo, useState } from "react";
import { buildInspirationCoverCandidates } from "@/lib/xhs/inspiration-cover-candidates";
import { markCoverWarmed } from "@/lib/xhs/inspiration-cover-cache";
import { railCoverStyleForNote } from "@/lib/xhs/rail-cover-style";
import type { XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

function CategoryCoverPlaceholder({
  note,
  emojiClass,
}: {
  note: XhsHotNote;
  emojiClass: string;
}) {
  const style = railCoverStyleForNote(note);
  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{
        backgroundImage: `linear-gradient(145deg, ${style.from}, ${style.to})`,
      }}
      aria-hidden
    >
      <span className={cn("opacity-90 drop-shadow-sm", emojiClass)}>{style.emoji}</span>
    </div>
  );
}

type Props = {
  note: XhsHotNote;
  priority?: boolean;
  /** 灵感列表左侧方图 */
  variant?: "rail" | "thumb";
};

export function InspirationNoteCover({ note, priority, variant = "rail" }: Props) {
  const preferSeed = variant === "rail";
  const candidates = useMemo(
    () => buildInspirationCoverCandidates(note, { preferSeed }),
    [note, preferSeed]
  );
  const [idx, setIdx] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  const src = candidates[idx];
  const emojiClass = variant === "thumb" ? "text-3xl" : "text-[42px]";

  useEffect(() => {
    setIdx(0);
    setLoaded(false);
    setExhausted(false);
  }, [note.noteId]);

  if (exhausted || candidates.length === 0) {
    return <CategoryCoverPlaceholder note={note} emojiClass={emojiClass} />;
  }

  const tryNext = () => {
    if (idx + 1 < candidates.length) {
      setIdx((i) => i + 1);
      setLoaded(false);
      return;
    }
    setExhausted(true);
    setLoaded(false);
  };

  return (
    <>
      <CategoryCoverPlaceholder note={note} emojiClass={emojiClass} />
      {!loaded ? (
        <div className="absolute inset-0 animate-pulse bg-white/20" aria-hidden />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={`${note.noteId}-${src}`}
        src={src}
        alt=""
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition duration-300",
          variant === "rail" && "group-active:scale-[1.04]",
          loaded ? "opacity-100" : "opacity-0"
        )}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        fetchPriority={priority ? "high" : "auto"}
        referrerPolicy="no-referrer"
        onLoad={(e) => {
          const el = e.currentTarget;
          const min = variant === "thumb" ? 80 : variant === "rail" ? 48 : 200;
          if (el.naturalWidth < min || el.naturalHeight < min) {
            tryNext();
            return;
          }
          markCoverWarmed(src);
          setLoaded(true);
        }}
        onError={tryNext}
      />
    </>
  );
}
