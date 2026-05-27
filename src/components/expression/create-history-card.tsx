"use client";

import Link from "next/link";
import { ChevronRight, Copy } from "lucide-react";
import { HistoryTypeIconBadge } from "@/components/history/history-type-icon";
import type { HistoryTypeMeta } from "@/lib/history/library-meta";
import { cn } from "@/lib/utils";

export type CreateHistoryRecord = {
  id: string;
  meta: HistoryTypeMeta;
  preview: string;
  time: string;
  detailHref: string;
};

export function CreateHistoryCard({
  record,
  index,
  onCopy,
}: {
  record: CreateHistoryRecord;
  index: number;
  onCopy: (text: string) => void;
}) {
  return (
    <article
      className="create-history-card flex w-[min(76vw,260px)] shrink-0 snap-start flex-col rounded-2xl border border-[#F0F0F0] bg-white p-3"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="flex items-start gap-2">
        <HistoryTypeIconBadge meta={record.meta} list />
        <div className="min-w-0 flex-1">
          <span className="text-[10px] font-medium text-[#999]">{record.meta.shortLabel}</span>
          <p className="mt-1 line-clamp-3 text-[13px] font-medium leading-snug text-[#333]">
            {record.preview}
          </p>
          <p className="mt-1 text-[10px] text-[#BBB]">{record.time}</p>
        </div>
      </div>
      <div className="mt-2.5 flex gap-2 border-t border-[#F5F5F5] pt-2">
        <button
          type="button"
          onClick={() => onCopy(record.preview)}
          className="flex flex-1 items-center justify-center gap-0.5 rounded-full border border-[#F0F0F0] py-1.5 text-[10px] font-medium text-[#666] active:bg-[#FAFAFA]"
        >
          <Copy size={11} />
          复制
        </button>
        <Link
          href={record.detailHref}
          className={cn(
            "flex flex-1 items-center justify-center gap-0.5 rounded-full py-1.5 text-[10px] font-medium text-white active:opacity-90"
          )}
          style={{ backgroundColor: "#FF2442" }}
        >
          详情
          <ChevronRight size={12} />
        </Link>
      </div>
    </article>
  );
}
