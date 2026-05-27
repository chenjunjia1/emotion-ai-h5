"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const XhsNoteComposePage = dynamic(
  () =>
    import("@/components/expression/xhs-note-compose-page").then((m) => ({
      default: m.XhsNoteComposePage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#FF2442]">
        加载中…
      </div>
    ),
  }
);

export default function XhsNotePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#FF2442]">
          加载中…
        </div>
      }
    >
      <XhsNoteComposePage />
    </Suspense>
  );
}
