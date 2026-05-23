"use client";

import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import { useApp } from "@/contexts/app-context";
import { isClientAlipayMode, isClientServerMode } from "@/lib/client/server-api";
import { Button } from "@/components/ui/button";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function PayModal() {
  const { payOrder, setPayOrder, paySuccess, payFail, payClose, tr } = useApp();
  const serverMode = isClientServerMode();
  const alipayMode = isClientAlipayMode();
  if (!payOrder) return null;

  const mockCheckout = !alipayMode;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <div className="text-xl font-bold">
              {alipayMode ? tr("payTitleAlipay") : tr("payTitleMock")}
            </div>
            <div className="mt-1 text-sm text-slate-500">
              {alipayMode ? tr("payDescAlipay") : tr("payDescMock")}
            </div>
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

        {mockCheckout ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
            <p className="font-bold">{tr("payBetaNoticeTitle")}</p>
            <p className="mt-1">{tr("payBetaNoticeBody")}</p>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          {mockCheckout ? (
            <>
              <Button onClick={() => paySuccess(payOrder)}>
                <CheckCircle2 size={18} />
                {tr("payMockSuccess")}
              </Button>
              <Button variant="secondary" onClick={() => payFail(payOrder)}>
                <X size={18} />
                {tr("payFail")}
              </Button>
            </>
          ) : (
            <p className="rounded-2xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-600">
              {tr("payAlipayHint")}
            </p>
          )}
          <Button variant="ghost" onClick={() => payClose(payOrder)}>
            {tr("payCancel")}
          </Button>
        </div>
        <div
          className={cn(
            "mt-4 space-y-2 rounded-2xl p-3 text-[11px] leading-5 text-slate-600",
            theme.softRose
          )}
        >
          <p>
            购买即表示你已阅读并同意
            <Link href="/agreement/rights" className="font-bold text-rose-600">
              《会员与灵感规则》
            </Link>
          </p>
          <p>会员与加油包为虚拟服务；邀请奖励为站内灵感，不含现金返利。</p>
          {mockCheckout && serverMode ? (
            <p className="text-slate-500">{tr("payBetaFootnote")}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
