import type { ShortVideoCoverPreset, ShortVideoCoverStyle } from "@/lib/content/short-video-covers";
import { bundledCoverAtIndex } from "@/lib/content/bundled-cover-assets";
import { LOCAL_COVER_BY_SCENE, proxyUnsplashUrl } from "@/lib/content/cover-image-url";
import type { SceneCategory } from "@/lib/content/scene-cover-presets";

/** 标题语义场景（优先于 Tab 分类） */
export type CoverScene =
  | "summer_daily"
  | "summer_life"
  | "happy_mood"
  | "fashion_style"
  | "afternoon_life"
  | "interview"
  | "salary"
  | "commute"
  | "copywriting"
  | "office"
  | "food"
  | "pet"
  | "healing_emotion"
  | "lifestyle_cozy";

export type TopicCoverType = CoverScene;

type PoolEntry = {
  id: string;
  style: ShortVideoCoverStyle;
  filter: ShortVideoCoverPreset["filter"];
};

/**
 * 每池 ≥3 张实景 id（饮品/街景/咖啡/穿搭等，避免烧烤大餐）
 * 列表 index 轮换；代理失败时按 scene 映射 lifestyle/emotional/fashion，不用 food 兜底
 */
export const coverImagePools: Record<CoverScene, PoolEntry[]> = {
  summer_daily: [
    { id: "photo-1523365289041-28b317211188", style: "life", filter: "warm" },
    { id: "photo-1470252649378-9c29740c9e8c", style: "life", filter: "sunset" },
    { id: "photo-1498804624040-a69e20e78872", style: "life", filter: "warm" },
    { id: "photo-1433882971043-d78c8c8338c4", style: "life", filter: "life" },
  ],
  summer_life: [
    { id: "photo-1509631179647-0177331693ae", style: "life", filter: "sunset" },
    { id: "photo-1483985988350-763728e066fa", style: "fashion", filter: "warm" },
    { id: "photo-1469334031218-e382a71b716b", style: "life", filter: "warm" },
    { id: "photo-1501785884270-592cde61fca2", style: "life", filter: "sunset" },
  ],
  happy_mood: [
    { id: "photo-1522202176988-66273c2fd55f", style: "life", filter: "warm" },
    { id: "photo-1529156069898-8e5d496e7a38", style: "emotion", filter: "warm" },
    { id: "photo-1516589178581-6cd7833ae7b2", style: "emotion", filter: "warm" },
    { id: "photo-1495474472287-4d71bcff208a", style: "emotion", filter: "warm" },
  ],
  fashion_style: [
    { id: "photo-1515886657613-9f3515b0aee7", style: "fashion", filter: "sunset" },
    { id: "photo-1483985988350-763728e066fa", style: "fashion", filter: "warm" },
    { id: "photo-1469334031218-e382a71b716b", style: "fashion", filter: "warm" },
    { id: "photo-1496747611176-843222e1e57c", style: "fashion", filter: "warm" },
  ],
  afternoon_life: [
    { id: "photo-1495474472287-4d71bcff208a", style: "emotion", filter: "warm" },
    { id: "photo-1497366216548-37526070297c", style: "life", filter: "life" },
    { id: "photo-1524758631624-e2822f3049a5", style: "life", filter: "life" },
    { id: "photo-1615529328331-f9915cda9843", style: "life", filter: "warm" },
  ],
  interview: [
    { id: "photo-1521737710482-854655c98823", style: "life", filter: "life" },
    { id: "photo-1556760542-aba13454f237", style: "life", filter: "life" },
    { id: "photo-1573496359122-7f879d2ad8bc", style: "life", filter: "warm" },
    { id: "photo-1600880292203-757bb62b4fae", style: "life", filter: "life" },
  ],
  salary: [
    { id: "photo-1554224155-6726b3af48e3", style: "life", filter: "life" },
    { id: "photo-1460925895917-afdab827c52f", style: "life", filter: "life" },
    { id: "photo-1551288049-bebda4e38f71", style: "life", filter: "life" },
    { id: "photo-1553877522-43269d4ea984", style: "life", filter: "warm" },
  ],
  commute: [
    { id: "photo-1544629929-0736f52221f8", style: "vlog", filter: "sunset" },
    { id: "photo-1475274112273-480ab176faf9", style: "vlog", filter: "sunset" },
    { id: "photo-1480714378408-67cf0d13bc1b", style: "vlog", filter: "moody" },
    { id: "photo-1449824913935-59a10b8d2001", style: "vlog", filter: "sunset" },
  ],
  copywriting: [
    { id: "photo-1498050108033-f524b4debe36", style: "life", filter: "life" },
    { id: "photo-1456324504434-aa1e237fc053", style: "life", filter: "life" },
    { id: "photo-1516321318423-f06f85e504b3", style: "life", filter: "life" },
    { id: "photo-1484480974693-6ca0a7783d26", style: "life", filter: "warm" },
  ],
  office: [
    { id: "photo-1497366216548-37526070297c", style: "life", filter: "life" },
    { id: "photo-1524758631624-e2822f3049a5", style: "life", filter: "life" },
    { id: "photo-1600880292203-757bb62b4fae", style: "life", filter: "life" },
    { id: "photo-1556761175-5973da04a0eb", style: "life", filter: "warm" },
  ],
  food: [
    { id: "photo-1517248135467-4c7aa77318d8", style: "food", filter: "food" },
    { id: "photo-1546069901-ba9599a1e63c", style: "food", filter: "food" },
    { id: "photo-1555939594-58d7cb561ad1", style: "food", filter: "food" },
    { id: "photo-1565299624946-b28f40a0ca4b", style: "food", filter: "food" },
  ],
  pet: [
    { id: "photo-1514881248723-9ea5b7e6658f", style: "pet", filter: "pet" },
    { id: "photo-1574158622682-929a128bf3a2", style: "pet", filter: "pet" },
    { id: "photo-1450778869038-719714da8d94", style: "pet", filter: "warm" },
    { id: "photo-1587300003388-59208fb96281", style: "pet", filter: "pet" },
  ],
  healing_emotion: [
    { id: "photo-1506905925346-21bda4d32df4", style: "emotion", filter: "warm" },
    { id: "photo-1459257911876-07ab3da8bd63", style: "emotion", filter: "moody" },
    { id: "photo-1514565130917-fce080956dcc", style: "emotion", filter: "moody" },
    { id: "photo-1495474472287-4d71bcff208a", style: "emotion", filter: "warm" },
  ],
  lifestyle_cozy: [
    { id: "photo-1556912172-9b7a6ce7a860", style: "life", filter: "life" },
    { id: "photo-1522202176988-66273c2fd55f", style: "life", filter: "warm" },
    { id: "photo-1433882971043-d78c8c8338c4", style: "life", filter: "life" },
    { id: "photo-1501785884270-592cde61fca2", style: "life", filter: "sunset" },
  ],
};

/** 标题关键词 → scene（越具体越靠前；禁止用宽泛「美食/治愈」盖过标题语义） */
const TITLE_SCENE_RULES: { scene: CoverScene; re: RegExp }[] = [
  { scene: "summer_daily", re: /夏天味道|夏日饮品|清爽.*日常|夏天.*治愈日常/ },
  { scene: "summer_life", re: /夏天不完美|夏日街景|夏天.*很美/ },
  { scene: "happy_mood", re: /开心比|长生不老|开心.*重要/ },
  { scene: "fashion_style", re: /舞台|造型|怎么搭|OOTD|穿搭|妆造|衣橱/ },
  {
    scene: "afternoon_life",
    re: /普通下午|下午茶|记录.*下午|窗边|书桌|冰咖啡|街景.*生活/,
  },
  { scene: "interview", re: /面试/ },
  { scene: "salary", re: /工资|涨薪|薪资/ },
  { scene: "commute", re: /通勤|打工人|下班/ },
  {
    scene: "copywriting",
    re: /职场避坑|评论区|高互动写法|标题公式|爆款标题|笔记编辑|脚本公式|文案怎么|朋友圈同款/,
  },
  { scene: "food", re: /便利店|探店|逛吃|小吃街|火锅|烤肉|一人食|吃货|餐饮|吃什么|夜宵/ },
  { scene: "pet", re: /宠物|猫咪|萌宠|小猫|小狗|狗狗/ },
  { scene: "healing_emotion", re: /情绪共鸣|委屈|孤独|内耗|焦虑|放过自己|温柔|松弛/ },
  { scene: "healing_emotion", re: /治愈|情感|共鸣/ },
];

/** Tab 仅兜底；不得把「治愈」Tab 直接映射成美食图 */
const TAB_SCENE_FALLBACK: Record<string, CoverScene> = {
  职场: "office",
  美食: "food",
  宠物: "pet",
  治愈: "healing_emotion",
  情感: "healing_emotion",
  生活: "lifestyle_cozy",
  穿搭: "fashion_style",
};

/** 本地 JPG 兜底分类：非 food 场景禁止用 food 图 */
const SCENE_TO_BUNDLED: Record<CoverScene, SceneCategory> = {
  summer_daily: "lifestyle",
  summer_life: "lifestyle",
  happy_mood: "emotional",
  fashion_style: "fashion",
  afternoon_life: "lifestyle",
  interview: "study",
  salary: "study",
  commute: "worklife",
  copywriting: "study",
  office: "study",
  food: "food",
  pet: "pet",
  healing_emotion: "emotional",
  lifestyle_cozy: "lifestyle",
};

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** 仅根据 title 解析场景（category 不参与，避免「治愈」Tab 盖过标题） */
export function resolveCoverSceneFromTitle(title: string): CoverScene {
  const t = title.trim();
  for (const rule of TITLE_SCENE_RULES) {
    if (rule.re.test(t)) return rule.scene;
  }
  return "lifestyle_cozy";
}

/** title 优先；category 仅在 title 无命中时作 Tab 兜底 */
export function resolveCoverScene(title: string, category = ""): CoverScene {
  const t = title.trim();
  for (const rule of TITLE_SCENE_RULES) {
    if (rule.re.test(t)) return rule.scene;
  }

  const tab = category.trim().replace(/号$/u, "");
  if (tab && TAB_SCENE_FALLBACK[tab]) return TAB_SCENE_FALLBACK[tab];

  return "lifestyle_cozy";
}

export function resolveTopicCoverType(title: string, category = ""): CoverScene {
  return resolveCoverScene(title, category);
}

function poolForScene(scene: CoverScene): PoolEntry[] {
  return coverImagePools[scene] ?? coverImagePools.lifestyle_cozy;
}

function pickFromPool(
  pool: PoolEntry[],
  index: number,
  usedPhotoIds?: Set<string>,
  prevPhotoId?: string | null
): { picked: PoolEntry; poolIndex: number } {
  const start = ((index % pool.length) + pool.length) % pool.length;

  for (let attempt = 0; attempt < pool.length; attempt++) {
    const poolIndex = (start + attempt) % pool.length;
    const candidate = pool[poolIndex]!;
    if (usedPhotoIds?.has(candidate.id)) continue;
    if (prevPhotoId && candidate.id === prevPhotoId) continue;
    return { picked: candidate, poolIndex };
  }

  const poolIndex = start;
  return { picked: pool[poolIndex]!, poolIndex };
}

function buildPreset(
  scene: CoverScene,
  picked: PoolEntry,
  pool: PoolEntry[],
  poolIndex: number,
  seed: string
): ShortVideoCoverPreset {
  const bundledScene = SCENE_TO_BUNDLED[scene];
  const altEntries = pool.filter((p) => p.id !== picked.id);
  const bundledPrimary = bundledCoverAtIndex(bundledScene, poolIndex + hashStr(seed) % 2);
  const localFallback: string =
    LOCAL_COVER_BY_SCENE[bundledScene] ?? "/images/hot/life.svg";

  const proxyMain = proxyUnsplashUrl(picked.id);

  const fallbacks = [
    proxyMain,
    ...altEntries.map((p) => proxyUnsplashUrl(p.id)),
    ...altEntries.map((_, i) =>
      bundledCoverAtIndex(bundledScene, (poolIndex + i + 1) % Math.max(pool.length, 2))
    ),
    localFallback,
  ].filter((u, i, arr) => u && arr.indexOf(u) === i);

  return {
    style: picked.style,
    image: bundledPrimary,
    fallbacks,
    localFallback,
    filter: picked.filter,
    titleLines: [],
  };
}

export type TopicCoverResult = {
  type: CoverScene;
  image: string;
  fallbacks: string[];
  style: ShortVideoCoverStyle;
  filter: ShortVideoCoverPreset["filter"];
  localFallback: string;
  photoId: string;
};

export function getCoverImage(
  title: string,
  category: string,
  index: number
): TopicCoverResult {
  return getCoverByTitle(title, category, index);
}

export function getCoverByTitle(
  title: string,
  category: string,
  index: number
): TopicCoverResult {
  const scene = resolveCoverScene(title, category);
  const pool = poolForScene(scene);
  const { picked, poolIndex } = pickFromPool(pool, index);
  const seed = `${title}-${index}`;
  const preset = buildPreset(scene, picked, pool, poolIndex, seed);

  return {
    type: scene,
    photoId: picked.id,
    image: preset.image,
    fallbacks: preset.fallbacks,
    style: picked.style,
    filter: picked.filter,
    localFallback: preset.localFallback ?? "/images/hot/life.svg",
  };
}

export function getTopicCoverImage(
  title: string,
  category: string,
  seed: string
): Omit<TopicCoverResult, "photoId"> & { type: CoverScene } {
  const idx = hashStr(`${seed}-${title}`);
  const r = getCoverByTitle(title, category, idx);
  const { photoId: _p, ...rest } = r;
  void _p;
  return rest;
}

export function topicCoverPresetForItem(
  item: { id: string; title: string; category?: string; track?: string },
  listIndex: number,
  usedPhotoIds: Set<string>,
  prevPhotoId?: string | null
): ShortVideoCoverPreset & { photoId: string } {
  const label = item.category ?? item.track ?? "";
  const scene = resolveCoverScene(item.title, label);
  const pool = poolForScene(scene);
  const baseIndex = listIndex + hashStr(`${item.id}-${item.title}`) % pool.length;
  const { picked, poolIndex } = pickFromPool(pool, baseIndex, usedPhotoIds, prevPhotoId);

  usedPhotoIds.add(picked.id);

  const preset = buildPreset(scene, picked, pool, poolIndex, `${item.id}-${listIndex}-${item.title}`);
  return { ...preset, photoId: picked.id };
}

export function buildTopicPhotoLocalFallback(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [scene, pool] of Object.entries(coverImagePools)) {
    const bundledScene = SCENE_TO_BUNDLED[scene as CoverScene];
    pool.forEach((entry, i) => {
      map[entry.id] = `public${bundledCoverAtIndex(bundledScene, i)}`;
    });
  }
  return map;
}
