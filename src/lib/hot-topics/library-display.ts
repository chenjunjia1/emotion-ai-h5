import { HOT_TOPIC_LIBRARY_MIN } from "@/lib/hot-topics/bulk-library-generator";

export { HOT_TOPIC_LIBRARY_MIN };

/** 热点灵感库展示文案（与库内真实 active 条数对齐） */

export function formatLibraryCountLabel(activeCount: number): string {
  const n = Math.max(0, activeCount);
  if (n >= 10_000) return "1万+";
  if (n >= 1000) {
    const k = Math.floor(n / 100) * 100;
    return `${k}+`;
  }
  if (n >= 100) return `${n}+`;
  return String(n);
}

export function hotTopicLibraryMeta(todayActive: number) {
  const n = Math.max(0, todayActive);
  const label = formatLibraryCountLabel(n);
  return {
    libraryTotal: n,
    libraryLabel: label,
    todayActive: n,
  };
}
