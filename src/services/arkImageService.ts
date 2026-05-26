/**
 * 火山方舟 · 豆包 Seedream 图片生成（在线推理接入点）
 * 文档: https://www.volcengine.com/docs/82379/1541523
 */

import { buildXinghuiPrompt } from "@/lib/publish-pack/build-xinghui-prompt";
import type { AdvancedPreferences, ContentGuess } from "@/lib/publish-pack/quick-package-types";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import { uploadFromUrl } from "@/services/storageService";

export class ArkImageError extends Error {
  code: "no_config" | "api_error" | "empty_response" | "network";
  status?: number;

  constructor(code: ArkImageError["code"], message: string, opts?: { status?: number }) {
    super(message);
    this.name = "ArkImageError";
    this.code = code;
    this.status = opts?.status;
  }
}

export function getArkConfig() {
  return {
    configured: Boolean(
      process.env.ARK_API_KEY?.trim() && process.env.ARK_IMAGE_ENDPOINT?.trim()
    ),
    apiBase:
      process.env.ARK_API_BASE?.trim() ||
      "https://ark.cn-beijing.volces.com/api/v3",
    endpoint: process.env.ARK_IMAGE_ENDPOINT?.trim() || "",
    watermark: process.env.ARK_IMAGE_WATERMARK === "1",
    size: process.env.ARK_IMAGE_SIZE?.trim() || "2K",
  };
}

export function assertArkReady(): void {
  if (!getArkConfig().configured) {
    throw new ArkImageError(
      "no_config",
      "请配置 ARK_API_KEY 与 ARK_IMAGE_ENDPOINT（火山方舟在线推理接入点 ID）"
    );
  }
}

type ArkGenResponse = {
  data?: { url?: string; b64_json?: string }[];
  error?: { message?: string; code?: string };
};

function resolveArkSize(role: "cover" | "gallery"): string {
  if (process.env.ARK_FAST === "1") {
    return role === "cover"
      ? process.env.ARK_IMAGE_SIZE_COVER?.trim() || "1K"
      : process.env.ARK_IMAGE_SIZE_GALLERY?.trim() || "1K";
  }
  if (role === "cover") {
    return (
      process.env.ARK_IMAGE_SIZE_COVER?.trim() ||
      process.env.ARK_IMAGE_SIZE?.trim() ||
      "1728x2304"
    );
  }
  return process.env.ARK_IMAGE_SIZE_GALLERY?.trim() || process.env.ARK_IMAGE_SIZE?.trim() || "2K";
}

async function callArkImageGeneration(
  prompt: string,
  role: "cover" | "gallery"
): Promise<string> {
  const cfg = getArkConfig();
  const url = `${cfg.apiBase.replace(/\/$/, "")}/images/generations`;
  const size = resolveArkSize(role);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.ARK_API_KEY!.trim()}`,
    },
    body: JSON.stringify({
      model: cfg.endpoint,
      prompt: prompt.slice(0, 2000),
      sequential_image_generation: "disabled",
      response_format: "url",
      size,
      stream: false,
      watermark: cfg.watermark,
    }),
    signal: AbortSignal.timeout(120_000),
  });

  const text = await res.text();
  let data: ArkGenResponse;
  try {
    data = JSON.parse(text) as ArkGenResponse;
  } catch {
    throw new ArkImageError("empty_response", "火山方舟返回格式异常");
  }

  if (!res.ok) {
    const msg = data.error?.message || text.slice(0, 200);
    throw new ArkImageError("api_error", `火山方舟出图失败 (${res.status}): ${msg}`, {
      status: res.status,
    });
  }

  const item = data.data?.[0];
  if (item?.url) return item.url;
  if (item?.b64_json) {
    const { uploadFromBase64 } = await import("@/services/storageService");
    const stored = await uploadFromBase64(item.b64_json, { keyPrefix: "publish-pack/ark" });
    return stored.cdnUrl;
  }

  throw new ArkImageError("empty_response", "火山方舟未返回图片");
}

export async function generateOneArkImage(input: {
  topic: string;
  guess: ContentGuess;
  prefs?: AdvancedPreferences;
  role: "cover" | "gallery";
  index?: number;
}): Promise<{ cdnUrl: string; styleName: string; prompt: string }> {
  assertArkReady();
  const { prompt, styleName } = buildXinghuiPrompt(input);
  const tempUrl = await callArkImageGeneration(prompt, input.role);
  const stored = await uploadFromUrl(tempUrl, { keyPrefix: "publish-pack/ark" });
  return { cdnUrl: stored.cdnUrl, styleName, prompt };
}

export async function generateArkPackageImages(input: {
  topic: string;
  guess: ContentGuess;
  prefs?: AdvancedPreferences;
  count: ImageCountOption;
}): Promise<
  Array<{
    id: string;
    url: string;
    role: "cover" | "gallery";
    styleName: string;
    prompt: string;
  }>
> {
  const count = input.count;
  const coverTask = generateOneArkImage({
    topic: input.topic,
    guess: input.guess,
    prefs: input.prefs,
    role: "cover",
  });

  const galleryNeed = Math.max(0, count - 1);
  const galleryTasks = Array.from({ length: galleryNeed }, (_, i) =>
    generateOneArkImage({
      topic: input.topic,
      guess: input.guess,
      prefs: input.prefs,
      role: "gallery",
      index: i,
    })
  );

  const [cover, ...galleries] = await Promise.all([coverTask, ...galleryTasks]);

  return [
    {
      id: "cover",
      url: cover.cdnUrl,
      role: "cover",
      styleName: cover.styleName,
      prompt: cover.prompt,
    },
    ...galleries.map((g, i) => ({
      id: `g${i + 1}`,
      url: g.cdnUrl,
      role: "gallery" as const,
      styleName: g.styleName,
      prompt: g.prompt,
    })),
  ];
}
