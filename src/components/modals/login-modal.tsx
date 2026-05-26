"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { readUserLocal } from "@/lib/client/persist-user";
import { isClientServerMode } from "@/lib/client/server-api";
import { needsAiProfileOnboarding } from "@/lib/onboarding/redirect";
import { PILOT_LOGIN_MOBILE, isPilotLoginMobile } from "@/lib/auth/login-allowlist";
import { MOCK_SMS_CODE } from "@/lib/constants/v1";
import { isLoginCodePrefillAllowedClient } from "@/lib/client/dev-auth";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { theme } from "@/lib/theme";
import { LoginTrustFooter } from "@/components/auth/login-trust-footer";
import { cn } from "@/lib/utils";

const SMS_COOLDOWN_SEC = 60;

export function LoginModal() {
  const router = useRouter();
  const { loginOpen, setLoginOpen, sendCode, login, showToast, tr } = useApp();
  const serverMode = isClientServerMode();
  const [mobile, setMobile] = useState(PILOT_LOGIN_MOBILE);
  const allowPrefill =
    isLoginCodePrefillAllowedClient() || isPilotLoginMobile(mobile.trim());
  const [code, setCode] = useState(MOCK_SMS_CODE);
  const [agreed, setAgreed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [codeErrorMsg, setCodeErrorMsg] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [enteringOnboarding, setEnteringOnboarding] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!loginOpen && !enteringOnboarding) {
      setCodeErrorMsg("");
      return;
    }
    if (loginOpen) {
      setCode(allowPrefill ? MOCK_SMS_CODE : "");
      router.prefetch("/onboarding");
    }
  }, [loginOpen, enteringOnboarding, allowPrefill, router]);

  if (enteringOnboarding) {
    return (
      <div className="fixed inset-0 z-[95] flex flex-col items-center justify-center bg-[#FFF7F0]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF7AAE] border-t-transparent" />
        <p className="mt-4 text-sm font-bold text-slate-700">{tr("onboardingEntering")}</p>
      </div>
    );
  }

  if (!loginOpen) return null;

  const handleLogin = async () => {
    if (!agreed) {
      showToast(tr("loginAgreeRequired"));
      return;
    }
    if (!isPilotLoginMobile(mobile.trim())) {
      showToast(tr("loginMobileNotAllowed"));
      return;
    }
    setCodeErrorMsg("");
    setLoggingIn(true);
    try {
      const result = await login(mobile, code);
      if (!result.ok) {
        setCodeErrorMsg(result.message ?? tr("codeError"));
        return;
      }
      const cached = readUserLocal();
      const needsOnboarding =
        result.needsOnboarding ??
        (cached ? needsAiProfileOnboarding(cached.id) : true);
      if (needsOnboarding) {
        setEnteringOnboarding(true);
        setLoginOpen(false);
        return;
      }
      setLoginOpen(false);
    } finally {
      setLoggingIn(false);
    }
  };

  const handleSendCode = async () => {
    if (cooldown > 0 || sending) return;
    const m = mobile.trim();
    if (!/^1\d{10}$/.test(m)) {
      showToast(tr("mobileInvalid"));
      return;
    }
    if (!isPilotLoginMobile(m)) {
      showToast(tr("loginMobileNotAllowed"));
      return;
    }
    setCodeErrorMsg("");
    setSending(true);
    try {
      const ok = await sendCode(m);
      if (ok) setCooldown(SMS_COOLDOWN_SEC);
    } finally {
      setSending(false);
    }
  };

  const codeButtonLabel =
    cooldown > 0
      ? `${cooldown}${tr("getCodeCooldown")}`
      : sending
        ? "..."
        : tr("getCode");

  const closeModal = () => {
    setEnteringOnboarding(false);
    setLoginOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="login-modal-enter max-h-[min(92vh,640px)] w-full max-w-sm overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-[#FF7AAE]/10">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">{tr("loginTitle")}</div>
            <div className="mt-1 text-sm text-slate-500">
              {serverMode && process.env.NODE_ENV === "development"
                ? tr("loginSmsHintDev")
                : serverMode
                  ? tr("loginSmsHint")
                  : tr("loginMockHint")}
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className={cn("rounded-2xl p-2", theme.softOrange)}
          >
            <X size={18} className="text-orange-600" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label={tr("mobile")}>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              placeholder={tr("mobilePlaceholder")}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 11))}
              className={cn(
                "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100",
                theme.border
              )}
            />
          </Field>
          <Field label={tr("code")}>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder={tr("codePlaceholder")}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                  if (codeErrorMsg) setCodeErrorMsg("");
                }}
                className={cn(
                  "min-w-0 flex-1 rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-orange-300",
                  codeErrorMsg ? "border-rose-400 ring-2 ring-rose-100" : theme.border
                )}
              />
              <Button
                variant="secondary"
                className="min-w-[7.5rem] shrink-0 whitespace-nowrap"
                disabled={cooldown > 0 || sending}
                onClick={() => void handleSendCode()}
              >
                {codeButtonLabel}
              </Button>
            </div>
            {codeErrorMsg ? (
              <p className="mt-2 text-xs font-medium text-rose-600">{codeErrorMsg}</p>
            ) : null}
          </Field>
          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-slate-600">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-orange-200 text-orange-500"
            />
            <span>
              {tr("loginAgreePrefix")}{" "}
              <Link
                href="/agreement/user"
                className="font-bold text-orange-600"
                onClick={closeModal}
              >
                {tr("loginAgreeUser")}
              </Link>{" "}
              {tr("loginAgreeAnd")}{" "}
              <Link
                href="/agreement/privacy"
                className="font-bold text-orange-600"
                onClick={closeModal}
              >
                {tr("loginAgreePrivacy")}
              </Link>
            </span>
          </label>
          <div className={cn("rounded-2xl p-3 text-xs leading-6", theme.softOrange)}>
            {tr("smsRateHint")}
          </div>
          <Button className="w-full" disabled={loggingIn} onClick={() => void handleLogin()}>
            <Smartphone size={18} />
            {loggingIn ? tr("loginSubmitting") : tr("loginSubmit")}
          </Button>
          <LoginTrustFooter />
        </div>
      </div>
    </div>
  );
}
