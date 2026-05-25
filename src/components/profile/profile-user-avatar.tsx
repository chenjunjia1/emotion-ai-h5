"use client";

import { UserRound } from "lucide-react";
import { PartnerAvatarArt } from "@/components/onboarding/partner-avatar-art";
import { loadAiProfile } from "@/lib/onboarding/ai-profile";
import { getPartnerAvatar } from "@/lib/onboarding/options";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** 个人中心头像：有 AI 身份则展示所选助手形象 */
export function ProfileUserAvatar({
  userId,
  className,
}: {
  userId: string;
  className?: string;
}) {
  const profile = loadAiProfile(userId);

  if (profile?.avatarId) {
    return (
      <PartnerAvatarArt
        id={profile.avatarId}
        className={cn(
          "h-14 w-14 shrink-0 shadow-[0_4px_14px_rgba(255,122,174,0.25)] ring-2 ring-[#FF7AAE]/35",
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-md",
        theme.primary,
        className
      )}
    >
      <UserRound size={28} />
    </div>
  );
}

export function profileDisplayName(userId: string, fallback: string): string {
  return loadAiProfile(userId)?.nickname?.trim() || fallback;
}

export function profileCompanionMeta(userId: string) {
  const profile = loadAiProfile(userId);
  if (!profile?.avatarId) return null;
  const avatar = getPartnerAvatar(profile.avatarId);
  return {
    nickname: profile.nickname?.trim() || avatar.defaultName,
    role: avatar.role,
    partnerName: avatar.name,
  };
}
