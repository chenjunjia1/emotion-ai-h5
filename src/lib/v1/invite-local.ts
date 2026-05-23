import {
  INVITE_MEMBER_REWARD,
  INVITE_REGISTER_REWARD,
  STORAGE_INVITE_RECORDS,
  STORAGE_INVITE_REGISTRY,
  STORAGE_REGISTERED_MOBILES,
} from "@/lib/constants/v1";
import { mockInviteBlindBox } from "@/lib/mock/content-v1";
import type { User } from "@/lib/types/v1";

export type InviteRecordStatus =
  | "pending"
  | "valid"
  | "rewarded"
  | "invalid"
  | "member_rewarded";

export interface InviteRecord {
  id: string;
  inviteeMobileMasked: string;
  registeredAt: string;
  rewardStatus: InviteRecordStatus;
  inviterRewardQuota: number;
  inviteeRewardQuota?: number;
  memberRewardQuota?: number;
  isMember?: boolean;
}

interface InviteRegistryEntry {
  user: User;
  updatedAt: string;
}

function loadJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function maskMobile(m: string): string {
  if (m.length < 7) return m;
  return `${m.slice(0, 3)}****${m.slice(-4)}`;
}

function getDeviceId(): string {
  const key = "sv-device-id";
  let id = localStorage.getItem(key);
  if (!id) {
    id = `d-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
  }
  return id;
}

export function mergeInviteRegistryUser(user: User): User {
  if (!user.inviteCode) return user;
  const registry = loadJson<Record<string, InviteRegistryEntry>>(
    STORAGE_INVITE_REGISTRY,
    {}
  );
  const entry = registry[user.inviteCode];
  if (!entry || entry.user.id !== user.id) return user;
  const remote = entry.user;
  if (
    remote.bonusQuota <= user.bonusQuota &&
    (remote.inviteCount ?? 0) <= (user.inviteCount ?? 0)
  ) {
    return user;
  }
  return {
    ...user,
    bonusQuota: Math.max(user.bonusQuota, remote.bonusQuota),
    inviteCount: Math.max(user.inviteCount ?? 0, remote.inviteCount ?? 0),
    inviteRewardTotal: Math.max(
      user.inviteRewardTotal ?? 0,
      remote.inviteRewardTotal ?? 0
    ),
    inviteBlindBoxCount: Math.max(
      user.inviteBlindBoxCount ?? 0,
      remote.inviteBlindBoxCount ?? 0
    ),
  };
}

export function saveInviteRegistryUser(user: User) {
  if (!user.inviteCode) return;
  const registry = loadJson<Record<string, InviteRegistryEntry>>(
    STORAGE_INVITE_REGISTRY,
    {}
  );
  registry[user.inviteCode] = { user, updatedAt: new Date().toISOString() };
  saveJson(STORAGE_INVITE_REGISTRY, registry);
}

export function loadInviteRecordsFor(userId: string): InviteRecord[] {
  const all = loadJson<
    (InviteRecord & { inviterUserId: string })[]
  >(STORAGE_INVITE_RECORDS, []);
  return all.filter((r) => r.inviterUserId === userId);
}

function appendInviteRecord(
  inviterId: string,
  record: InviteRecord & { inviterUserId: string }
) {
  const all = loadJson<(InviteRecord & { inviterUserId: string })[]>(
    STORAGE_INVITE_RECORDS,
    []
  );
  all.unshift(record);
  saveJson(STORAGE_INVITE_RECORDS, all.slice(0, 100));
}

export function processLocalInviteOnRegister(input: {
  invitee: User;
  inviteCode: string;
}): { ok: boolean; reason?: string; invitee?: User } {
  const code = input.inviteCode.trim().toUpperCase();
  if (!code) return { ok: false, reason: "no_code" };

  const registered = loadJson<string[]>(STORAGE_REGISTERED_MOBILES, []);
  if (registered.includes(input.invitee.mobile)) {
    return { ok: false, reason: "already_registered" };
  }

  const registry = loadJson<Record<string, InviteRegistryEntry>>(
    STORAGE_INVITE_REGISTRY,
    {}
  );
  const inviterEntry = registry[code];
  if (!inviterEntry) return { ok: false, reason: "invalid_code" };

  const inviter = inviterEntry.user;
  if (inviter.mobile === input.invitee.mobile || inviter.id === input.invitee.id) {
    return { ok: false, reason: "self_invite" };
  }

  const records = loadInviteRecordsFor(inviter.id);
  const dailyCap = records.filter((r) => {
    const d = new Date(r.registeredAt);
    const now = new Date();
    return d.toDateString() === now.toDateString() && r.rewardStatus === "rewarded";
  }).length;
  if (dailyCap >= 50) return { ok: false, reason: "daily_cap" };

  const deviceKey = `sv-invite-device-${getDeviceId()}`;
  const lastDevice = localStorage.getItem(deviceKey);
  if (lastDevice && Date.now() - Number(lastDevice) < 86400000) {
    return { ok: false, reason: "device_limit" };
  }
  localStorage.setItem(deviceKey, String(Date.now()));

  const inviterNext: User = {
    ...inviter,
    bonusQuota: inviter.bonusQuota + INVITE_REGISTER_REWARD,
    inviteCount: (inviter.inviteCount ?? 0) + 1,
    inviteRewardTotal:
      (inviter.inviteRewardTotal ?? 0) + INVITE_REGISTER_REWARD,
    inviteBlindBoxCount: (inviter.inviteBlindBoxCount ?? 0) + 1,
  };
  registry[code] = { user: inviterNext, updatedAt: new Date().toISOString() };
  saveJson(STORAGE_INVITE_REGISTRY, registry);

  const inviteeNext: User = {
    ...input.invitee,
    bonusQuota: input.invitee.bonusQuota + INVITE_REGISTER_REWARD,
    inviteRewardTotal:
      (input.invitee.inviteRewardTotal ?? 0) + INVITE_REGISTER_REWARD,
  };

  appendInviteRecord(inviter.id, {
    inviterUserId: inviter.id,
    id: `ir-${Date.now()}`,
    inviteeMobileMasked: maskMobile(input.invitee.mobile),
    registeredAt: new Date().toISOString(),
    rewardStatus: "rewarded",
    inviterRewardQuota: INVITE_REGISTER_REWARD,
  });

  registered.push(input.invitee.mobile);
  saveJson(STORAGE_REGISTERED_MOBILES, registered);

  return { ok: true, invitee: inviteeNext };
}

export function grantLocalMemberInviteReward(invitee: User): void {
  const records = loadJson<
    (InviteRecord & {
      inviterUserId: string;
      inviteeUserId?: string;
      memberGranted?: boolean;
    })[]
  >(STORAGE_INVITE_RECORDS, []);
  const hit = records.find(
    (r) =>
      r.inviteeMobileMasked === maskMobile(invitee.mobile) &&
      !r.memberGranted &&
      r.rewardStatus === "rewarded"
  );
  if (!hit) return;

  const registry = loadJson<Record<string, InviteRegistryEntry>>(
    STORAGE_INVITE_REGISTRY,
    {}
  );
  const inviterEntry = Object.values(registry).find((e) => e.user.id === hit.inviterUserId);
  if (!inviterEntry) return;

  const inviter = inviterEntry.user;
  const code = inviter.inviteCode;
  if (!code) return;

  const inviterNext: User = {
    ...inviter,
    bonusQuota: inviter.bonusQuota + INVITE_MEMBER_REWARD,
    inviteRewardTotal: (inviter.inviteRewardTotal ?? 0) + INVITE_MEMBER_REWARD,
  };
  registry[code] = { user: inviterNext, updatedAt: new Date().toISOString() };
  saveJson(STORAGE_INVITE_REGISTRY, registry);

  hit.memberGranted = true;
  hit.isMember = true;
  hit.memberRewardQuota = INVITE_MEMBER_REWARD;
  hit.rewardStatus = "member_rewarded";
  saveJson(STORAGE_INVITE_RECORDS, records);
}

export function openLocalInviteBlindBox(user: User): {
  user: User;
  reward: ReturnType<typeof mockInviteBlindBox>;
} | null {
  const count = user.inviteBlindBoxCount ?? 0;
  if (count <= 0) return null;

  const reward = mockInviteBlindBox();
  let next = { ...user, inviteBlindBoxCount: count - 1 };

  if (reward.type === "quota" && reward.amount) {
    next = {
      ...next,
      bonusQuota: next.bonusQuota + reward.amount,
      inviteRewardTotal: (next.inviteRewardTotal ?? 0) + reward.amount,
    };
  }

  saveInviteRegistryUser(next);
  return { user: next, reward };
}
