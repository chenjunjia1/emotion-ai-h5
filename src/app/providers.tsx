"use client";

import dynamic from "next/dynamic";
import { AppProvider } from "@/contexts/app-context";
import { AppToast } from "@/components/app-toast";
import { OnboardingRedirect } from "@/components/auth/onboarding-redirect";
import { LangHtmlSync } from "@/lib/i18n/lang-sync";

const LoginModal = dynamic(
  () =>
    import("@/components/modals/login-modal").then((m) => ({ default: m.LoginModal })),
  { ssr: false }
);
const PayModal = dynamic(
  () => import("@/components/modals/pay-modal").then((m) => ({ default: m.PayModal })),
  { ssr: false }
);
const QuotaInsufficientModal = dynamic(
  () =>
    import("@/components/modals/quota-insufficient-modal").then((m) => ({
      default: m.QuotaInsufficientModal,
    })),
  { ssr: false }
);

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
