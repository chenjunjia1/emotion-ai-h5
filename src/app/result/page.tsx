"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit3, Loader2, RotateCcw } from "lucide-react";
import { PhoneShell } from "@/components/layout/phone-shell";
import { TopTitle } from "@/components/layout/top-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import {
  loadGenerateForm,
  loadGenerateResult,
  saveGenerateResult,
} from "@/lib/storage";
import { apiGenerate } from "@/lib/api-client";
import { trackEvent } from "@/lib/analytics";
import { copyToClipboard } from "@/lib/copy-to-clipboard";
import type { GenerateResult } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("已复制到剪贴板");
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => {
    const stored = loadGenerateResult();
    if (!stored) {
      router.replace("/generate");
      return;
    }
    setResult(stored);
  }, [router]);

  const fullText = result
    ? [
        result.mainContent,
        ...result.variants.map((v) => `【${v.title}】\n${v.content}`),
      ].join("\n\n")
    : "";

  const copyText = useCallback(async (text: string) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      trackEvent("copy_content");
      setToastMessage("已复制到剪贴板");
    } else {
      setToastMessage("复制失败，请长按手动复制");
    }
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const handleRegenerate = useCallback(async () => {
    const form = loadGenerateForm();
    if (!form) {
      router.push("/generate");
      return;
    }

    setError("");
    setWarning("");
    setRegenerating(true);
    trackEvent("regenerate");

    try {
      const { result: newResult, warning } = await apiGenerate(form);
      saveGenerateResult(newResult);
      setResult(newResult);
      if (warning) setWarning(warning);
    } catch (err) {
      setError(err instanceof Error ? err.message : "重新生成失败");
    } finally {
      setRegenerating(false);
    }
  }, [router]);

  if (!result) {
    return (
      <PhoneShell>
        <div className="py-20 text-center text-stone-400">加载中...</div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <TopTitle
        title="AI已生成"
        subtitle="结果预览"
        showBack
        onBack={() => router.push("/generate")}
      />

      {warning && (
        <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          {warning}
        </p>
      )}

      {error && (
        <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <Card className="mt-5">
        <CardContent>
          <div className="flex items-center justify-between">
            <h3 className="font-bold">{result.mainTitle}</h3>
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs text-rose-500">
              {result.featureLabel}
            </span>
          </div>
          <div className="mt-4 whitespace-pre-wrap rounded-3xl bg-rose-50/60 p-4 text-sm leading-7 text-stone-700">
            {result.mainContent}
          </div>
          <Button
            onClick={() => copyText(fullText)}
            disabled={regenerating}
            className="mt-5 h-12 w-full rounded-full text-base"
          >
            <Copy className="mr-2 h-4 w-4" />
            一键复制
          </Button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={regenerating}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-stone-100 text-sm text-stone-600 disabled:opacity-60"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {regenerating ? "生成中..." : "重新生成"}
            </button>
            <button
              type="button"
              disabled={regenerating}
              onClick={() => router.push("/generate")}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-rose-50 text-sm text-rose-500 disabled:opacity-60"
            >
              <Edit3 className="h-4 w-4" />
              返回修改
            </button>
          </div>
        </CardContent>
      </Card>

      {result.variants.length > 0 && (
        <Card className="mt-5">
          <CardContent>
            <h3 className="font-bold">更多版本</h3>
            <div className="mt-3 space-y-3">
              {result.variants.map((variant) => (
                <div
                  key={variant.title}
                  className="rounded-3xl bg-stone-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-semibold text-rose-500">
                      {variant.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyText(variant.content)}
                      className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs text-stone-500"
                    >
                      <Copy className="h-3 w-3" />
                      复制
                    </button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6 text-stone-600">
                    {variant.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Toast visible={toastVisible} message={toastMessage} />
    </PhoneShell>
  );
}
