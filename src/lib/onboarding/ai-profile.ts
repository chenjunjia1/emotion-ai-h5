import { STORAGE_AI_PROFILE } from "@/lib/constants/v1";
import {
  normalizeAvatarId,
  ONBOARDING_TRACKS,
  type AiAvatarId,
  type OnboardingTrackId,
} from "./options";

function normalizeTrackId(id: string): OnboardingTrackId {
  if (ONBOARDING_TRACKS.some((t) => t.id === id)) return id as OnboardingTrackId;
  return "other";
}

export interface AiProfile {
  nickname: string;
  avatarId: AiAvatarId;
  trackIds: OnboardingTrackId[];
  completedAt: string;
  /** 用户上传头像（JPEG data URL，仅存本地） */
  customAvatarUrl?: string;
}

function storageKey(userId: string) {
  return `${STORAGE_AI_PROFILE}:${userId}`;
}

export function loadAiProfile(userId: string): AiProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const p = JSON.parse(raw) as AiProfile;
    const rawTracks = Array.isArray(p.trackIds) ? p.trackIds : [];
    const trackIds: OnboardingTrackId[] =
      rawTracks.length > 0
        ? rawTracks.map((id) => normalizeTrackId(String(id)))
        : ["love"];
    const customAvatarUrl =
      typeof p.customAvatarUrl === "string" && p.customAvatarUrl.startsWith("data:image/")
        ? p.customAvatarUrl
        : undefined;
    return { ...p, avatarId: normalizeAvatarId(p.avatarId), trackIds, customAvatarUrl };
  } catch {
    return null;
  }
}

export function saveAiProfile(userId: string, profile: AiProfile): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), JSON.stringify(profile));
}

export function hasCompletedAiProfile(userId: string): boolean {
  return Boolean(loadAiProfile(userId)?.completedAt);
}

export function clearAiProfile(userId: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(storageKey(userId));
}
