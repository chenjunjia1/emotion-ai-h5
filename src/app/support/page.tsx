"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LegalShell } from "@/components/layout/legal-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { SelectField } from "@/components/ui/select-field";
import { useApp } from "@/contexts/app-context";
import { FAQ_ITEMS, SUPPORT_CONTACT } from "@/lib/content/legal";
import { theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

function SupportContent() {
  const searchParams = useSearchParams();
  const { submitFeedback, showToast } = useApp();
  const [tab, setTab] = useState<"faq" | "contact" | "feedback">("faq");

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "feedback" || t === "contact" || t === "faq") setTab(t);
  }, [searchParams]);
  const [type, setType] = useState("意见反馈");
  const [contact, setContact] = useState("");
  const [description, setDescription] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [taskId, setTaskId] = useState("");

  const onSubmit = () => {
    if (!description.trim()) {
      showToast("请填写问题描述");
      return;
    }
    submitFeedback({ type, contact, description, orderNo, taskId });
    setDescription("");
    setOrderNo("");
    setTaskId("");
  };

  return (
    <LegalShell title="客服中心">
      <div className="mb-4 grid grid-cols-3 rounded-2xl bg-orange-50/80 p-1">
        {(
          [
            ["faq", "常见问题"],
            ["contact", "联系客服"],
            ["feedback", "意见反馈"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "rounded-xl py-2.5 text-xs font-bold",
              tab === k ? "bg-white text-orange-600 shadow-sm" : "text-slate-500"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "faq" && (
        <div className="space-y-3">
          {FAQ_ITEMS.map((item) => (
            <Card key={item.q}>
              <CardContent>
                <div className="text-sm font-bold text-slate-900">{item.q}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "contact" && (
        <Card>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-600">
            <p>
              <b>客服微信：</b>
              {SUPPORT_CONTACT.wechat}
            </p>
            <p>
              <b>客服邮箱：</b>
              {SUPPORT_CONTACT.email}
            </p>
          </CardContent>
        </Card>
      )}

      {tab === "feedback" && (
        <Card>
          <CardContent className="space-y-4">
            <Field label="问题类型">
              <SelectField
                value={type}
                onChange={setType}
                options={[
                  "意见反馈",
                  "订单问题",
                  "成片任务失败",
                  "账号与会员",
                  "其他",
                ]}
              />
            </Field>
            <Field label="联系方式">
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="手机号 / 微信 / 邮箱"
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:border-orange-300",
                  theme.border
                )}
              />
            </Field>
            <Field label="问题描述">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className={cn(
                  "w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none focus:border-orange-300",
                  theme.border
                )}
              />
            </Field>
            <Field label="关联订单号（可选）">
              <input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-sm outline-none",
                  theme.border
                )}
              />
            </Field>
            <Field label="关联任务ID（可选）">
              <input
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                className={cn(
                  "w-full rounded-2xl border px-4 py-3 text-sm outline-none",
                  theme.border
                )}
              />
            </Field>
            <Button className="w-full" onClick={onSubmit}>
              提交反馈
            </Button>
          </CardContent>
        </Card>
      )}
    </LegalShell>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-orange-600">加载中...</div>}>
      <SupportContent />
    </Suspense>
  );
}
