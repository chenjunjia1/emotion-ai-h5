"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LegalShell } from "@/components/layout/legal-shell";
import { AiProfileEditor } from "@/components/profile/ai-profile-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { loadAiProfile, saveAiProfile, type AiProfile } from "@/lib/onboarding/ai-profile";
import { AI_PARTNER_AVATARS } from "@/lib/onboarding/options";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";

export default function ProfileEditPage() {
  const router = useRouter();
  const { user, tr, showToast, setLoginOpen } = useApp();
  const [ready, setReady] = useState(false);
  const [initialProfile, setInitialProfile] = useState(
    () => (user ? loadAiProfile(user.id) : null)
  );

  useEffect(() => {
    if (!user) return;
    setInitialProfile(loadAiProfile(user.id));
    setReady(true);
  }, [user]);

  if (!user) {
    return (
      <LegalShell title={tr("profileEditPageTitle")}>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-sm text-slate-600">{tr("pleaseLogin")}</p>
            <button
              type="button"
              onClick={() => setLoginOpen(true)}
              className="mt-4 rounded-2xl bg-gradient-to-r from-[#FF6B6B] via-[#FF7AAE] to-[#FFB347] px-6 py-2.5 text-sm font-bold text-white"
            >
              {tr("loginTitle")}
            </button>
          </CardContent>
        </Card>
      </LegalShell>
    );
  }

  if (!ready) {
    return (
      <LegalShell title={tr("profileEditPageTitle")}>
        <p className="py-10 text-center text-sm text-slate-500">{tr("loading")}</p>
      </LegalShell>
    );
  }

  return (
    <LegalShell
      variant="profile"
      title={tr("profileEditPageTitle")}
      subtitle={tr("profileEditPageDesc")}
    >
      <ProfileEditPreview profile={initialProfile} />
      <div className="mt-3 overflow-hidden rounded-[22px] bg-white p-4 shadow-[0_6px_28px_rgba(255,120,150,0.08)] ring-1 ring-[#FFE8F0]">
        <AiProfileEditor
          mode="edit"
          initialProfile={initialProfile}
          tr={tr}
          onInvalid={showToast}
          onSave={(profile) => {
            saveAiProfile(user.id, profile);
            showToast(tr("profileEditSaved"));
            router.refresh();
            router.push("/profile");
          }}
        />
      </div>
    </LegalShell>
  );
}

function ProfileEditPreview({ profile }: { profile: AiProfile | null }) {
  const avatar =
    AI_PARTNER_AVATARS.find((a) => a.id === profile?.avatarId) ?? AI_PARTNER_AVATARS[0];
  const name = profile?.nickname?.trim() || avatar.defaultName;

  return (
    <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#FF4F8B]/10 via-white to-[#FF9A4D]/10 p-3.5 ring-1 ring-[#FFE8F0]">
      <div className="flex items-center gap-3">
        {profile?.customAvatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.customAvatarUrl}
            alt=""
            className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-2 ring-white shadow-md"
          />
        ) : (
          <PartnerAvatarArt
            id={profile?.avatarId ?? "pink-girl"}
            size="md"
            className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-white shadow-md"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-[#FF4F8B]">当前陪跑形象</p>
          <p className="mt-0.5 truncate text-[18px] font-black text-[#1F2937]">{name}</p>
          <p className="mt-0.5 text-[10px] text-[#9CA3AF]">
            {avatar.name} · 保存后「我的」页即时更新
          </p>
        </div>
      </div>
    </div>
  );
}
