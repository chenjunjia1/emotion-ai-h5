/** 根据文件头识别图片 MIME（浏览器未填 type 或 HEIC 等场景） */
export function sniffImageMime(buffer: ArrayBuffer | Uint8Array): string | null {
  const b = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  if (b.length < 12) return null;

  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return "image/gif";
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return "image/webp";
  }

  const ftyp = String.fromCharCode(b[4]!, b[5]!, b[6]!, b[7]!);
  if (ftyp === "ftyp") {
    const brand = String.fromCharCode(b[8]!, b[9]!, b[10]!, b[11]!);
    if (/heic|heix|mif1|msf1/i.test(brand)) return "image/heic";
  }

  return null;
}

export function isSupportedAdminImageMime(mime: string): boolean {
  return ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
    mime.toLowerCase().split(";")[0]!
  );
}
