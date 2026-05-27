/** 将「今日情绪签」绘制成竖版海报并触发下载 */

const W = 750;
const H = 1125;

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = ch;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export type EmotionSignPosterInput = {
  quote: string;
  energy?: { fatigue: number; healing: number; happiness: number };
  night?: boolean;
};

export async function downloadEmotionSignPoster(input: EmotionSignPosterInput): Promise<boolean> {
  if (typeof document === "undefined") return false;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;

  const { quote, energy, night } = input;
  const dateStr = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const bg = ctx.createLinearGradient(0, 0, W, H);
  if (night) {
    bg.addColorStop(0, "#1e1b4b");
    bg.addColorStop(0.45, "#312e81");
    bg.addColorStop(1, "#4c1d95");
  } else {
    bg.addColorStop(0, "#fff1f5");
    bg.addColorStop(0.4, "#fce7f3");
    bg.addColorStop(1, "#fdf2f8");
  }
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.globalAlpha = 0.12;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(80 + i * 90, 120 + (i % 3) * 200, 40 + (i % 4) * 12, 0, Math.PI * 2);
    ctx.fillStyle = night ? "#c4b5fd" : "#f9a8d4";
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawRoundRect(ctx, 48, 160, W - 96, H - 320, 36);
  ctx.fillStyle = night ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.72)";
  ctx.fill();
  ctx.strokeStyle = night ? "rgba(255,255,255,0.15)" : "rgba(255,79,139,0.2)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = night ? "#f9a8d4" : "#db2777";
  ctx.font = "bold 36px system-ui, -apple-system, 'PingFang SC', sans-serif";
  ctx.fillText("今日情绪签", 88, 230);

  ctx.fillStyle = night ? "#f8fafc" : "#334155";
  ctx.font = "32px system-ui, -apple-system, 'PingFang SC', sans-serif";
  const lines = wrapLines(ctx, quote, W - 176);
  let y = 300;
  const lineHeight = 52;
  for (const ln of lines.slice(0, 12)) {
    ctx.fillText(ln, 88, y);
    y += lineHeight;
  }

  if (energy) {
    const bars: { label: string; value: number; color: string }[] = [
      { label: "疲惫值", value: energy.fatigue, color: "#f472b6" },
      { label: "治愈值", value: energy.healing, color: "#818cf8" },
      { label: "开心值", value: energy.happiness, color: "#fbbf24" },
    ];
    let by = y + 40;
    for (const bar of bars) {
      ctx.fillStyle = night ? "#94a3b8" : "#64748b";
      ctx.font = "24px system-ui, sans-serif";
      ctx.fillText(bar.label, 88, by);
      ctx.textAlign = "right";
      ctx.fillText(`${bar.value}%`, W - 88, by);
      ctx.textAlign = "left";
      by += 12;
      drawRoundRect(ctx, 88, by, W - 176, 14, 7);
      ctx.fillStyle = night ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.06)";
      ctx.fill();
      drawRoundRect(ctx, 88, by, ((W - 176) * bar.value) / 100, 14, 7);
      ctx.fillStyle = bar.color;
      ctx.fill();
      by += 44;
    }
  }

  ctx.textAlign = "center";
  ctx.fillStyle = night ? "#cbd5e1" : "#94a3b8";
  ctx.font = "22px system-ui, sans-serif";
  ctx.fillText(dateStr, W / 2, H - 120);
  ctx.fillStyle = night ? "#f9a8d4" : "#ec4899";
  ctx.font = "bold 26px system-ui, sans-serif";
  ctx.fillText("情绪树洞 Pro", W / 2, H - 78);
  ctx.font = "20px system-ui, sans-serif";
  ctx.fillStyle = night ? "#94a3b8" : "#cbd5e1";
  ctx.fillText(night ? "🌙 深夜，对自己温柔一点" : "🌸 允许自己慢下来", W / 2, H - 44);

  return new Promise((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        const file = new File([blob], `emotion-sign-${Date.now()}.png`, { type: "image/png" });
        if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: "今日情绪签" });
            resolve(true);
            return;
          } catch {
            /* fall through to download */
          }
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        resolve(true);
      },
      "image/png",
      0.92
    );
  });
}

export function buildEmotionSignShareText(
  quote: string,
  channel: "moments" | "wechat"
): string {
  const q = quote.trim();
  if (channel === "wechat") {
    const short = q.length > 28 ? `${q.slice(0, 28)}…` : q;
    return short;
  }
  return `${q}\n\n—— 今夜，情绪树洞陪你 🌙`;
}
