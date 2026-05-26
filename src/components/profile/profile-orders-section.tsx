"use client";

import Link from "next/link";
import { ChevronRight, Receipt } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import type { I18nKey } from "@/lib/i18n";
import {
  formatOrderAmount,
  orderStatusLabel,
} from "@/lib/orders/display";
import {
  formatOrderWhen,
  getOrderRowAction,
  getRecentOrders,
  orderStatusTone,
  sortOrdersForProfile,
} from "@/lib/orders/profile-orders";
import type { Order } from "@/lib/types/v1";
import { cn } from "@/lib/utils";

type Tr = (key: I18nKey) => string;

function StatusBadge({ status }: { status: string }) {
  const tone = orderStatusTone(status);
  return (
    <span
      className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
        tone === "pending" && "bg-amber-100 text-amber-800 ring-1 ring-amber-200/80",
        tone === "paid" && "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/80",
        tone === "danger" && "bg-rose-100 text-rose-700 ring-1 ring-rose-200/80",
        tone === "muted" && "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80"
      )}
    >
      {orderStatusLabel(status)}
    </span>
  );
}

function OrderRow({
  order,
  tr,
  onPay,
}: {
  order: Order;
  tr: Tr;
  onPay: (order: Order) => void;
}) {
  const action = getOrderRowAction(order);
  const inner = (
    <>
      <div className="flex min-w-0 flex-1 items-start gap-2.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFF0F5] to-[#FFE8CC] text-[#FF7AAE]">
          <Receipt size={16} strokeWidth={2.2} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-[13px] font-black text-slate-800">
              {order.productName}
            </p>
            <StatusBadge status={order.status} />
          </div>
          <p className="mt-0.5 text-[11px] text-slate-500">
            ¥{formatOrderAmount(order.amount)}
            <span className="mx-1 text-slate-300">·</span>
            {formatOrderWhen(order.createdAt)}
          </p>
          {order.status === "pending" ? (
            <p className="mt-1 text-[10px] font-bold text-[#FF7AAE]">
              {tr("orderTapToPay")}
            </p>
          ) : order.status === "paid" && order.benefitGranted ? (
            <p className="mt-1 text-[10px] text-emerald-600">
              {tr("profileOrderBenefitOk")}
            </p>
          ) : null}
        </div>
      </div>
      {action.kind !== "none" ? (
        <ChevronRight size={16} className="shrink-0 text-slate-300" />
      ) : null}
    </>
  );

  const className = cn(
    "flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left transition active:scale-[0.99]",
    order.status === "pending"
      ? "bg-amber-50/90 ring-1 ring-amber-200/70"
      : "bg-[#FFFBF8] ring-1 ring-[#FFE8F0]/90"
  );

  if (action.kind === "pay") {
    return (
      <button type="button" className={className} onClick={() => onPay(order)}>
        {inner}
      </button>
    );
  }

  if (action.kind === "result") {
    return (
      <Link
        href={`/pay/result?orderNo=${encodeURIComponent(order.orderNo)}`}
        className={className}
      >
        {inner}
      </Link>
    );
  }

  if (action.kind === "pricing") {
    return (
      <Link href="/profile?pricing=1" className={className}>
        {inner}
      </Link>
    );
  }

  if (action.kind === "support") {
    return (
      <Link href="/support" className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function ProfileOrdersSection({
  orders,
  tr,
  variant = "preview",
  onOpenPricing,
}: {
  orders: Order[];
  tr: Tr;
  variant?: "preview" | "full";
  onOpenPricing?: () => void;
}) {
  const { setPayOrder } = useApp();
  const sorted =
    variant === "full" ? sortOrdersForProfile(orders) : getRecentOrders(orders, 3);
  const showAllLink = variant === "preview" && orders.length > 3;

  if (!orders.length) {
    return (
      <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#FFE8F0] shadow-sm">
        <h3 className="text-sm font-black text-slate-800">{tr("ordersTitle")}</h3>
        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
          {tr("profileOrdersEmpty")}
        </p>
        {onOpenPricing ? (
          <button
            type="button"
            onClick={onOpenPricing}
            className="mt-3 w-full rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] py-2.5 text-[12px] font-black text-white shadow-sm active:scale-[0.98]"
          >
            {tr("profileOrdersCta")}
          </button>
        ) : (
          <Link
            href="/profile?pricing=1"
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF7AAE] py-2.5 text-[12px] font-black text-white shadow-sm"
          >
            {tr("profileOrdersCta")}
          </Link>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-[22px] bg-white p-4 ring-1 ring-[#FFE8F0] shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-black text-slate-800">{tr("ordersTitle")}</h3>
        {variant === "preview" ? (
          <Link
            href="/profile/orders"
            className="flex shrink-0 items-center gap-0.5 text-[11px] font-bold text-[#FF7AAE]"
          >
            {tr("profileOrdersViewAll")}
            <ChevronRight size={14} />
          </Link>
        ) : null}
      </div>

      {variant === "preview" ? (
        <p className="mb-2.5 text-[10px] leading-relaxed text-slate-400">
          {tr("profileOrdersPreviewHint")}
        </p>
      ) : (
        <p className="mb-2.5 text-[10px] leading-relaxed text-slate-400">
          {tr("profileOrdersFullHint")}
        </p>
      )}

      <div className="space-y-2">
        {sorted.map((o) => (
          <OrderRow key={o.id} order={o} tr={tr} onPay={setPayOrder} />
        ))}
      </div>

      {showAllLink ? (
        <Link
          href="/profile/orders"
          className="mt-3 flex w-full items-center justify-center gap-1 rounded-2xl bg-[#FFF5F9] py-2.5 text-[11px] font-bold text-[#FF5C8A] ring-1 ring-[#FF7AAE]/15 active:scale-[0.98]"
        >
          {tr("profileOrdersViewAllCount").replace("{n}", String(orders.length))}
          <ChevronRight size={14} />
        </Link>
      ) : null}
    </section>
  );
}
