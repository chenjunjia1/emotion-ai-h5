export type PexelsPhotoResult = {
  imageUrl: string;
  photographer: string;
  photographerUrl: string;
  pexelsUrl: string;
  alt: string;
};

type PexelsPhoto = {
  id: number;
  alt?: string;
  url: string;
  photographer: string;
  photographer_url: string;
  src: {
    medium?: string;
    large?: string;
    large2x?: string;
    portrait?: string;
    landscape?: string;
  };
};

const PEXELS_SEARCH = "https://api.pexels.com/v1/search";
const TIMEOUT_MS = 8000;

function pickImageUrl(photo: PexelsPhoto): string {
  return (
    photo.src.portrait ||
    photo.src.large ||
    photo.src.large2x ||
    photo.src.medium ||
    photo.src.landscape ||
    photo.url
  );
}

/** 一次搜索返回最多 10 张（列表同关键词复用，减少 API 调用） */
export async function searchPexelsPhotos(query: string): Promise<PexelsPhotoResult[]> {
  const apiKey = process.env.PEXELS_API_KEY?.trim();
  if (!apiKey) return [];

  const q = query.trim().slice(0, 120);
  if (!q) return [];

  const url = new URL(PEXELS_SEARCH);
  url.searchParams.set("query", q);
  url.searchParams.set("per_page", "10");
  url.searchParams.set("orientation", "portrait");
  url.searchParams.set("locale", "en-US");

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: apiKey },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];

    const data = (await res.json()) as { photos?: PexelsPhoto[] };
    return (data.photos ?? [])
      .map((photo) => {
        const imageUrl = pickImageUrl(photo);
        if (!imageUrl) return null;
        return {
          imageUrl,
          photographer: photo.photographer,
          photographerUrl: photo.photographer_url,
          pexelsUrl: photo.url,
          alt: photo.alt || q,
        } satisfies PexelsPhotoResult;
      })
      .filter((x): x is PexelsPhotoResult => x !== null);
  } catch {
    return [];
  }
}

/**
 * 搜索 Pexels 图片；index 在结果池内轮换，避免同 query 总拿第一张
 */
export async function searchPexelsPhoto(
  query: string,
  pickIndex = 0
): Promise<PexelsPhotoResult | null> {
  const pool = await searchPexelsPhotos(query);
  if (!pool.length) return null;
  const idx = ((pickIndex % pool.length) + pool.length) % pool.length;
  return pool[idx] ?? null;
}
