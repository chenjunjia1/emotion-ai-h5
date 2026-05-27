/**
 * AI 配图服务（服务端）
 * 默认讯飞星绘（或 XINGHUI_MOCK 演示）；火山方舟仅 ARK_IMAGE_ENABLED=1 时启用
 */

import type { ImageCountOption } from "@/lib/publish-pack/pack-pricing";
import type { ContentGuess, PackageImage } from "@/lib/publish-pack/quick-package-types";
import {
  assertArkReady,
  generateArkPackageImages,
  generateOneArkImage,
  getArkConfig,
  ArkImageError,
} from "@/services/arkImageService";
import {
  assertXinghuiReady,
  generateOneXinghuiImage,
  generateXinghuiPackageImages,
  getXinghuiConfig,
  XinghuiImageError,
} from "@/services/xinghuiImageService";

export { ArkImageError, XinghuiImageError };
export { ArkImageError as OpenAIImageError };

export type ImageGenInput = {
  topic: string;
  guess: ContentGuess;
  count?: number;
  tier?: "regular" | "premium";
  aspect?: PackageImage["aspect"];
  prefs?: import("@/lib/publish-pack/quick-package-types").AdvancedPreferences;
  promptOverride?: string;
  existingUrls?: string[];
};

export type ImageProviderId = "ark" | "xinghui" | "mock";

/** 火山方舟需显式开启（未接火山时不要设 ARK_IMAGE_ENABLED=1） */
function isArkEnabled(): boolean {
  return (
    process.env.ARK_IMAGE_ENABLED === "1" && getArkConfig().configured
  );
}

export function resolveImageProvider(): ImageProviderId {
  const xh = getXinghuiConfig();
  if (isArkEnabled()) return "ark";
  if (xh.mock) return "mock";
  if (xh.configured) return "xinghui";
  return "xinghui";
}

/** 本地/Admin 自检 */
export function getImageProviderStatus() {
  const ark = getArkConfig();
  const xh = getXinghuiConfig();
  const provider = resolveImageProvider();
  return {
    provider,
    ark: ark.configured,
    arkEndpoint: ark.endpoint || undefined,
    xinghui: xh.configured || xh.mock,
    xinghuiMock: xh.mock,
    arkEnabled: isArkEnabled(),
    advancedRequiresArk: provider === "ark",
  };
}

export function assertAdvancedImageReady(): void {
  const p = resolveImageProvider();
  if (p === "ark") {
    assertArkReady();
    return;
  }
  assertXinghuiReady();
}

/** @deprecated */
export function assertXinghuiImageReady(): void {
  assertAdvancedImageReady();
}

/** @deprecated */
export function assertOpenAIReady(): void {
  assertAdvancedImageReady();
}

type RawImage = {
  id: string;
  url: string;
  role: "cover" | "gallery";
  styleName: string;
  prompt: string;
};

function toPackageImages(raw: RawImage[]): PackageImage[] {
  return raw.map((img) => ({
    id: img.id,
    url: img.url,
    role: img.role,
    aspect: img.role === "cover" ? ("4:5" as const) : ("1:1" as const),
    tier: "premium" as const,
    alt: img.styleName,
  }));
}

async function generatePackageImagesInternal(input: {
  topic: string;
  guess: ContentGuess;
  prefs?: ImageGenInput["prefs"];
  count: ImageCountOption;
}): Promise<RawImage[]> {
  const provider = resolveImageProvider();
  if (provider === "ark") {
    return generateArkPackageImages(input);
  }
  return generateXinghuiPackageImages(input);
}

async function generateOneImageInternal(
  input: Parameters<typeof generateOneArkImage>[0]
): Promise<{ cdnUrl: string; styleName: string; prompt: string }> {
  if (resolveImageProvider() === "ark") {
    return generateOneArkImage(input);
  }
  return generateOneXinghuiImage(input);
}

/**
 * 高级图文包：全部图片必须 AI 生成，失败则抛错（不退占位图）
 */
export async function generateAdvancedImages(
  input: ImageGenInput & { count: ImageCountOption }
): Promise<PackageImage[]> {
  assertAdvancedImageReady();

  const count = input.count;

  if (input.existingUrls?.length && input.existingUrls.length >= count) {
    return input.existingUrls.slice(0, count).map((url, i) => ({
      id: i === 0 ? "cover" : `g${i}`,
      url,
      role: i === 0 ? "cover" : "gallery",
      aspect: i === 0 ? "4:5" : "1:1",
      tier: "premium",
      alt: input.topic,
    }));
  }

  const raw = await generatePackageImagesInternal({
    topic: input.topic,
    guess: input.guess,
    prefs: input.prefs,
    count,
  });

  return toPackageImages(raw);
}

export async function generatePackageImages(input: ImageGenInput): Promise<PackageImage[]> {
  const count = input.count ?? 4;
  const tier = input.tier ?? "regular";

  if (tier === "premium") {
    return generateAdvancedImages({ ...input, count: count as ImageCountOption });
  }

  throw new ArkImageError(
    "no_config",
    "工作室普通配图已下线，请使用高级图文包（真实感 AI 配图）"
  );
}

export async function regenerateImage(input: {
  topic: string;
  guess: ContentGuess;
  imageId: string;
  asCover?: boolean;
  tier?: "regular" | "premium";
  prefs?: ImageGenInput["prefs"];
}): Promise<PackageImage> {
  assertAdvancedImageReady();

  const one = await generateOneImageInternal({
    topic: input.topic,
    guess: input.guess,
    prefs: input.prefs,
    role: input.asCover ? "cover" : "gallery",
    index: input.imageId.startsWith("g") ? Number(input.imageId.slice(1)) || 0 : 0,
  });

  return {
    id: input.imageId,
    url: one.cdnUrl,
    role: input.asCover ? "cover" : "gallery",
    aspect: input.asCover ? "4:5" : "1:1",
    tier: "premium",
    alt: input.topic,
  };
}

export function saveImageMeta(_url: string): { saved: boolean } {
  return { saved: true };
}
