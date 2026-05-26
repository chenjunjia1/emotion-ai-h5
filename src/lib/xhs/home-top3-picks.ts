import { diversifyXhsNotes } from "@/lib/xhs/xhs-feed-filters";
import type { XhsHotNote } from "@/lib/xhs/types";

export type HomeTop3Slot = 1 | 2 | 3;

const SLOTS: HomeTop3Slot[] = [1, 2, 3];

export function isHomeTop3Slot(v: unknown): v is HomeTop3Slot {
  return v === 1 || v === 2 || v === 3;
}

/** 当前已指定的首页 TOP1/2/3 */
export function getHomeTop3Assigned(
  notes: XhsHotNote[]
): Partial<Record<HomeTop3Slot, XhsHotNote>> {
  const out: Partial<Record<HomeTop3Slot, XhsHotNote>> = {};
  for (const n of notes) {
    if (isHomeTop3Slot(n.homeTop3Slot)) {
      out[n.homeTop3Slot] = n;
    }
  }
  return out;
}

/** 指定某条为首页 TOP 位（同位互斥，会顶掉原占用） */
export function setNoteHomeTop3Slot(
  notes: XhsHotNote[],
  noteId: string,
  slot: HomeTop3Slot | null
): XhsHotNote[] {
  return notes.map((n) => {
    if (n.id === noteId) {
      if (!slot) {
        const { homeTop3Slot: _, ...rest } = n;
        return rest as XhsHotNote;
      }
      return { ...n, homeTop3Slot: slot };
    }
    if (slot && n.homeTop3Slot === slot) {
      const { homeTop3Slot: _, ...rest } = n;
      return rest as XhsHotNote;
    }
    return n;
  });
}

/** 首页 TOP3：优先用后台指定，不足再自动补齐 */
export function pickHomeTop3Notes(notes: XhsHotNote[]): XhsHotNote[] {
  const bySlot = getHomeTop3Assigned(notes);
  const picked: XhsHotNote[] = [];
  const used = new Set<string>();

  for (const slot of SLOTS) {
    const n = bySlot[slot];
    if (n) {
      picked.push(n);
      used.add(n.noteId);
    }
  }

  if (picked.length >= 3) return picked.slice(0, 3);

  const rest = notes.filter((n) => !used.has(n.noteId));
  const fill = diversifyXhsNotes(rest, 3 - picked.length);
  return [...picked, ...fill];
}

export function countHomeTop3Assigned(notes: XhsHotNote[]): number {
  return SLOTS.filter((s) => notes.some((n) => n.homeTop3Slot === s)).length;
}
