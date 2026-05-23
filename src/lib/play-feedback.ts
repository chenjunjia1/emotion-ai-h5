/** 轻量音效 + 震动（00 后开箱反馈，无需音频文件） */

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

function tone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.12
) {
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export function hapticLight() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

export function hapticSuccess() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([15, 30, 20]);
  }
}

export function hapticSsr() {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate([20, 40, 30, 50, 40]);
  }
}

/** 普通开箱 */
export function playOpenBox() {
  tone(440, 0.08);
  window.setTimeout(() => tone(554, 0.1), 80);
}

/** 任务完成叮一声 */
export function playTaskDone() {
  tone(660, 0.12, "triangle", 0.1);
}

/** 扭蛋停轮 */
export function playGachaStop() {
  tone(523, 0.06, "square", 0.08);
}

/** SSR 稀有掉落（三连音 + 上行） */
export function playSsrReveal() {
  tone(523, 0.1, "sine", 0.14);
  window.setTimeout(() => tone(659, 0.1, "sine", 0.14), 100);
  window.setTimeout(() => tone(784, 0.18, "sine", 0.16), 200);
  window.setTimeout(() => tone(1047, 0.22, "triangle", 0.12), 320);
}

/** 陪跑宝箱领取 */
export function playChestClaim() {
  tone(392, 0.1);
  window.setTimeout(() => tone(494, 0.1), 90);
  window.setTimeout(() => tone(587, 0.14), 180);
}
