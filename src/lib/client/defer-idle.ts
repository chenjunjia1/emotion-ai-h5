/** 在浏览器空闲时再执行，避免与首屏抢带宽 */
export function runWhenIdle(fn: () => void, timeoutMs = 2500): void {
  if (typeof window === "undefined") return;
  const ric = window.requestIdleCallback;
  if (typeof ric === "function") {
    ric(() => fn(), { timeout: timeoutMs });
    return;
  }
  setTimeout(fn, Math.min(1200, timeoutMs));
}
