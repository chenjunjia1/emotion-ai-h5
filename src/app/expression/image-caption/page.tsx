"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const ImageCaptionPage = dynamic(
  () =>
    import("@/components/expression/image-caption-page").then((m) => ({
      default: m.ImageCaptionPage,
    })),
  {
    loading: () => (
      <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
        加载中…
      </div>
    ),
  }
);

export default function ImageCaptionRoutePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-[#FF4F8B]">
          加载中…
        </div>
      }
    >
      <ImageCaptionPage />
    </Suspense>
  );
}
