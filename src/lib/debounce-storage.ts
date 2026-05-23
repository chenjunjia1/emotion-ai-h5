const timers = new Map<string, ReturnType<typeof setTimeout>>();

/** 避免每次 state 变更都同步写 localStorage 阻塞主线程 */
export function debouncedSaveJson(key: string, value: unknown, delayMs = 400) {
  if (typeof window === "undefined") return;
  const prev = timers.get(key);
  if (prev) clearTimeout(prev);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* quota / private mode */
      }
    }, delayMs)
  );
}
