/** 发布包深链 */

export function buildPublishPackQuickHref(topic?: string): string {
  const q = new URLSearchParams({ mode: "quick" });
  const t = topic?.trim();
  if (t) q.set("topic", t.slice(0, 120));
  return `/publish-pack?${q.toString()}`;
}

export function buildPublishPackAdvancedHref(topic?: string, imageCount = 1): string {
  const q = new URLSearchParams({ mode: "advanced", imageCount: String(imageCount) });
  const t = topic?.trim();
  if (t) q.set("topic", t.slice(0, 120));
  return `/publish-pack?${q.toString()}`;
}
