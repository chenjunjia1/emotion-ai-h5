"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { apiAdminUploadImage } from "@/lib/client/server-api";
import { cn } from "@/lib/utils";

type Props = {
  onUploaded: (url: string) => void;
  onError?: (message: string) => void;
  className?: string;
  label?: string;
};

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
    if (!file.type.startsWith("image/")) {
      onError?.("请选择图片文件");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      onError?.("图片不能超过 8MB");
      return;
    }

    setUploading(true);
    try {
      const r = await apiAdminUploadImage(file);
      if (r.url) {
        onUploaded(r.url);
        onError?.("");
      } else {
        const msg =
          r.error === "image_too_large"
            ? "图片过大（最大 8MB）"
            : r.error === "unsupported_type"
              ? "仅支持 JPG / PNG / WebP / GIF"
              : r.error === "forbidden"
                ? "无上传权限"
                : "上传失败";
        onError?.(msg);
      }
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
        accept="image/*"
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
      <span className="text-[10px] text-slate-400">JPG/PNG/WebP · 最大 8MB</span>
    </div>
  );
}
