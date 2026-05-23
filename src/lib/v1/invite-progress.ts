import type { InviteRecordDto } from "@/lib/client/server-api";
import type { User } from "@/lib/types/v1";

/** 与 banner2Title「邀请 3 位好友」一致 */
export const INVITE_UNLOCK_TARGET = 3;

const COUNTED_STATUSES = new Set([
  "valid",
  "rewarded",
  "member_rewarded",
  "pending",
]);

const SLOT_EMOJIS = ["🧋", "✨", "🔥", "💗", "🌟", "🎀"] as const;

export type InviteSlotView = {
  id: string;
  filled: boolean;
  label: string;
  emoji: string;
};

export function inviteSlotEmoji(seed: string, index: number): string {
  const n =
    (seed.charCodeAt(0) + seed.charCodeAt(seed.length - 1) + index) %
    SLOT_EMOJIS.length;
  return SLOT_EMOJIS[n] ?? "✨";
}

export function getInviteProgress(
  user: User | null,
  records: InviteRecordDto[]
): {
  count: number;
  target: number;
  unlocked: boolean;
  percent: number;
  remaining: number;
  slots: InviteSlotView[];
  recentRecords: InviteRecordDto[];
} {
  const target = INVITE_UNLOCK_TARGET;
  const countedFromRecords = records.filter((r) =>
    COUNTED_STATUSES.has(r.rewardStatus)
  ).length;
  const rawCount = Math.max(user?.inviteCount ?? 0, countedFromRecords);
  const count = Math.min(target, rawCount);
  const unlocked = count >= target;
  const percent = Math.min(100, Math.round((count / target) * 100));
  const remaining = Math.max(0, target - count);

  const recentRecords = [...records]
    .sort(
      (a, b) =>
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
    )
    .slice(0, target);

  const slots: InviteSlotView[] = Array.from({ length: target }, (_, i) => {
    const record = recentRecords[i];
    const filled = i < count;
    if (record && filled) {
      const tail = record.inviteeMobileMasked.replace(/\*/g, "").slice(-2);
      return {
        id: `invite-slot-${i}-${record.inviteeMobileMasked}`,
        filled: true,
        label: tail || "友",
        emoji: inviteSlotEmoji(record.inviteeMobileMasked, i),
      };
    }
    return { id: `invite-slot-${i}-empty`, filled: false, label: "+", emoji: "➕" };
  });

  return {
    count,
    target,
    unlocked,
    percent,
    remaining,
    slots,
    recentRecords,
  };
}
