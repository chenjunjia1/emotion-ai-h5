import { STORAGE_USER } from "@/lib/constants/v1";
import type { User } from "@/lib/types/v1";

/** 登录成功后立即写入，避免跳转 onboarding 时 context 尚未落盘 */
export function persistUserLocal(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_USER, JSON.stringify(user));
  } catch {
    /* ignore quota */
  }
}

export function readUserLocal(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
