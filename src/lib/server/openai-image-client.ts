/**
 * OpenAI Images API — 支持代理、重试；高级发布包必须走此通道
 */
import { ProxyAgent, fetch as undiciFetch } from "undici";
import { persistOpenAIImageUrl } from "@/lib/server/openai-image-store";

export class OpenAIImageError extends Error {
  code: "no_key" | "network" | "api_error" | "empty_response";
  status?: number;
  detail?: string;

  constructor(
    code: OpenAIImageError["code"],
    message: string,
    opts?: { status?: number; detail?: string }
  ) {
    super(message);
    this.name = "OpenAIImageError";
    this.code = code;
    this.status = opts?.status;
    this.detail = opts?.detail;
  }
}

function getProxyUrl(): string | undefined {
  return (
    process.env.OPENAI_PROXY_URL?.trim() ||
    process.env.HTTPS_PROXY?.trim() ||
    process.env.HTTP_PROXY?.trim() ||
    undefined
  );
}

let proxyAgent: ProxyAgent | undefined;

async function openaiFetch(url: string, init: RequestInit) {
  const proxy = getProxyUrl();
  if (proxy) {
    if (!proxyAgent) proxyAgent = new ProxyAgent(proxy);
    return undiciFetch(url, {
      method: init.method,
      headers: init.headers as HeadersInit,
      body: typeof init.body === "string" ? init.body : undefined,
      signal: init.signal,
      dispatcher: proxyAgent,
    });
  }
  return fetch(url, init);
}

export function getOpenAIImageConfig() {
  const key = process.env.OPENAI_API_KEY?.trim();
  const model = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
  const proxy = getProxyUrl();
  return { hasKey: Boolean(key), model, proxy: proxy ? proxy.replace(/\/\/.*@/, "//***@") : null };
}

/** dall-e-3 尺寸；gpt-image-1 用 resolveOpenAISize 映射 */
export type OpenAIImageSize = "1024x1024" | "1024x1792" | "1792x1024" | "portrait" | "landscape";

function resolveOpenAISize(
  model: string,
  requested: OpenAIImageSize
): string {
  if (model === "gpt-image-1" || model.startsWith("gpt-image")) {
    switch (requested) {
      case "portrait":
      case "1024x1792":
        return "1024x1536";
      case "landscape":
      case "1792x1024":
        return "1536x1024";
      case "1024x1024":
      default:
        return "1024x1024";
    }
  }
  if (model === "dall-e-2") return "1024x1024";
  switch (requested) {
    case "portrait":
    case "1024x1792":
      return "1024x1792";
    case "landscape":
    case "1792x1024":
      return "1792x1024";
    default:
      return "1024x1024";
  }
}

export async function generateOpenAIImage(
  prompt: string,
  opts?: { size?: OpenAIImageSize; retries?: number }
): Promise<string> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    throw new OpenAIImageError("no_key", "未配置 OPENAI_API_KEY");
  }

  const configured = process.env.OPENAI_IMAGE_MODEL?.trim();
  const modelCandidates = [
    configured,
    "gpt-image-1",
    "dall-e-3",
    "dall-e-2",
  ].filter((m, i, arr): m is string => Boolean(m) && arr.indexOf(m) === i);

  const requestedSize = opts?.size ?? "portrait";
  const maxAttempts = opts?.retries ?? 3;
  let lastErr: OpenAIImageError | null = null;

  for (const model of modelCandidates) {
    const apiSize = resolveOpenAISize(model, requestedSize);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const safePrompt = `${prompt}. Premium Xiaohongshu lifestyle photo, realistic, no text in image, no watermark.`.slice(
          0,
          900
        );
        const body: Record<string, unknown> = {
          model,
          prompt: safePrompt,
          size: apiSize,
          n: 1,
        };
        if (model === "dall-e-3") body.quality = "standard";

        const res = await openaiFetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(90_000),
        });

      const text = await res.text();
      if (!res.ok) {
        const invalidModel =
          res.status === 400 && text.includes("model") && text.includes("does not exist");
        const invalidSize = res.status === 400 && text.includes("Invalid size");
        lastErr = new OpenAIImageError(
          "api_error",
          invalidSize
            ? `OpenAI 尺寸不支持 (${apiSize})，请检查 OPENAI_IMAGE_MODEL`
            : `OpenAI 出图失败 (${res.status})`,
          { status: res.status, detail: text.slice(0, 300) }
        );
        if (invalidModel) break;
        if (invalidSize) break;
        if (res.status >= 500 && attempt < maxAttempts) {
          await sleep(1500 * attempt);
          continue;
        }
        throw lastErr;
      }

      let data: { data?: { url?: string; b64_json?: string }[] };
      try {
        data = JSON.parse(text) as typeof data;
      } catch {
        throw new OpenAIImageError("empty_response", "OpenAI 返回格式异常");
      }

      const item = data.data?.[0];
      if (item?.url) return persistOpenAIImageUrl(item.url);
      if (item?.b64_json) return persistOpenAIImageUrl(item.b64_json);
      throw new OpenAIImageError("empty_response", "OpenAI 未返回图片");
    } catch (e) {
      if (e instanceof OpenAIImageError) {
        lastErr = e;
        if (e.code === "api_error" && e.status && e.status < 500) throw e;
      } else {
        const msg = e instanceof Error ? e.message : String(e);
        const isNet =
          msg.includes("fetch failed") ||
          msg.includes("timeout") ||
          msg.includes("ECONNREFUSED") ||
          msg.includes("UND_ERR");
        lastErr = new OpenAIImageError(
          isNet ? "network" : "api_error",
          isNet
            ? "无法连接 OpenAI，请配置 OPENAI_PROXY_URL 或开启 VPN 后重启服务"
            : msg
        );
      }
      if (attempt < maxAttempts) {
        await sleep(2000 * attempt);
        continue;
      }
    }
    }
  }

  throw lastErr ?? new OpenAIImageError("network", "OpenAI 出图失败");
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** 启动时探测 OpenAI 是否可达（开发自检） */
export async function probeOpenAIImage(): Promise<{ ok: boolean; error?: string }> {
  try {
    await generateOpenAIImage(
      "test cozy desk lamp warm light minimal lifestyle",
      { size: "portrait", retries: 1 }
    );
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof OpenAIImageError ? e.message : String(e),
    };
  }
}
