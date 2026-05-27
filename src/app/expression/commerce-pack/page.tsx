"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const CommerceMaterialPackPage = dynamic(
  () =>
    import("@/components/expression/commerce-material-pack-page").then((m) => ({
      default: m.CommerceMaterialPackPage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#EF4444]">
        加载中…
      </div>
    ),
  }
);

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#EF4444]">
          加载中…
        </div>
      }
    >
      <CommerceMaterialPackPage />
    </Suspense>
  );
}
