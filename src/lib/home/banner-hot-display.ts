import { formatLibraryCountLabel, HOT_TOPIC_LIBRARY_MIN } from "@/lib/hot-topics/library-display";

/** 首页 Banner 展示灵感库规模（拉取前用保底文案） */
export function bannerLibraryLabel(activeCount?: number | null): string {
  const n = activeCount && activeCount > 0 ? activeCount : HOT_TOPIC_LIBRARY_MIN;
  return formatLibraryCountLabel(n);
}
