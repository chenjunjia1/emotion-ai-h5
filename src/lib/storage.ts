import type { GenerateFormData, GenerateResult } from "./types";
import {
  GENERATE_STORAGE_KEY,
  RESULT_STORAGE_KEY,
} from "./constants";

export function saveGenerateForm(form: GenerateFormData) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GENERATE_STORAGE_KEY, JSON.stringify(form));
}

export function loadGenerateForm(): GenerateFormData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(GENERATE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GenerateFormData;
  } catch {
    return null;
  }
}

export function saveGenerateResult(result: GenerateResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function loadGenerateResult(): GenerateResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RESULT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as GenerateResult;
  } catch {
    return null;
  }
}
