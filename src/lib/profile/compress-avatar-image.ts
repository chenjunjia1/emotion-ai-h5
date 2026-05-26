const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_EDGE = 320;
const JPEG_QUALITY = 0.82;

export type AvatarCompressError = "invalid_type" | "too_large" | "decode_failed";

export async function compressAvatarImageFile(
  file: File
): Promise<{ dataUrl: string } | { error: AvatarCompressError }> {
  if (!file.type.startsWith("image/")) {
    return { error: "invalid_type" };
  }
  if (file.size > MAX_FILE_BYTES) {
    return { error: "too_large" };
  }

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height, 1));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return { error: "decode_failed" };
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    let quality = JPEG_QUALITY;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrl.length > 280_000 && quality > 0.5) {
      quality -= 0.08;
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }
    return { dataUrl };
  } catch {
    return { error: "decode_failed" };
  }
}
