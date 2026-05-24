"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";
import { PartnerAvatarPicker } from "@/components/onboarding/partner-avatar-picker";
import {
  AI_PARTNER_AVATARS,
  ONBOARDING_TRACKS,
  type AiAvatarId,
  type OnboardingTrackId,
} from "@/lib/onboarding/options";
import type { AiProfile } from "@/lib/onboarding/ai-profile";
import { cn } from "@/lib/utils";
import type { I18nKey } from "@/lib/i18n";

const NICKNAME_MAX = 12;

type Tr = (key: I18nKey) => string;

export function AiProfileEditor({
  initialProfile,
  mode,
  tr,
  onSave,
  onInvalid,
}: {
  initialProfile: AiProfile | null;
  mode: "create" | "edit";
  tr: Tr;
  onSave: (profile: AiProfile) => void;
  onInvalid: (message: string) => void;
}) {
  const [nickname, setNickname] = useState(initialProfile?.nickname ?? "");
  const [avatarId, setAvatarId] = useState<AiAvatarId>(
    initialProfile?.avatarId ?? "pink-girl"
  );
  const [trackId, setTrackId] = useState<OnboardingTrackId>(
    initialProfile?.trackIds?.[0] ?? "love"
  );

  const avatar = useMemo(
    () => AI_PARTNER_AVATARS.find((a) => a.id === avatarId) ?? AI_PARTNER_AVATARS[0],
    [avatarId]
  );

  const displayName = nickname.trim() || avatar.defaultName;

  useEffect(() => {
    if (mode !== "create" || initialProfile?.nickname) return;
    setNickname((prev) => {
      const isDefault = AI_PARTNER_AVATARS.some((a) => a.defaultName === prev);
      if (!prev.trim() || isDefault) return avatar.defaultName;
      return prev;
    });
  }, [avatarId, avatar.defaultName, mode, initialProfile?.nickname]);

  const handleSave = () => {
    if (!nickname.trim()) {
      onInvalid(tr("onboardingNicknameRequired"));
      return;
    }
    if (!trackId) {
      onInvalid(tr("onboardingTrackRequired"));
      return;
    }
    onSave({
      nickname: displayName,
      avatarId,
      trackIds: [trackId],
      completedAt: initialProfile?.completedAt ?? new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-black text-slate-800">{tr("onboardingNicknameTitle")}</h2>
        <p className="mt-0.5 text-[11px] text-slate-500">{tr("onboardingNicknameSub")}</p>
        <label className="mt-3 block text-[11px] font-bold text-slate-600">
          {tr("onboardingNicknameLabel")}
          <div className="relative mt-1.5">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value.slice(0, NICKNAME_MAX))}
              placeholder={tr("onboardingNicknamePlaceholder")}
              className="w-full rounded-2xl border-0 bg-[#FFF8F5] px-4 py-3.5 text-sm font-medium text-slate-800 ring-2 ring-orange-100/80 outline-none transition focus:ring-[#FF7AAE]/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              {nickname.length}/{NICKNAME_MAX}
            </span>
          </div>
        </label>
      </div>

      <div>
        <h2 className="text-sm font-black text-slate-800">{tr("onboardingTracksTitle")}</h2>
        <p className="mt-0.5 text-[10px] text-slate-500">{tr("onboardingTracksSub")}</p>
        <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label={tr("onboardingTracksTitle")}>
          {ONBOARDING_TRACKS.map((t) => {
            const selected = trackId === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTrackId(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-[12px] font-bold transition active:scale-[0.98]",
                  selected
                    ? "bg-gradient-to-r from-[#FFF0F5] to-orange-50 text-[#FF5C8A] ring-2 ring-[#FF7AAE]/35 shadow-sm"
                    : "bg-[#FFFBF8] text-slate-600 ring-1 ring-orange-100/80"
                )}
              >
                <span className="text-lg">{t.emoji}</span>
                <span className="min-w-0 flex-1">{t.label}</span>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition",
                    selected ? "border-[#FF7AAE] bg-[#FF7AAE]" : "border-slate-300 bg-white"
                  )}
                  aria-hidden
                >
                  {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-1">
        <h2 className="text-sm font-black text-slate-800">{tr("onboardingAvatarTitle")}</h2>
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{tr("onboardingAvatarSub")}</p>
        <div className="mt-4">
          <PartnerAvatarPicker value={avatarId} onChange={setAvatarId} />
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-500">
          <span className="font-bold text-slate-700">{avatar.name}</span>
          <span className="mx-1 text-slate-300">·</span>
          {avatar.role}
        </p>
        <p className="mt-0.5 text-center text-[10px] leading-relaxed text-slate-400">{avatar.desc}</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-orange-50/90 p-3.5 ring-1 ring-[#FF7AAE]/15">
        <div className="flex items-center gap-3">
          <PartnerAvatarArt id={avatarId} size="md" className="h-12 w-12 shrink-0 ring-2 ring-white" />
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-[#FF7AAE]">{tr("onboardingPreviewTitle")}</p>
            <p className="mt-0.5 text-[10px] text-slate-500">
              {avatar.name} · {avatar.role}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-slate-700">
          {tr("onboardingPreviewGreeting")
            .replace("{name}", displayName)
            .replace("{emoji}", avatar.previewEmoji)}
        </p>
        <p className="mt-2 text-right text-[11px] font-bold text-slate-500">——{displayName}</p>
      </div>

      <button
        type="button"
        onClick={handleSave}
        className="banner-cta-breathe flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] py-4 text-white shadow-[0_10px_28px_rgba(255,107,107,0.35)] active:scale-[0.98]"
      >
        <span className="flex items-center gap-2 text-sm font-black">
          <Sparkles size={18} />
          {mode === "edit" ? tr("profileEditSave") : tr("onboardingCta")}
        </span>
      </button>
    </div>
  );
}
