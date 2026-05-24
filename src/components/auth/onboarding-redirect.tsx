"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/contexts/app-context";
import {
  needsAiProfileOnboarding,
  redirectToOnboarding,
} from "@/lib/onboarding/redirect";

const SKIP_PATHS = ["/onboarding", "/profile/edit", "/agreement", "/pay"];

/** 已手机号登录且未完成 AI 身份时，进入 onboarding（不关登录弹窗不触发） */
export function OnboardingRedirect() {
  const { user, loginOpen } = useApp();
  const pathname = usePathname();

  useEffect(() => {
    if (!user || loginOpen) return;
    if (SKIP_PATHS.some((p) => pathname.startsWith(p))) return;
    if (needsAiProfileOnboarding(user.id)) {
      redirectToOnboarding();
    }
  }, [user, loginOpen, pathname]);

  return null;
}
