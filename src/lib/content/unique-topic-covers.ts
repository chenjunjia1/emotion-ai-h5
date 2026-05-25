import type { ShortVideoCoverPreset } from "@/lib/content/short-video-covers";
import { topicCoverPresetForItem } from "@/lib/content/topic-cover-match";

/**
 * 为列表内每条热点分配封面：title 二级场景 + 池内轮换 + 相邻不重复
 */
export function assignUniqueCoverPresets(
  items: { id: string; title: string; category?: string; track?: string }[]
): Map<string, ShortVideoCoverPreset> {
  const usedPhotoIds = new Set<string>();
  const map = new Map<string, ShortVideoCoverPreset>();
  let prevPhotoId: string | null = null;

  items.forEach((item, listIndex) => {
    const { photoId, ...preset } = topicCoverPresetForItem(
      item,
      listIndex,
      usedPhotoIds,
      prevPhotoId
    );
    prevPhotoId = photoId;
    map.set(item.id, preset);
  });

  return map;
}

/** 单条封面（非列表场景） */
export function coverPresetForListItem(
  item: { id: string; title: string; category?: string; track?: string }
): ShortVideoCoverPreset {
  const used = new Set<string>();
  const { photoId: _p, ...preset } = topicCoverPresetForItem(item, 0, used);
  void _p;
  return preset;
}

export {
  getCoverImage,
  getCoverByTitle,
  getTopicCoverImage,
  resolveCoverScene,
  resolveCoverSceneFromTitle,
  resolveTopicCoverType,
} from "@/lib/content/topic-cover-match";
