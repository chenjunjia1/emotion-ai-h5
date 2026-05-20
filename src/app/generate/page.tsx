"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { PhoneShell } from "@/components/layout/phone-shell";
import { TopTitle } from "@/components/layout/top-title";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AUDIENCE_OPTIONS,
  FEATURE_LIST,
  STYLE_OPTIONS,
} from "@/lib/constants";
import { getDefaultForm } from "@/lib/mock";
import { saveGenerateForm, saveGenerateResult } from "@/lib/storage";
import { trackEvent } from "@/lib/analytics";
import { apiGenerate } from "@/lib/api-client";
import type {
  AudienceType,
  FeatureType,
  GenerateFormData,
  StyleType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function GenerateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFeature =
    (searchParams.get("feature") as FeatureType) || "private";

  const [form, setForm] = useState<GenerateFormData>(() =>
    getDefaultForm(
      ["video", "comment", "private"].includes(initialFeature)
        ? initialFeature
        : "private"
    )
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  const activeInfo = useMemo(
    () =>
      FEATURE_LIST.find((item) => item.id === form.feature) ??
      FEATURE_LIST[2],
    [form.feature]
  );

  const handleGenerate = useCallback(async () => {
    if (!form.input.trim()) {
      setError("请输入客户消息、评论内容或文案主题");
      return;
    }

    setError("");
    setWarning("");
    setLoading(true);
    trackEvent("submit_generate", {
      feature: form.feature,
      style: form.style,
    });

    try {
      const { result, warning: apiWarning } = await apiGenerate(form);
      if (apiWarning) setWarning(apiWarning);
      saveGenerateForm(form);
      saveGenerateResult(result);
      trackEvent("generate_success", { feature: form.feature });
      router.push("/result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }, [form, router]);

  return (
    <PhoneShell>
      <TopTitle
        title={activeInfo.title}
        subtitle="生成内容"
        showBack
        backHref="/"
      />

      <Card className="mt-5">
        <CardContent>
          <h3 className="font-bold">选择功能</h3>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {FEATURE_LIST.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={loading}
                onClick={() =>
                  setForm((prev) => ({ ...prev, feature: item.id }))
                }
                className={cn(
                  "rounded-2xl px-2 py-3 text-xs leading-tight sm:text-sm",
                  form.feature === item.id
                    ? "bg-rose-500 text-white shadow-md shadow-rose-100"
                    : "bg-stone-100 text-stone-600"
                )}
              >
                {item.title.replace("区", "")}
              </button>
            ))}
          </div>

          <div className="mt-5">
            <label className="text-sm font-medium text-stone-600">
              客户/评论/文案主题
            </label>
            <textarea
              value={form.input}
              disabled={loading}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, input: e.target.value }))
              }
              className="mt-2 h-32 w-full resize-none rounded-3xl border border-rose-100 bg-rose-50/40 p-4 text-sm outline-none placeholder:text-stone-400 focus:border-rose-300 disabled:opacity-60"
              placeholder="请输入客户消息、评论内容或文案主题"
            />
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-stone-600">
              回复风格
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {STYLE_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setForm((prev) => ({ ...prev, style: tag as StyleType }))
                  }
                  className={cn(
                    "rounded-full px-3 py-2 text-sm transition",
                    form.style === tag
                      ? "bg-rose-500 text-white"
                      : "bg-stone-100 text-stone-600 hover:bg-rose-100 hover:text-rose-500"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-stone-600">
              目标人群
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {AUDIENCE_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      audience: tag as AudienceType,
                    }))
                  }
                  className={cn(
                    "rounded-full px-3 py-2 text-sm transition",
                    form.audience === tag
                      ? "bg-rose-500 text-white"
                      : "bg-rose-50 text-rose-500 hover:bg-rose-100"
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

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

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="mt-6 h-12 w-full rounded-full text-base disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI 生成中...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI 生成
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </PhoneShell>
  );
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <PhoneShell>
          <div className="py-20 text-center text-stone-400">加载中...</div>
        </PhoneShell>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}
