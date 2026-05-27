"use client";

import { cn } from "@/lib/utils";
import { TreeholeNightLantern } from "@/components/layout/treehole-night-lantern";

/** Tab 切换树洞 · 居中拉灯场景 */
export function TreeholeLampScene({ dawn }: { dawn?: boolean }) {
  return (
    <div
      className={cn("treehole-lamp-scene", dawn && "treehole-lamp-scene--dawn")}
      aria-hidden
    >
      <div className="treehole-lamp-room" />
      <div className="treehole-lamp-darkness" />
      <div className="treehole-lamp-pool" />
      <TreeholeNightLantern size="lg" hanging />
      <p className="treehole-lamp-caption">轻拉一下，进入树洞</p>
    </div>
  );
}
