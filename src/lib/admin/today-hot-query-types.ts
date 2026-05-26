import type { XhsHotNote } from "@/lib/xhs/types";

export type AdminTodayHotQueryRow = {
  note: XhsHotNote;
  rank: number;
  displayHeadline: string;
  displaySubline: string;
  globalRank: number;
};
