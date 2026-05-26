const MAX_EDGE = 1920;
const TARGET_BYTES = 9 * 1024 * 1024;
const JPEG_QUALITIES = [0.92, 0.85, 0.78, 0.7, 0.62];

/** 上传前压缩大图，避免超过 Next 默认 10MB 请求体限制 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined") return file;

  const type = (file.type || "").toLowerCase();
  if (type === "image/gif") return file;
  if (file.size <= TARGET_BYTES && (type === "image/jpeg" || type === "image/png")) {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    if (type === "image/heic" || file.name.toLowerCase().endsWith(".heic")) {
      throw new Error("heic_unsupported");
    }
    throw new Error("decode_failed");
  }

  let w = bitmap.width;
  let h = bitmap.height;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  w = Math.max(1, Math.round(w * scale));
  h = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("decode_failed");
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  let lastBlob: Blob | null = null;
  for (let i = 0; i < JPEG_QUALITIES.length; i++) {
    const q = JPEG_QUALITIES[i]!;
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", q);
    });
    if (!blob) continue;
    lastBlob = blob;
    if (blob.size <= TARGET_BYTES) break;
  }

  if (!lastBlob) throw new Error("compress_failed");

  const base =
    file.name.replace(/\.[^.]+$/, "") || "cover";
  return new File([lastBlob], `${base}.jpg`, { type: "image/jpeg" });
}
