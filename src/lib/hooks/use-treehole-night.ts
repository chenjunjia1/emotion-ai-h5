"use client";

import { useCallback, useEffect, useState } from "react";

export const TREEHOLE_NIGHT_STORAGE_KEY = "emotion-treehole-night";
export const TREEHOLE_NIGHT_CHANGE_EVENT = "emotion-treehole-night-change";

export function readTreeholeNight(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(TREEHOLE_NIGHT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function emitTreeholeNightChange() {
  window.dispatchEvent(new Event(TREEHOLE_NIGHT_CHANGE_EVENT));
}

/** 铺满视口深夜背景，避免宽屏两侧露出浅色 body */
export function applyTreeholeNightViewport(enabled: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("treehole-night-viewport", enabled);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", enabled ? "#120a24" : "#FFF7F0");
  }
}

export function useTreeholeNight() {
  const [night, setNight] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNight(readTreeholeNight());
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setNight((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(TREEHOLE_NIGHT_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      emitTreeholeNightChange();
      return next;
    });
  }, []);

  return { night, toggle, ready };
}

/** 底部导航等跨组件同步深夜开关 */
export function useTreeholeNightSynced(): boolean {
  const [night, setNight] = useState(false);

  useEffect(() => {
    const sync = () => setNight(readTreeholeNight());
    sync();
    window.addEventListener(TREEHOLE_NIGHT_CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(TREEHOLE_NIGHT_CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return night;
}