"use client";

import { useEffect, useState } from "react";
import { Copy, Loader2 } from "lucide-react";
import { PhoneShell } from "@/components/layout/phone-shell";
import { TopTitle } from "@/components/layout/top-title";
import { Card, CardContent } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { apiFetchHistory } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import type { HistoryRecord } from "@/lib/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("已复制到剪贴板");

  useEffect(() => {
    apiFetchHistory()
      .then(setRecords)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const handleCopy = async (item: HistoryRecord) => {
    const text = item.aiResult?.trim();
    if (!text) {
      showToast("暂无生成内容可复制");
      return;
    }

    const ok = await copyToClipboard(text);
    if (ok) {
      trackEvent("copy_content", { source: "history" });
      showToast("已复制到剪贴板");
    } else {
      showToast("复制失败，请长按手动复制");
    }
  };

  return (
    <PhoneShell>
      <TopTitle title="历史记录" subtitle="最近生成" />

      {loading && (
        <div className="mt-20 flex flex-col items-center gap-2 text-stone-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">加载中...</span>
        </div>
      )}

      {!loading && (
        <div className="mt-5 space-y-3">
          {records.map((item) => (
            <Card key={item.id} className="rounded-[26px]">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-500">
                    {item.featureLabel}
                  </div>
                  <div className="text-xs text-stone-400">
                    {item.displayTime}
                  </div>
                </div>
                <p className="mt-3 text-xs text-stone-400">输入</p>
                <p className="line-clamp-2 text-sm leading-6 text-stone-700">
                  {item.userInput}
                </p>
                <p className="mt-2 text-xs text-stone-400">生成结果</p>
                <p className="line-clamp-3 text-sm leading-6 text-stone-600">
                  {item.aiResult || "（无内容）"}
                </p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-500">
                    {item.style}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(item)}
                    className="flex items-center gap-1 rounded-full bg-rose-500 px-3 py-2 text-xs text-white active:bg-rose-600"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    复制全文
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && records.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">
          暂无历史记录，去生成一条吧
        </p>
      )}

      <Toast visible={toastVisible} message={toastMessage} />
    </PhoneShell>
  );
}
