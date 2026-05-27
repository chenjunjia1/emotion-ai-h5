"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const MomentsComposePage = dynamic(
  () =>
    import("@/components/expression/moments-compose-page").then((m) => ({
      default: m.MomentsComposePage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
        加载中…
      </div>
    ),
  }
);

export default function MomentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
          加载中…
        </div>
      }
    >
      <MomentsComposePage />
    </Suspense>
  );
}
