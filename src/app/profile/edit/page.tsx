"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LegalShell } from "@/components/layout/legal-shell";
import { AiProfileEditor } from "@/components/profile/ai-profile-editor";
import { Card, CardContent } from "@/components/ui/card";
import { useApp } from "@/contexts/app-context";
import { loadAiProfile, saveAiProfile } from "@/lib/onboarding/ai-profile";

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
    <LegalShell title={tr("profileEditPageTitle")}>
      <p className="mb-4 text-xs leading-relaxed text-slate-500">{tr("profileEditPageDesc")}</p>
      <Card>
        <CardContent>
          <AiProfileEditor
            mode="edit"
            initialProfile={initialProfile}
            tr={tr}
            onInvalid={showToast}
            onSave={(profile) => {
              saveAiProfile(user.id, profile);
              showToast(tr("profileEditSaved"));
              router.push("/profile");
            }}
          />
        </CardContent>
      </Card>
    </LegalShell>
  );
}
