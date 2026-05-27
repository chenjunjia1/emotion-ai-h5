"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const AccountDiagnosisPage = dynamic(
  () =>
    import("@/components/expression/account-diagnosis-page").then((m) => ({
      default: m.AccountDiagnosisPage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
        加载中…
      </div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
          加载中…
        </div>
      }
    >
      <AccountDiagnosisPage />
    </Suspense>
  );
}
