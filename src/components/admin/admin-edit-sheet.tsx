"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** 手机端底部编辑抽屉（解决编辑区在页面下方看不见的问题） */
export function AdminEditSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="关闭"
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl",
          "pb-[max(1rem,env(safe-area-inset-bottom))]"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 p-2"
            aria-label="关闭"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
