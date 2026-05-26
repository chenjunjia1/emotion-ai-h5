"use client";

import Link from "next/link";
import { Crown, X } from "lucide-react";
import { isDevMockPayEnabled } from "@/lib/client/pay-env";
import {
  INSPIRATION_PRODUCTS,
  PRO_PLANS,
  resolveInspirationProduct,
} from "@/lib/publish-pack/quota-display";
import type { ProductDef } from "@/lib/types/v1";

export type PayModalKind =
  | "quota"
  | "advanced"
  | "watermark"
  | "upgrade"
  | null;

export function PackV2PayModal({
  open,
  kind,
  onClose,
  onBuy,
  onMockPay,
  onGoPricing,
}: {
  open: boolean;
  kind: PayModalKind;
  onClose: () => void;
  /** 真实下单（createOrder / 支付宝） */
  onBuy: (product: ProductDef) => void;
  /** 仅开发演示 */
  onMockPay?: (productId: string) => void;
  onGoPricing: () => void;
}) {
  if (!open || !kind) return null;

  const titles: Record<NonNullable<PayModalKind>, { title: string; sub: string }> = {
    quota: {
      title: "今日免费次数已用完",
      sub: "补充灵感后可继续生成标题和文案。",
    },
    advanced: {
      title: "灵感不足，解锁高级图文包",
      sub: "高级模式会生成真实感图片，更适合直接发布到小红书和朋友圈。",
    },
    watermark: {
      title: "开通 Pro，保存无水印高清图",
      sub: "高级发布内容更适合直接发，不留痕迹更自然。",
    },
    upgrade: {
      title: "升级更多配图，让内容更完整",
      sub: "图片越完整，越像真实博主发的小红书笔记。",
    },
  };

  const { title, sub } = titles[kind];
  const packs = [
    ...INSPIRATION_PRODUCTS.map((p) => ({
      id: p.id,
      price: `¥${p.price}`,
      name: p.name,
      desc: `${p.points} 灵感`,
      tag: p.tag,
      highlight: p.id === "pack_50",
      product: resolveInspirationProduct(p.id),
    })),
    {
      id: PRO_PLANS[0]!.id,
      price: `¥${PRO_PLANS[0]!.price}`,
      name: PRO_PLANS[0]!.name,
      desc: PRO_PLANS[0]!.perks[0]!,
      tag: "推荐",
      highlight: true,
      product: resolveInspirationProduct(PRO_PLANS[0]!.id),
    },
  ];

  const mockEnabled = isDevMockPayEnabled();

  const handlePackClick = (item: (typeof packs)[number]) => {
    if (item.product) {
      onBuy(item.product);
      return;
    }
    onGoPricing();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md rounded-[32px] border border-white bg-[#fff8f1] p-5 shadow-2xl">
        <div className="flex justify-between gap-3">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-orange-400 text-white">
              <Crown size={22} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{sub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {packs.slice(0, 4).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handlePackClick(p)}
              className={`rounded-3xl border-2 bg-white p-4 text-left ${
                p.highlight ? "border-pink-400" : "border-transparent"
              }`}
            >
              <span className="rounded-full bg-pink-100 px-2 py-1 text-[11px] font-black text-pink-500">
                {p.tag}
              </span>
              <div className="mt-3 text-xl font-black">{p.price}</div>
              <div className="mt-1 text-sm font-black">{p.name}</div>
              <div className="mt-1 text-xs leading-5 text-slate-400">{p.desc}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const p = resolveInspirationProduct("pack_50");
              if (p) onBuy(p);
              else onGoPricing();
            }}
            className="h-12 rounded-full border border-pink-100 bg-white font-black text-pink-500"
          >
            购买灵感
          </button>
          <button
            type="button"
            onClick={() => {
              const p = resolveInspirationProduct("pro_month");
              if (p) onBuy(p);
              else onGoPricing();
            }}
            className="h-12 rounded-full bg-gradient-to-r from-pink-500 to-orange-400 font-black text-white shadow-lg shadow-pink-200"
          >
            开通 Pro
          </button>
        </div>
        <Link
          href="/profile?pricing=1"
          onClick={onClose}
          className="mt-3 block text-center text-xs font-bold text-pink-500"
        >
          查看全部套餐与会员 →
        </Link>
        {mockEnabled && onMockPay ? (
          <button
            type="button"
            onClick={() => onMockPay("pack_50")}
            className="mt-2 w-full text-center text-[10px] text-slate-400 underline"
          >
            开发演示：模拟加 50 灵感
          </button>
        ) : null}
      </div>
    </div>
  );
}
