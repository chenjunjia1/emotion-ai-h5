/**
 * 将库内 /generated/ 或 localhost 封面迁移到 Supabase Storage（本地有文件时）
 * 用法: node scripts/migrate-hot-covers-to-supabase.mjs [--date=2026-05-26]
 */
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
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

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function resolveLocalPath(url) {
  if (!url) return null;
  let path = url;
  if (/^https?:\/\//i.test(url)) {
    try {
      const u = new URL(url);
      if (/supabase\.co/i.test(u.hostname)) return null;
      path = u.pathname;
    } catch {
      return null;
    }
  }
  if (!path.startsWith("/generated/")) return null;
  const file = join(process.cwd(), "public", path.replace(/^\//, ""));
  return existsSync(file) ? file : null;
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("需要 .env.local 中的 Supabase URL 与 SERVICE_ROLE_KEY");
  process.exit(1);
}

const dateArg = process.argv.find((a) => a.startsWith("--date="));
const dateKey = dateArg?.split("=")[1] ?? todayKey();
const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

const db = createClient(url, key);

const { data: row, error } = await db
  .from("xhs_hot_notes_daily")
  .select("notes, topic_date")
  .eq("topic_date", dateKey)
  .maybeSingle();

if (error || !row?.notes) {
  console.error("读取失败", error?.message ?? "无数据");
  process.exit(1);
}

const notes = row.notes;
let changed = 0;

for (const note of notes) {
  const img0 = note.images?.[0];
  const localFile = resolveLocalPath(img0);
  if (!localFile) continue;

  const buf = readFileSync(localFile);
  const base = localFile.split(/[/\\]/).pop();
  const objectKey = `hot-topics/covers/${base}`;
  const { error: upErr } = await db.storage.from(bucket).upload(objectKey, buf, {
    contentType: "image/jpeg",
    upsert: true,
  });
  if (upErr) {
    console.warn("上传失败", note.noteId, upErr.message);
    continue;
  }
  const { data: pub } = db.storage.from(bucket).getPublicUrl(objectKey);
  note.images = [pub.publicUrl, ...(note.images?.slice(1) ?? [])];
  changed++;
  console.log("OK", note.noteId?.slice(0, 12), pub.publicUrl);
}

if (!changed) {
  console.log("无需迁移（无本地文件或未匹配 /generated/）");
  process.exit(0);
}

const { error: saveErr } = await db
  .from("xhs_hot_notes_daily")
  .update({ notes, fetched_at: new Date().toISOString() })
  .eq("topic_date", dateKey);

if (saveErr) {
  console.error("保存失败", saveErr.message);
  process.exit(1);
}

console.log(`已更新 ${changed} 条封面 → Supabase，日期 ${dateKey}`);
