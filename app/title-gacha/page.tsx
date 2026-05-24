"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/contexts/app-context";

/** 扭蛋已下线，统一跳转选题盲盒 */
export default function TitleGachaRedirectPage() {
  const router = useRouter();
  const { tr } = useApp();
  useEffect(() => {
    router.replace("/topic-box");
  }, [router]);
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 px-6 text-center text-sm text-slate-500">
      <p>{tr("titleGachaMergedHint")}</p>
    </div>
  );
}
