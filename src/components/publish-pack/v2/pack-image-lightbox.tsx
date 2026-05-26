"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, X, ZoomIn } from "lucide-react";

export function PackImageLightbox({
  src,
  alt,
  label,
  onClose,
  onSaved,
}: {
  src: string;
  alt: string;
  label?: string;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [saving, setSaving] = useState(false);

  const saveImage = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `publish-pack-${Date.now()}.jpg`;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      onSaved?.();
    } catch {
      window.open(src, "_blank", "noopener,noreferrer");
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }, [onSaved, saving, src]);

  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onKey]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal
      aria-label="查看大图"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-lg sm:right-5 sm:top-5"
        aria-label="关闭"
      >
        <X size={22} />
      </button>
      <div
        className="flex max-h-full max-w-full flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {label && (
          <span className="mb-2 text-sm font-bold text-white/90">{label}</span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="max-h-[min(78vh,900px)] max-w-[min(96vw,32rem)] rounded-xl object-contain shadow-2xl"
        />
        <button
          type="button"
          disabled={saving}
          onClick={() => void saveImage()}
          className="mt-4 flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-black text-pink-600 shadow-lg disabled:opacity-60"
        >
          <Download size={16} />
          {saving ? "保存中…" : "保存图片"}
        </button>
        <p className="mt-2 text-xs text-white/60">点击空白处或 Esc 关闭</p>
      </div>
    </div>
  );
}

/** 列表里只显示紧凑缩略图，完整图点开后在 Lightbox 查看 */
export function PackImageCard({
  src,
  alt,
  label,
  tall,
  onOpen,
}: {
  src: string;
  alt: string;
  label: string;
  /** 4 张图时的封面横条略高一点 */
  tall?: boolean;
  onOpen: () => void;
}) {
  const height = tall ? "h-48" : "h-40";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group relative w-full overflow-hidden rounded-2xl bg-[#ebe6df] ring-1 ring-pink-100/80 transition hover:ring-2 hover:ring-pink-400 ${height}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-[center_72%]"
        loading="lazy"
      />
      <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2.5 py-0.5 text-[11px] font-black text-pink-500 shadow-sm">
        {label}
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
        <span className="flex scale-90 items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-bold text-white opacity-90 sm:scale-100 sm:opacity-0 sm:group-hover:opacity-100">
          <ZoomIn size={14} />
          放大查看
        </span>
      </span>
    </button>
  );
}
