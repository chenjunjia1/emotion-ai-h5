/** 每日一次性玩法（转盘 / 刮刮卡 / 摇签） */

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function usedKey(id: string) {
  return `emotion_play_${id}_${todayKey()}`;
}

export function wasPlayUsedToday(id: "wheel" | "scratch" | "stick"): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(usedKey(id)) === "1";
}

export function markPlayUsedToday(id: "wheel" | "scratch" | "stick") {
  if (typeof window === "undefined") return;
  localStorage.setItem(usedKey(id), "1");
}
