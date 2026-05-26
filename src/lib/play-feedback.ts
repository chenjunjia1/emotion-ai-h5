/** 轻量音效 + 震动（00 后开箱反馈，无需音频文件） */

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
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

/** 盲盒开盒：短促悦耳的「叮铃 + 上扬」 */
export function playOpenBox() {
  const ac = ctx();
  if (!ac) return;
  const t0 = ac.currentTime;
  const notes: { freq: number; at: number; dur: number; vol: number }[] = [
    { freq: 523.25, at: 0, dur: 0.14, vol: 0.1 },
    { freq: 659.25, at: 0.06, dur: 0.16, vol: 0.11 },
    { freq: 783.99, at: 0.12, dur: 0.2, vol: 0.12 },
    { freq: 1046.5, at: 0.2, dur: 0.28, vol: 0.1 },
  ];
  for (const n of notes) {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = n.freq;
    const start = t0 + n.at;
    gain.gain.setValueAtTime(0.001, start);
    gain.gain.exponentialRampToValueAtTime(n.vol, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, start + n.dur);
    osc.connect(gain);
    gain.connect(ac.destination);
    osc.start(start);
    osc.stop(start + n.dur);
  }
}

/** 盒盖弹开瞬间的轻「啵」 */
export function playBlindBoxPop() {
  tone(880, 0.08, "sine", 0.08);
  window.setTimeout(() => tone(1174.66, 0.12, "triangle", 0.07), 50);
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
