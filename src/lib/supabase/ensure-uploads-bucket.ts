import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_ENSURED = new Set<string>();

/** 首次上传前确保公开桶存在（需 service_role） */
export async function ensureSupabaseUploadsBucket(
  db: SupabaseClient,
  bucket: string
): Promise<void> {
  if (BUCKET_ENSURED.has(bucket)) return;

  const { data: buckets, error: listErr } = await db.storage.listBuckets();
  if (listErr) {
    console.warn("[storage] listBuckets:", listErr.message);
  } else {
    const existing = buckets?.find((b) => b.name === bucket || b.id === bucket);
    if (existing) {
      if (!existing.public) {
        const { error: updateErr } = await db.storage.updateBucket(bucket, {
          public: true,
        });
        if (updateErr) {
          console.warn("[storage] updateBucket public:", updateErr.message);
        }
      }
      BUCKET_ENSURED.add(bucket);
      return;
    }
  }

  const { error: createErr } = await db.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 15 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (createErr) {
    const msg = createErr.message.toLowerCase();
    if (!msg.includes("already exists") && !msg.includes("duplicate")) {
      throw new Error(`supabase_bucket:${createErr.message}`);
    }
  }

  BUCKET_ENSURED.add(bucket);
}
