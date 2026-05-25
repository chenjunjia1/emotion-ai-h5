"use client";

import { useEffect, useMemo, useState } from "react";
import {
  resolveTopicCoversForList,
  type TopicCoverImage,
} from "@/lib/getTopicCoverImage";

export function useHotTopicPexelsCovers(
  items: { id: string; title: string; category?: string; track?: string }[]
) {
  const [covers, setCovers] = useState<Map<string, TopicCoverImage>>(new Map());
  const [loading, setLoading] = useState(false);

  const itemSig = useMemo(
    () => items.map((i) => `${i.id}|${i.title}|${i.category ?? i.track ?? ""}`).join("§"),
    [items]
  );

  useEffect(() => {
    if (!items.length) {
      setCovers(new Map());
      return;
    }

    let cancelled = false;
    setLoading(true);

    void resolveTopicCoversForList(items).then((map) => {
      if (cancelled) return;
      setCovers(map);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [itemSig, items]);

  return { covers, loading };
}
