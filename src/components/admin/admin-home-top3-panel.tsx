"use client";

import { Home, X } from "lucide-react";
import { buildXhsCardCopy } from "@/lib/xhs/xhs-display-copy";
import {
  getHomeTop3Assigned,
  type HomeTop3Slot,
} from "@/lib/xhs/home-top3-picks";
import type { XhsHotNote } from "@/lib/xhs/types";
import { cn } from "@/lib/utils";

const SLOT_LABEL: Record<HomeTop3Slot, string> = {
  1: "TOP 1",
  2: "TOP 2",
  3: "TOP 3",
};

export function AdminHomeTop3Panel({
  notes,
  onClearSlot,
  onJumpToNote,
}: {
  notes: XhsHotNote[];
  onClearSlot: (slot: HomeTop3Slot) => void;
  onJumpToNote: (noteId: string) => void;
}) {
  const assigned = getHomeTop3Assigned(notes);

  return (
    <div className="mb-4 rounded-xl border border-[#FF7AAE]/30 bg-gradient-to-br from-[#FFF8FB] to-[#FFF7F0] p-3">
      <div className="mb-2 flex items-center gap-2">
        <Home size={14} className="text-[#FF4F8B]" />
        <p className="text-xs font-black text-slate-800">首页展示 TOP3</p>
        <span className="text-[10px] text-slate-500">
          指定后用户端首页横滑只展示这 3 条（未填满则自动补齐）
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {([1, 2, 3] as const).map((slot) => {
          const note = assigned[slot];
          const copy = note ? buildXhsCardCopy(note) : null;
          return (
            <div
              key={slot}
              className={cn(
                "relative rounded-lg border bg-white p-2",
                note ? "border-[#FF7AAE]/40 ring-1 ring-[#FF7AAE]/15" : "border-dashed border-orange-200"
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-1">
                <span className="rounded bg-[#FF4F8B] px-1.5 py-0.5 text-[9px] font-black text-white">
                  {SLOT_LABEL[slot]}
                </span>
                {note ? (
                  <button
                    type="button"
                    className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                    aria-label={`取消 ${SLOT_LABEL[slot]}`}
                    onClick={() => onClearSlot(slot)}
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </div>
              {note ? (
                <button
                  type="button"
                  className="flex w-full items-center gap-2 text-left"
                  onClick={() => onJumpToNote(note.id)}
                >
                  {note.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={note.images[0]}
                      alt=""
                      className="h-10 w-10 shrink-0 rounded-md object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md bg-orange-50" />
                  )}
                  <span className="line-clamp-2 text-[10px] font-bold leading-snug text-slate-700">
                    {copy?.headline}
                  </span>
                </button>
              ) : (
                <p className="py-2 text-center text-[10px] text-slate-400">
                  在下方列表点「首页{slot}」指定
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function AdminHomeTop3SlotButtons({
  note,
  onAssign,
}: {
  note: XhsHotNote;
  onAssign: (slot: HomeTop3Slot) => void;
}) {
  return (
    <div className="flex shrink-0 gap-0.5" onClick={(e) => e.stopPropagation()}>
      {([1, 2, 3] as const).map((slot) => {
        const active = note.homeTop3Slot === slot;
        return (
          <button
            key={slot}
            type="button"
            title={`设为首页 TOP${slot}`}
            onClick={() => onAssign(slot)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[8px] font-black transition",
              active
                ? "bg-[#FF4F8B] text-white"
                : "bg-orange-50 text-orange-800 ring-1 ring-orange-100 hover:bg-orange-100"
            )}
          >
            首页{slot}
          </button>
        );
      })}
    </div>
  );
}
