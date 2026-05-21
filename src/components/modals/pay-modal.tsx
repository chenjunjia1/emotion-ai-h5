"use client";

import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function PayModal() {
  const { payOrder, setPayOrder, paySuccess, payFail, payClose, tr } = useApp();
  if (!payOrder) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-bold">{tr("mockPay")}</div>
            <div className="mt-1 text-sm text-slate-500">benefit_granted 防重复发放</div>
          </div>
          <button
            type="button"
            onClick={() => payClose(payOrder)}
            className={cn("rounded-2xl p-2", theme.softOrange)}
          >
            <X size={18} className="text-orange-600" />
          </button>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-[#F9735B] to-[#D9468F] p-5 text-white">
          <div className="text-sm text-white/80">商品</div>
          <div className="mt-1 text-2xl font-bold">{payOrder.productName}</div>
          <div className="mt-5 flex items-end justify-between">
            <span className="text-sm text-white/80">金额</span>
            <b className="text-4xl">¥{payOrder.amount}</b>
          </div>
          <div className="mt-3 text-xs text-white/70">订单号：{payOrder.orderNo}</div>
        </div>
        <div className="mt-5 grid gap-3">
          <Button onClick={() => paySuccess(payOrder)}>
            <CheckCircle2 size={18} />
            {tr("paySuccess")}
          </Button>
          <Button variant="secondary" onClick={() => payFail(payOrder)}>
            <X size={18} />
            {tr("payFail")}
          </Button>
          <Button variant="ghost" onClick={() => payClose(payOrder)}>
            {tr("payCancel")}
          </Button>
        </div>
        <div className={cn("mt-4 space-y-2 rounded-2xl p-3 text-[11px] leading-5 text-slate-600", theme.softRose)}>
          <p>
            购买即表示你已阅读并同意
            <Link href="/agreement/rights" className="font-bold text-rose-600">
              《会员与视频币规则》
            </Link>
          </p>
          <p>会员为虚拟服务，视频币为虚拟权益。已消耗的视频币不支持退回。</p>
          <p>任务失败时系统会自动退回冻结的视频币。</p>
          <p className="text-orange-600">当前为 Mock 支付，仅用于演示。</p>
        </div>
      </div>
    </div>
  );
}
