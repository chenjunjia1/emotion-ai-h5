"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ExpressionResultPageContent = dynamic(
  () =>
    import("@/components/expression/expression-result-page").then((m) => ({
      default: m.ExpressionResultPageContent,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
        加载中…
      </div>
    ),
  }
);

export default function ExpressionResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
          加载中…
        </div>
      }
    >
      <ExpressionResultPageContent />
    </Suspense>
  );
}
