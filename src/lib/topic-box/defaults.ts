import { ONBOARDING_TRACKS } from "@/lib/onboarding/options";
import { loadAiProfile } from "@/lib/onboarding/ai-profile";
import {
  GOAL_VALUES,
  PLATFORM_VALUES,
  STYLE_VALUES,
  TRACK_VALUES,
} from "@/lib/i18n/form-options";

export function defaultTopicBoxTrack(userId?: string | null): string {
  if (!userId) return TRACK_VALUES[3];
  const profile = loadAiProfile(userId);
  const id = profile?.trackIds?.[0];
  if (!id) return TRACK_VALUES[3];
  const match = ONBOARDING_TRACKS.find((t) => t.id === id);
  const track = match?.track;
  if (track && (TRACK_VALUES as readonly string[]).includes(track)) {
    return track;
  }
  return TRACK_VALUES[3];
}

export function defaultTopicBoxInput(userId?: string | null) {
  return {
    platform: PLATFORM_VALUES[0],
    track: defaultTopicBoxTrack(userId),
    goal: GOAL_VALUES[0],
    style: STYLE_VALUES[0],
  };
}
