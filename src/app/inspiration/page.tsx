"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const InspirationPage = dynamic(
  () =>
    import("@/components/expression/inspiration-page").then((m) => ({
      default: m.InspirationPage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
        加载中…
      </div>
    ),
  }
);

function InspirationFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
      加载中…
    </div>
  );
}

export default function InspirationRoutePage() {
  return (
    <Suspense fallback={<InspirationFallback />}>
      <InspirationPage />
    </Suspense>
  );
}
