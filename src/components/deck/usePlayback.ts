"use client";

import { useEffect, useState } from "react";
import { useVoice, voice } from "@/lib/voice";

/** Current position, updated every frame while playing so the counter and reels stay in step. */
export function usePlaybackTime(active: boolean) {
  const v = useVoice();
  const [t, setT] = useState(0);

  useEffect(() => {
    if (!active) return;
    const el = voice.element();
    const sync = () => setT(voice.currentTime());
    sync();
    el?.addEventListener("seeked", sync);
    el?.addEventListener("timeupdate", sync);
    let raf = 0;
    if (v.status === "playing") {
      const tick = () => {
        sync();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener("seeked", sync);
      el?.removeEventListener("timeupdate", sync);
    };
  }, [active, v.status, v.id]);

  return active ? t : 0;
}
