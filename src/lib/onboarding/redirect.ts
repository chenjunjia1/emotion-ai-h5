import { hasCompletedAiProfile } from "@/lib/onboarding/ai-profile";

export function needsAiProfileOnboarding(userId: string): boolean {
  return !hasCompletedAiProfile(userId);
}

/** 硬跳转创建身份页，避免留在 /profile?pricing=1 等带参路由 */
export function redirectToOnboarding(): void {
  if (typeof window === "undefined") return;
  window.location.replace("/onboarding");
}
