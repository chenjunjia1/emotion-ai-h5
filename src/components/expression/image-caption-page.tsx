"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Copy, ImagePlus, Sparkles, X, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { InspirationSourceBar } from "@/components/inspiration/inspiration-source-bar";
import { GradientButton } from "@/components/expression/ui";
import { useApp } from "@/contexts/app-context";
import {
  ExpressionApiError,
  apiImageCaption,
  expressionErrorMessage,
} from "@/lib/api/expression/client";
import { EXPRESSION_PRICING_HINT } from "@/lib/expression/pricing";
import { compressImageForUpload } from "@/lib/media/compress-image-file";
import { dataUrlToBase64, fileToDataUrl } from "@/lib/media/file-to-data-url";
import { canAffordQuota, getQuotaCost, getTotalQuota } from "@/lib/v1/quota";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,image/heif";

type CaptionResult = {
  moments: string;
  xhs: string;
  wechatStatus: string;
  moodScore?: number;
  quotaCost?: number;
};

export function ImageCaptionPage() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? "";
  const hint = searchParams.get("hint") ?? "";
  const fromInspiration =
    searchParams.get("from") === "inspiration" || Boolean(searchParams.get("inspiration_id"));
  const returnTo = searchParams.get("returnTo") ?? "/inspiration";

  const { user, setUser, setLoginOpen, openQuotaModal, showToast } = useApp();
  const fileRef = useRef<HTMLInputElement>(null);

  const [hintText, setHintText] = useState(topic || hint);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);

  const isVip = user && user.plan !== "free";
  const quotaCost = getQuotaCost("expression_image");

  const openPicker = () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    fileRef.current?.click();
  };

  const onFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;

      if (!file.type.startsWith("image/") && !/\.(heic|heif)$/i.test(file.name)) {
        showToast("请选择图片文件（JPG / PNG / WebP）");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        showToast("图片过大，请选择 15MB 以内的照片");
        return;
      }

      setUploading(true);
      setResult(null);
      try {
        const compressed = await compressImageForUpload(file);
        const dataUrl = await fileToDataUrl(compressed);
        setPreviewUrl(dataUrl);
        setImageBase64(dataUrlToBase64(dataUrl));
        setFileName(compressed.name);
        showToast("图片已就绪，可一键生成配文");
      } catch (err) {
        const msg = err instanceof Error && err.message === "heic_unsupported"
          ? "暂不支持 HEIC，请先转为 JPG"
          : "图片读取失败，请换一张试试";
        showToast(msg);
      } finally {
        setUploading(false);
      }
    },
    [showToast]
  );

  const clearImage = () => {
    setPreviewUrl(null);
    setImageBase64(null);
    setFileName(null);
    setResult(null);
  };

  const onGenerate = async () => {
    if (!user) {
      setLoginOpen(true);
      return;
    }
    if (user.plan === "free") {
      showToast(expressionErrorMessage("feature_vip"));
      return;
    }
    if (!imageBase64) {
      showToast("请先上传一张图片");
      openPicker();
      return;
    }
    if (!canAffordQuota(user, "expression_image")) {
      openQuotaModal({ need: quotaCost, have: getTotalQuota(user) });
      showToast("灵感不足，请充值或开通会员");
      return;
    }

    setLoading(true);
    try {
      const res = await apiImageCaption({
        imageBase64,
        hint: hintText.trim() || topic || hint,
        platforms: ["moments", "xhs", "wechat_status"],
      });
      if (res.user) setUser(res.user);
      setResult({
        moments: res.moments ?? "",
        xhs: res.xhs ?? "",
        wechatStatus: res.wechatStatus ?? "",
        moodScore: res.moodScore,
        quotaCost: res.quotaCost,
      });
      showToast(res.quotaCost ? `生成完成（消耗 ${res.quotaCost} 灵感）` : "生成完成");
    } catch (e) {
      if (e instanceof ExpressionApiError) {
        if (e.code === "quota_insufficient") openQuotaModal();
        showToast(expressionErrorMessage(e.code));
      } else {
        showToast("生成失败，请重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyAll = async () => {
    if (!result) return;
    const blob = [
      `【朋友圈】\n${result.moments}`,
      `\n【小红书】\n${result.xhs}`,
      `\n【微信状态】\n${result.wechatStatus}`,
      result.moodScore != null ? `\n氛围感 ${result.moodScore} 分` : "",
    ].join("");
    try {
      await navigator.clipboard.writeText(blob);
      showToast("已复制全部文案");
    } catch {
      showToast("复制失败，请长按选择文字");
    }
  };

  return (
    <AppShell>
      <div className="image-caption-page space-y-4 pb-4">
        <Link href="/create" className="inline-flex text-[12px] font-bold text-[#FF4F8B]">
          ← 返回创作中心
        </Link>

        {fromInspiration && (topic || hint) ? (
          <InspirationSourceBar headline={(topic || hint).slice(0, 48)} returnTo={returnTo} />
        ) : null}

        <div>
          <p className="text-[11px] font-bold text-[#FF4F8B]">识图配文 · 会员功能</p>
          <h1 className="mt-0.5 text-[20px] font-black text-[#1F2937]">上传图片配文</h1>
          <p className="mt-1 text-[11px] text-[#9CA3AF]">
            选一张照片，AI 帮你写朋友圈 / 小红书 / 微信状态
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPT}
          capture="environment"
          className="sr-only"
          onChange={(e) => void onFileChange(e)}
        />

        {!previewUrl ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={uploading}
            className={cn(
              "flex w-full flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-[#FFB8D0] bg-white py-12 text-center shadow-[0_4px_20px_rgba(255,79,139,0.08)] transition active:scale-[0.99]",
              "hover:border-[#FF4F8B]/50 hover:bg-[#FFF8FB]",
              uploading && "pointer-events-none opacity-70"
            )}
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9EC4] to-[#FF7AAE] text-white shadow-md">
              {uploading ? (
                <Sparkles size={28} className="animate-spin" />
              ) : (
                <Camera size={28} strokeWidth={2} />
              )}
            </span>
            <p className="mt-3 text-[14px] font-black text-[#374151]">
              {uploading ? "处理中…" : "点击上传图片"}
            </p>
            <p className="mt-1 text-[11px] text-[#9CA3AF]">支持相册选图 / 拍照 · JPG PNG WebP</p>
          </button>
        ) : (
          <div className="relative overflow-hidden rounded-[20px] bg-[#1F2937]/5 ring-1 ring-[#FFE8F0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="已选图片预览"
              className="max-h-[280px] w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
              <p className="truncate text-[11px] font-semibold text-white">
                {fileName ?? "已选图片"}
              </p>
            </div>
            <button
              type="button"
              onClick={clearImage}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm active:scale-95"
              aria-label="移除图片"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={openPicker}
              className="absolute bottom-2 right-2 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#FF4F8B] shadow active:scale-95"
            >
              换一张
            </button>
          </div>
        )}

        {!previewUrl ? (
          <button
            type="button"
            onClick={openPicker}
            className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#FFF0F5] py-2.5 text-[12px] font-bold text-[#FF4F8B] ring-1 ring-[#FFD0E8] active:scale-[0.98]"
          >
            <ImagePlus size={16} />
            从相册选择
          </button>
        ) : null}

        <textarea
          value={hintText}
          onChange={(e) => setHintText(e.target.value)}
          placeholder="可选：补充心情或场景，如「下班治愈」「咖啡探店」"
          rows={3}
          className="w-full rounded-[16px] border border-[#FFE8F0] bg-white p-3 text-[13px] outline-none focus:ring-2 focus:ring-[#FF4F8B]/25"
        />

        {user?.plan === "free" ? (
          <div className="rounded-[16px] border border-[#FFE0EC] bg-[#FFF5F8] p-3">
            <p className="text-[12px] font-bold text-[#1F2937]">Pro 会员专享</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#6B7280]">
              {EXPRESSION_PRICING_HINT.vip} · 识图配文消耗 {quotaCost} 灵感/次
            </p>
            <Link
              href="/profile?pricing=1"
              className="mt-2 inline-block text-[12px] font-bold text-[#FF4F8B]"
            >
              开通 Pro 会员 →
            </Link>
          </div>
        ) : (
          <p className="flex items-center justify-center gap-1 text-center text-[10px] text-[#9CA3AF]">
            <Zap size={11} className="text-[#FF9A4D]" />
            每次识图配文消耗 {quotaCost} 灵感
          </p>
        )}

        <GradientButton
          className="w-full !rounded-[14px]"
          onClick={() => void onGenerate()}
        >
          {loading ? (
            <>
              <Sparkles size={16} className="animate-spin" />
              生成中…
            </>
          ) : (
            "一键生成配文"
          )}
        </GradientButton>

        {result ? (
          <div className="space-y-2.5 rounded-[20px] bg-white p-4 shadow-[0_6px_24px_rgba(255,79,139,0.08)] ring-1 ring-[#FFE8F0]">
            {(
              [
                { key: "朋友圈", text: result.moments },
                { key: "小红书", text: result.xhs },
                { key: "微信状态", text: result.wechatStatus },
              ] as const
            ).map(({ key, text }) =>
              text ? (
                <div key={key} className="border-b border-[#FFF0F5] pb-3 last:border-0 last:pb-0">
                  <p className="text-[10px] font-black text-[#FF4F8B]">{key}</p>
                  <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-[#374151]">
                    {text}
                  </p>
                  <button
                    type="button"
                    className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#FF4F8B]"
                    onClick={() => void navigator.clipboard?.writeText(text)}
                  >
                    <Copy size={12} />
                    复制
                  </button>
                </div>
              ) : null
            )}
            {result.moodScore != null ? (
              <p className="text-center text-[11px] font-bold text-[#9CA3AF]">
                氛围感评分 {result.moodScore} / 99
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => void copyAll()}
              className="mt-1 w-full rounded-full bg-[#FFF0F5] py-2.5 text-[12px] font-black text-[#FF4F8B] active:scale-[0.98]"
            >
              复制全部文案
            </button>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
