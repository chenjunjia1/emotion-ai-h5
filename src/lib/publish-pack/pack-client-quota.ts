const KEY_PREFIX = "pack_quick_free_";

function todayKey(userId: string) {
  const d = new Date();
  const day = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return `${KEY_PREFIX}${userId}_${day}`;
}

export function getLocalQuickFreeUsed(userId: string): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(todayKey(userId));
  return raw ? Number(raw) || 0 : 0;
}

export function incLocalQuickFreeUsed(userId: string): void {
  if (typeof window === "undefined") return;
  const n = getLocalQuickFreeUsed(userId) + 1;
  localStorage.setItem(todayKey(userId), String(n));
}
