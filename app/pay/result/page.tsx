"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { apiPayStatus } from "@/lib/client/server-api";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function PayResultInner() {
  const params = useSearchParams();
  const orderNo = params.get("orderNo")?.trim() || "";
  const { refreshUser, tr } = useApp();
  const [state, setState] = useState<"loading" | "paid" | "pending" | "error">("loading");
  const [productName, setProductName] = useState("");

  useEffect(() => {
    if (!orderNo) {
      setState("error");
      return;
    }

    let cancelled = false;
    let tries = 0;
    const maxTries = 20;

    const poll = async () => {
      tries += 1;
      const r = await apiPayStatus(orderNo);
      if (cancelled) return;

      if (r.error || !r.order) {
        setState("error");
        return;
      }

      setProductName(r.order.productName);
      if (r.order.benefitGranted || r.order.status === "paid") {
        await refreshUser();
        setState("paid");
        return;
      }

      if (tries >= maxTries) {
        setState("pending");
        return;
      }

      window.setTimeout(() => void poll(), 1500);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [orderNo, refreshUser]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 py-10 text-center">
      {state === "loading" && (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
          <p className="mt-4 text-lg font-semibold text-slate-800">{tr("payResultChecking")}</p>
          <p className="mt-2 text-sm text-slate-500">{tr("payResultWait")}</p>
        </>
      )}

      {state === "paid" && (
        <>
          <CheckCircle2 className="h-14 w-14 text-emerald-500" />
          <p className="mt-4 text-xl font-bold text-slate-900">{tr("paySuccessGranted")}</p>
          {productName ? (
            <p className="mt-2 text-sm text-slate-600">{productName}</p>
          ) : null}
          <Link
            href="/profile"
            className={cn(
              "mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-bold text-white",
              `bg-gradient-to-r ${theme.primary}`
            )}
          >
            {tr("payResultGoProfile")}
          </Link>
        </>
      )}

      {state === "pending" && (
        <>
          <Clock className="h-14 w-14 text-amber-500" />
          <p className="mt-4 text-xl font-bold text-slate-900">{tr("payResultPending")}</p>
          <p className={cn("mt-2 text-sm leading-6", theme.softOrange, "rounded-2xl p-3")}>
            {tr("payResultPendingHint")}
          </p>
          <Link
            href="/profile?pricing=1"
            className="mt-6 inline-flex w-full items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm"
          >
            {tr("pricing")}
          </Link>
        </>
      )}

      {state === "error" && (
        <>
          <XCircle className="h-14 w-14 text-rose-500" />
          <p className="mt-4 text-xl font-bold text-slate-900">{tr("payResultError")}</p>
          <Link
            href="/"
            className="mt-8 inline-flex w-full items-center justify-center rounded-2xl border bg-white px-4 py-3 text-sm font-bold text-slate-800"
          >
            {tr("backHome")}
          </Link>
        </>
      )}
    </div>
  );
}

export default function PayResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        </div>
      }
    >
      <PayResultInner />
    </Suspense>
  );
}
