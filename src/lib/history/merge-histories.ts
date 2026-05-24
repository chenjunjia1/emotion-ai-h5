import type { HistoryItem } from "@/lib/types/v1";

function historyKey(item: HistoryItem): string {
  return `${item.type}::${item.topic}`;
}

/** 服务端同步时保留尚未落库的乐观条目，避免被空列表覆盖 */
export function mergeHistories(
  server: HistoryItem[],
  local: HistoryItem[]
): HistoryItem[] {
  const serverIds = new Set(server.map((h) => h.id));
  const serverKeys = new Set(server.map(historyKey));
  const pending = local.filter((h) => {
    if (serverIds.has(h.id)) return false;
    return !serverKeys.has(historyKey(h));
  });
  return [...server, ...pending].slice(0, 50);
}
