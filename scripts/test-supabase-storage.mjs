import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const p = resolve(process.cwd(), ".env.local");
  if (!existsSync(p)) return;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("missing supabase env");
  process.exit(1);
}

const db = createClient(url, key);
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

const { data: buckets, error: listErr } = await db.storage.listBuckets();
console.log("listBuckets:", listErr?.message ?? "ok", buckets?.map((b) => b.name));

const { error: createErr } = await db.storage.createBucket(bucket, {
  public: true,
  fileSizeLimit: 15 * 1024 * 1024,
});
console.log("createBucket:", createErr?.message ?? "ok");

const sample = resolve(
  "public/generated/hot-topics-covers-1779795647990-768c4c7534094ec6.jpg"
);
const buf = readFileSync(sample);
const objectKey = `hot-topics/covers/smoke-${Date.now()}.jpg`;
const { error: uploadErr } = await db.storage.from(bucket).upload(objectKey, buf, {
  contentType: "image/jpeg",
  upsert: true,
});
console.log("upload:", uploadErr?.message ?? "ok");
if (!uploadErr) {
  const { data } = db.storage.from(bucket).getPublicUrl(objectKey);
  console.log("publicUrl:", data.publicUrl);
}
