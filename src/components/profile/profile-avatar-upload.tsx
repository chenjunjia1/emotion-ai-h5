"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";
import type { AiAvatarId } from "@/lib/onboarding/options";
import { compressAvatarImageFile } from "@/lib/profile/compress-avatar-image";
import type { I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

export function ProfileAvatarUpload({
  avatarId,
  customAvatarUrl,
  onCustomAvatarChange,
  onClearCustom,
  tr,
  onError,
}: {
  avatarId: AiAvatarId;
  customAvatarUrl?: string;
  onCustomAvatarChange: (dataUrl: string) => void;
  onClearCustom: () => void;
  tr: Tr;
  onError: (message: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    const result = await compressAvatarImageFile(file);
    setUploading(false);
    if ("error" in result) {
      if (result.error === "invalid_type") onError(tr("profileAvatarUploadInvalid"));
      else if (result.error === "too_large") onError(tr("profileAvatarUploadTooLarge"));
      else onError(tr("profileAvatarUploadFailed"));
      return;
    }
    onCustomAvatarChange(result.dataUrl);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_6px_20px_rgba(255,122,174,0.22)] ring-[3px] ring-[#FF7AAE]/30 transition active:scale-[0.98]",
            uploading && "opacity-70"
          )}
          aria-label={tr("profileAvatarUploadBtn")}
        >
          {customAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={customAvatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <PartnerAvatarArt id={avatarId} className="h-full w-full ring-0" size="lg" />
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-0 transition hover:opacity-100">
            {uploading ? (
              <Loader2 size={22} className="animate-spin text-white" />
            ) : (
              <Camera size={22} className="text-white drop-shadow" strokeWidth={2.2} />
            )}
          </span>
        </button>

        {customAvatarUrl ? (
          <button
            type="button"
            onClick={onClearCustom}
            className="absolute -right-0.5 -top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-slate-700/90 text-white shadow ring-2 ring-white active:scale-95"
            aria-label={tr("profileAvatarUploadClear")}
          >
            <X size={12} strokeWidth={2.5} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          void handleFile(f);
          e.target.value = "";
        }}
      />

      <p className="mt-2 text-center text-[11px] font-bold text-[#FF7AAE]">
        {tr("profileAvatarUploadBtn")}
      </p>
      <p className="mt-0.5 max-w-[240px] text-center text-[10px] leading-snug text-slate-400">
        {tr("profileAvatarUploadHint")}
      </p>
    </div>
  );
}
