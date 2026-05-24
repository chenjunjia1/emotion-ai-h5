"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { readUserLocal } from "@/lib/client/persist-user";
import type { User } from "@/lib/types/v1";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { AiProfileEditor } from "@/components/profile/ai-profile-editor";
import { saveAiProfile } from "@/lib/onboarding/ai-profile";

export default function OnboardingPage() {
  const router = useRouter();
  const { user: ctxUser, tr, showToast } = useApp();
  const [user, setUser] = useState<User | null>(() => ctxUser ?? readUserLocal());

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

  const finish = (skipped: boolean) => {
    if (!user) return;
    if (skipped) {
      saveAiProfile(user.id, {
        nickname: tr("profileDefaultName"),
        avatarId: "pink-girl",
        trackIds: ["other"],
        completedAt: new Date().toISOString(),
      });
      showToast(tr("onboardingSkipped"));
      router.replace("/");
    }
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

        <div className="px-4 py-5">
          <AiProfileEditor
            mode="create"
            initialProfile={null}
            tr={tr}
            onInvalid={showToast}
            onSave={(profile) => {
              saveAiProfile(user.id, profile);
              showToast(tr("onboardingWelcome"));
              router.replace("/");
            }}
          />
          <p className="mt-3 text-center text-[10px] text-slate-400">{tr("onboardingCtaHint")}</p>
        </div>
      </div>
    </div>
  );
}
