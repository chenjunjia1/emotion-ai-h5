"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TreeholeLampScene } from "@/components/layout/treehole-lamp-scene";
import { applyTreeholeNightViewport } from "@/lib/hooks/use-treehole-night";
import { cn } from "@/lib/utils";

function isTreeholeRoute(pathname: string, mode: string | null): boolean {
  return (
    pathname.startsWith("/emotion-chat") &&
    mode !== "strategist" &&
    mode !== "assistant"
  );
}

type Phase = "hidden" | "nightfall" | "dawn";

/** 拉灯切树洞 / 开灯回浅色 Tab */
const NIGHTFALL_MS = 920;
const DAWN_MS = 860;

export function TreeholeRouteTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = pathname.startsWith("/emotion-chat") ? searchParams.get("mode") : null;
  const isTreehole = isTreeholeRoute(pathname, mode);

  const mounted = useRef(false);
  const prevRef = useRef({ isTreehole: false });
  const [phase, setPhase] = useState<Phase>("hidden");

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      prevRef.current = { isTreehole };
      return;
    }

    const wasTreehole = prevRef.current.isTreehole;

    if (!wasTreehole && isTreehole) {
      applyTreeholeNightViewport(true);
      setPhase("nightfall");
      const t = window.setTimeout(() => setPhase("hidden"), NIGHTFALL_MS);
      prevRef.current = { isTreehole };
      return () => window.clearTimeout(t);
    }

    if (wasTreehole && !isTreehole) {
      applyTreeholeNightViewport(false);
      setPhase("dawn");
      const t = window.setTimeout(() => setPhase("hidden"), DAWN_MS);
      prevRef.current = { isTreehole };
      return () => window.clearTimeout(t);
    }

    prevRef.current = { isTreehole };
  }, [isTreehole]);

  if (phase === "hidden") return null;

  return (
    <div
      className={cn(
        "treehole-route-overlay pointer-events-none fixed inset-0 z-[200] flex justify-center",
        phase === "nightfall" && "treehole-route-overlay--nightfall",
        phase === "dawn" && "treehole-route-overlay--dawn"
      )}
      aria-hidden
    >
      <div className="treehole-route-overlay__frame mx-auto h-full w-full max-w-[430px]">
        <TreeholeLampScene dawn={phase === "dawn"} />
      </div>
    </div>
  );
}
