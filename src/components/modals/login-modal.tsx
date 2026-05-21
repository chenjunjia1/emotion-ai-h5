"use client";

import { useState } from "react";
import Link from "next/link";
import { Smartphone, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function LoginModal() {
  const { loginOpen, setLoginOpen, sendCode, login, showToast, tr } = useApp();
  const [mobile, setMobile] = useState("13800138000");
  const [code, setCode] = useState("1234");
  const [agreed, setAgreed] = useState(false);

  if (!loginOpen) return null;

  const handleLogin = () => {
    if (!agreed) {
      showToast(tr("loginAgreeRequired"));
      return;
    }
    login(mobile, code);
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-bold text-slate-900">{tr("loginTitle")}</div>
            <div className="mt-1 text-sm text-slate-500">{tr("loginMockHint")}</div>
          </div>
          <button
            type="button"
            onClick={() => setLoginOpen(false)}
            className={cn("rounded-2xl p-2", theme.softOrange)}
          >
            <X size={18} className="text-orange-600" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label={tr("mobile")}>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className={cn(
                "w-full rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-orange-300 focus:ring-4 focus:ring-orange-100",
                theme.border
              )}
            />
          </Field>
          <Field label={tr("code")}>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className={cn(
                  "min-w-0 flex-1 rounded-2xl border bg-white px-4 py-3 text-sm outline-none focus:border-orange-300",
                  theme.border
                )}
              />
              <Button variant="secondary" onClick={() => sendCode(mobile)}>
                {tr("getCode")}
              </Button>
            </div>
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
              <Link href="/agreement/user" className="font-bold text-orange-600" onClick={() => setLoginOpen(false)}>
                {tr("loginAgreeUser")}
              </Link>{" "}
              {tr("loginAgreeAnd")}{" "}
              <Link href="/agreement/privacy" className="font-bold text-orange-600" onClick={() => setLoginOpen(false)}>
                {tr("loginAgreePrivacy")}
              </Link>
            </span>
          </label>
          <div className={cn("rounded-2xl p-3 text-xs leading-6", theme.softOrange)}>
            {tr("smsRateHint")}
          </div>
          <Button className="w-full" onClick={handleLogin}>
            <Smartphone size={18} />
            {tr("loginSubmit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
