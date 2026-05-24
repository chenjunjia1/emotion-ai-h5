"use client";

import { AppProvider } from "@/contexts/app-context";
import { AppToast } from "@/components/app-toast";
import { OnboardingRedirect } from "@/components/auth/onboarding-redirect";
import { LoginModal } from "@/components/modals/login-modal";
import { PayModal } from "@/components/modals/pay-modal";
import { QuotaInsufficientModal } from "@/components/modals/quota-insufficient-modal";
import { LangHtmlSync } from "@/lib/i18n/lang-sync";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <LangHtmlSync />
      {children}
      <OnboardingRedirect />
      <AppToast />
      <LoginModal />
      <PayModal />
      <QuotaInsufficientModal />
    </AppProvider>
  );
}
