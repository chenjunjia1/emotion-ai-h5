"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { ExpressionResultView } from "@/components/expression/expression-result-view";
import type { ExpressionResultPayload } from "@/lib/api/expression/types";
import { EXPRESSION_RESULT_STORAGE_KEY } from "@/lib/api/expression/types";

const FALLBACK: ExpressionResultPayload = {
  text: "暂无生成内容，请从首页一键生成后再查看。",
};

export function ExpressionResultPageContent() {
  const searchParams = useSearchParams();
  const fromHome = searchParams.get("from") === "home";
  const [payload, setPayload] = useState<ExpressionResultPayload | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(EXPRESSION_RESULT_STORAGE_KEY);
      if (raw) {
        setPayload(JSON.parse(raw) as ExpressionResultPayload);
        return;
      }
      const legacy = sessionStorage.getItem("expression_quick_result");
      if (legacy) {
        setPayload({ text: legacy });
        return;
      }
    } catch {
      /* ignore */
    }
    setPayload(FALLBACK);
  }, []);

  if (!payload) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center text-sm text-[#9CA3AF]">
          加载中…
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ExpressionResultView initial={payload} fromHome={fromHome} />
    </AppShell>
  );
}
