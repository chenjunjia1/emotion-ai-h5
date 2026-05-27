"use client";

import { Suspense } from "react";
import { CreateHubPage } from "@/components/expression/create-hub-page";
import { useApp } from "@/contexts/app-context";

function CreatePageInner() {
  return <CreateHubPage />;
}

export default function CreatePage() {
  const { tr } = useApp();
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[#9CA3AF]">{tr("loading")}</div>}>
      <CreatePageInner />
    </Suspense>
  );
}
