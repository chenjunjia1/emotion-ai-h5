"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { apiAdminUploadImage } from "@/lib/client/server-api";
import { compressImageForUpload } from "@/lib/media/compress-image-file";
import { cn } from "@/lib/utils";

type Props = {
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  className?: string;
  label?: string;
};

function uploadErrorMessage(error?: string): string {
  switch (error) {
    case "unsupported_type":
      return "仅支持 JPG / PNG / WebP / GIF；iPhone 实况(HEIC)请先「拷贝」为 JPG 再传";
    case "body_too_large":
    case "invalid_form":
      return "图片过大，已尝试压缩仍失败，请换一张较小的图";
    case "forbidden":
      return "无上传权限，请用管理员账号登录";
    case "server_backend_disabled":
      return "服务端未启用，请检查 Supabase 配置";
    default:
      return error ? `上传失败：${error}` : "上传失败，请重试";
  }
}

export function AdminImageUpload({
  onUploaded,
  onError,
  className,
  label = "从相册上传",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (file: File | null) => {
    if (!file) return;

    const name = file.name.toLowerCase();
    const isImage =
      file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name);
    if (!isImage) {
      onError?.("请选择图片文件");
      return;
    }

    setUploading(true);
    try {
      let toUpload = file;
      try {
        toUpload = await compressImageForUpload(file);
      } catch (e) {
        const code = e instanceof Error ? e.message : "";
        if (code === "heic_unsupported") {
          onError?.("iPhone 实况(HEIC)请先在相册「存储为 JPG」或拷贝后再上传");
          return;
        }
        if (code === "decode_failed" || code === "compress_failed") {
          onError?.("无法读取该图片，请换 JPG/PNG 格式");
          return;
        }
      }

      const r = await apiAdminUploadImage(toUpload);
      if (r.url) {
        onUploaded(r.url);
        onError?.("");
      } else {
        onError?.(uploadErrorMessage(r.error));
      }
    } catch {
      onError?.("网络异常，上传失败");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/*"
        className="hidden"
        onChange={(e) => void onPick(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] px-4 py-2 text-xs font-bold text-white shadow-sm disabled:opacity-60"
      >
        {uploading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <ImagePlus size={16} />
        )}
        {uploading ? "上传中…" : label}
      </button>
      <span className="text-[10px] text-slate-400">自动压缩大图 · JPG/PNG/WebP</span>
    </div>
  );
}
