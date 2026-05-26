/**
 * 星绘官方企业 API（讯飞星辰 TTI 协议，参数可通过环境变量覆盖）
 * 文档参考: https://docs.iflyaicloud.com/project-3/doc-279/
 */

import { buildXinghuiPrompt } from "@/lib/publish-pack/build-xinghui-prompt";
import type { AdvancedPreferences, ContentGuess } from "@/lib/publish-pack/quick-package-types";
import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import { uploadFromBase64, uploadFromUrl } from "@/services/storageService";

export class XinghuiImageError extends Error {
  code: "no_config" | "api_error" | "empty_response" | "network";
  status?: number;

  constructor(
    code: XinghuiImageError["code"],
    message: string,
    opts?: { status?: number }
  ) {
    super(message);
    this.name = "XinghuiImageError";
    this.code = code;
    this.status = opts?.status;
  }
}

export function getXinghuiConfig() {
  return {
    configured: Boolean(
      process.env.XINGHUI_APP_ID?.trim() &&
        (process.env.XINGHUI_API_KEY?.trim() || process.env.XINGHUI_API_SECRET?.trim())
    ),
    apiUrl:
      process.env.XINGHUI_API_URL?.trim() ||
      "https://xingchen-api.cn-huabei-1.xf-yun.com/v2.1/tti",
    mock: process.env.XINGHUI_MOCK === "1",
  };
}

export function assertXinghuiReady(): void {
  const cfg = getXinghuiConfig();
  if (cfg.mock) return;
  if (!cfg.configured) {
    throw new XinghuiImageError(
      "no_config",
      "请配置星绘企业 API：XINGHUI_APP_ID、XINGHUI_API_KEY（及鉴权参数）"
    );
  }
}

type GenSize = { width: number; height: number };

function resolveSize(role: "cover" | "gallery"): GenSize {
  if (role === "cover") {
    return { width: 768, height: 1024 };
  }
  return { width: 1024, height: 1024 };
}

/** 讯飞星辰 HTTP 鉴权（简化：使用环境变量预生成 Authorization，或 APIKey 模式） */
function buildAuthHeaders(): Record<string, string> {
  const apiKey = process.env.XINGHUI_API_KEY?.trim();
  const authHeader = process.env.XINGHUI_AUTH_HEADER?.trim();
  if (authHeader) {
    return { Authorization: authHeader };
  }
  if (apiKey) {
    return { Authorization: `Bearer ${apiKey}`, "X-Api-Key": apiKey };
  }
  return {};
}

async function callXinghuiTti(body: Record<string, unknown>): Promise<ImagePayload> {
  const res = await fetch(getXinghuiConfig().apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...buildAuthHeaders(),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120_000),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new XinghuiImageError("api_error", `星绘出图失败 (${res.status})`, {
      status: res.status,
    });
  }

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new XinghuiImageError("empty_response", "星绘返回格式异常");
  }

  const header = data.header as { code?: number; message?: string } | undefined;
  if (header?.code !== undefined && header.code !== 0) {
    throw new XinghuiImageError(
      "api_error",
      header.message ?? `星绘错误码 ${header.code}`
    );
  }

  const imagePayload = extractImagePayload(data);
  if (!imagePayload) throw new XinghuiImageError("empty_response", "星绘未返回图片数据");
  return imagePayload;
}

type ImagePayload = { kind: "base64"; data: string } | { kind: "url"; data: string };

function extractImagePayload(data: Record<string, unknown>): ImagePayload | null {
  const payload = data.payload as Record<string, unknown> | undefined;
  const choices = payload?.choices as { text?: { content?: string }[] } | undefined;
  const fromChoices = choices?.text?.[0]?.content;
  if (typeof fromChoices === "string") {
    if (fromChoices.startsWith("http")) return { kind: "url", data: fromChoices };
    if (fromChoices.length > 100) return { kind: "base64", data: fromChoices };
  }

  const dataArr = (data as { data?: { b64_json?: string; image?: string; url?: string }[] }).data;
  const item = dataArr?.[0];
  if (item?.url?.startsWith("http")) return { kind: "url", data: item.url };
  if (item?.b64_json) return { kind: "base64", data: item.b64_json };
  if (item?.image) {
    if (item.image.startsWith("http")) return { kind: "url", data: item.image };
    return { kind: "base64", data: item.image };
  }

  const output = data.output as { image?: string; url?: string } | undefined;
  if (output?.url?.startsWith("http")) return { kind: "url", data: output.url };
  if (output?.image) {
    if (output.image.startsWith("http")) return { kind: "url", data: output.image };
    return { kind: "base64", data: output.image };
  }

  return null;
}

function buildRequestBody(
  prompt: string,
  negativePrompt: string,
  size: GenSize
): Record<string, unknown> {
  const appId = process.env.XINGHUI_APP_ID?.trim() || "app";
  const domain = process.env.XINGHUI_DOMAIN?.trim() || process.env.XINGHUI_SERVICE_ID?.trim() || "";

  return {
    header: {
      app_id: appId,
      uid: "publish-pack",
    },
    parameter: {
      chat: {
        domain,
        width: size.width,
        height: size.height,
        seed: Math.floor(Math.random() * 999999),
        num_inference_steps: Number(process.env.XINGHUI_STEPS ?? 20),
        guidance_scale: Number(process.env.XINGHUI_GUIDANCE ?? 5),
        scheduler: process.env.XINGHUI_SCHEDULER?.trim() || "Euler",
      },
    },
    payload: {
      message: {
        text: [{ role: "user", content: prompt }],
      },
      negative_prompts: {
        text: negativePrompt,
      },
    },
  };
}

export async function generateOneXinghuiImage(input: {
  topic: string;
  guess: ContentGuess;
  prefs?: AdvancedPreferences;
  role: "cover" | "gallery";
  index?: number;
}): Promise<{ cdnUrl: string; styleName: string; prompt: string }> {
  assertXinghuiReady();
  const { prompt, negativePrompt, styleName } = buildXinghuiPrompt(input);
  const size = resolveSize(input.role);

  if (getXinghuiConfig().mock) {
    const seed = encodeURIComponent(
      `xh-${input.topic}-${input.role}-${input.index ?? 0}`.slice(0, 40)
    );
    const w = input.role === "cover" ? 600 : 500;
    const h = input.role === "cover" ? 750 : 500;
    return {
      cdnUrl: `/api/cover-seed/${seed}?w=${w}&h=${h}`,
      styleName,
      prompt,
    };
  }

  const payload = await callXinghuiTti(buildRequestBody(prompt, negativePrompt, size));
  const stored =
    payload.kind === "url"
      ? await uploadFromUrl(payload.data, { keyPrefix: "publish-pack" })
      : await uploadFromBase64(payload.data, { keyPrefix: "publish-pack" });
  return { cdnUrl: stored.cdnUrl, styleName, prompt };
}

export async function generateXinghuiPackageImages(input: {
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
  const coverTask = generateOneXinghuiImage({
    topic: input.topic,
    guess: input.guess,
    prefs: input.prefs,
    role: "cover",
  });

  const galleryNeed = Math.max(0, count - 1);
  const galleryTasks = Array.from({ length: galleryNeed }, (_, i) =>
    generateOneXinghuiImage({
      topic: input.topic,
      guess: input.guess,
      prefs: input.prefs,
      role: "gallery",
      index: i,
    })
  );

  const [cover, ...galleries] = await Promise.all([coverTask, ...galleryTasks]);

  const images = [
    {
      id: "cover",
      url: cover.cdnUrl,
      role: "cover" as const,
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

  return images;
}
