"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { STORAGE_INVITE_PENDING } from "@/lib/constants/v1";

export function InviteCapture() {
  const params = useSearchParams();
  useEffect(() => {
    const code = params.get("invite_code")?.trim();
    if (code) {
      localStorage.setItem(STORAGE_INVITE_PENDING, code.toUpperCase());
    }
  }, [params]);
  return null;
}
