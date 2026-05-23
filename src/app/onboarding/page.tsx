"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { readUserLocal } from "@/lib/client/persist-user";
import type { User } from "@/lib/types/v1";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";
import { PartnerAvatarPicker } from "@/components/onboarding/partner-avatar-picker";
import {
  AI_PARTNER_AVATARS,
  ONBOARDING_TRACKS,
  type AiAvatarId,
  type OnboardingTrackId,
} from "@/lib/onboarding/options";
import { saveAiProfile } from "@/lib/onboarding/ai-profile";
import { cn } from "@/lib/utils";

const NICKNAME_MAX = 12;

export default function OnboardingPage() {
  const router = useRouter();
  const { user: ctxUser, tr, showToast } = useApp();
  const [user, setUser] = useState<User | null>(() => ctxUser ?? readUserLocal());

  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState<AiAvatarId>("pink-girl");
  const [trackId, setTrackId] = useState<OnboardingTrackId>("love");

  const avatar = useMemo(
    () => AI_PARTNER_AVATARS.find((a) => a.id === avatarId) ?? AI_PARTNER_AVATARS[0],
    [avatarId]
  );

  const displayName = nickname.trim() || avatar.defaultName;

  useEffect(() => {
    if (ctxUser) setUser(ctxUser);
    else if (!user) {
      const cached = readUserLocal();
      if (cached) setUser(cached);
    }
  }, [ctxUser, user]);

  useEffect(() => {
    if (ctxUser !== null || user !== null) return;
    const t = window.setTimeout(() => {
      if (!readUserLocal()) router.replace("/");
    }, 800);
    return () => window.clearTimeout(t);
  }, [ctxUser, user, router]);

  useEffect(() => {
    setNickname((prev) => {
      const isDefault = AI_PARTNER_AVATARS.some((a) => a.defaultName === prev);
      if (!prev.trim() || isDefault) return avatar.defaultName;
      return prev;
    });
  }, [avatarId, avatar.defaultName]);

  const finish = (skipped: boolean) => {
    if (!user) return;
    if (!skipped && !nickname.trim()) {
      showToast(tr("onboardingNicknameRequired"));
      return;
    }
    if (!skipped && !trackId) {
      showToast(tr("onboardingTrackRequired"));
      return;
    }

    saveAiProfile(user.id, {
      nickname: displayName,
      avatarId,
      trackIds: [skipped ? "other" : trackId],
      completedAt: new Date().toISOString(),
    });
    showToast(skipped ? tr("onboardingSkipped") : tr("onboardingWelcome"));
    router.replace("/");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFF7F0] text-sm text-slate-500">
        {tr("loading")}
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gradient-to-b from-[#FFF7F0] via-[#FFF0F5] to-[#FFF7F0] px-4 pb-10 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <p className="mb-1 text-center text-[11px] font-bold text-[#FF7AAE]">{tr("onboardingStepLabel")}</p>
      <h1 className="text-center text-xl font-black tracking-tight text-slate-800">
        {tr("onboardingPageTitle")}
      </h1>
      <p className="mt-1 text-center text-xs leading-relaxed text-slate-500">
        {tr("onboardingPageDesc")}
      </p>

      <div className="mt-5 overflow-hidden rounded-[28px] bg-white shadow-[0_16px_48px_rgba(255,122,174,0.12)] ring-1 ring-[#FF7AAE]/15">
        <div className="flex items-center justify-between border-b border-orange-50 px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-slate-600 active:scale-95"
            aria-label={tr("onboardingBack")}
          >
            <ArrowLeft size={18} />
          </button>
          <OnboardingProgress step={2} />
          <button
            type="button"
            onClick={() => finish(true)}
            className="text-xs font-bold text-slate-400 active:text-[#FF7AAE]"
          >
            {tr("onboardingSkip")}
          </button>
        </div>

        <div className="space-y-5 px-4 py-5">
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
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              {tr("onboardingAvatarSub")}
            </p>
            <div className="mt-4">
              <PartnerAvatarPicker value={avatarId} onChange={setAvatarId} />
            </div>
            <p className="mt-3 text-center text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">{avatar.name}</span>
              <span className="mx-1 text-slate-300">·</span>
              {avatar.role}
            </p>
            <p className="mt-0.5 text-center text-[10px] leading-relaxed text-slate-400">
              {avatar.desc}
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#FFF0F5] to-orange-50/90 p-3.5 ring-1 ring-[#FF7AAE]/15">
            <div className="flex items-center gap-3">
              <PartnerAvatarArt
                id={avatarId}
                size="md"
                className="h-12 w-12 shrink-0 ring-2 ring-white"
              />
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
            onClick={() => finish(false)}
            className="banner-cta-breathe flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] py-4 text-white shadow-[0_10px_28px_rgba(255,107,107,0.35)] active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-sm font-black">
              <Sparkles size={18} />
              {tr("onboardingCta")}
            </span>
          </button>
          <p className="text-center text-[10px] text-slate-400">{tr("onboardingCtaHint")}</p>
        </div>
      </div>
    </div>
  );
}
