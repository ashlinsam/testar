"use client";

import { MotionConfig } from "motion/react";
import { useEffect } from "react";
import { music } from "@/lib/music";
import { unlockAudio } from "@/lib/sfx";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Effects can be unlocked on the first touch.
    const unlock = () => unlockAudio();
    // iPhone Safari only allows media to start on touchend or click, so the
    // background music (if they chose it before) picks up on those.
    const gesture = () => {
      unlockAudio();
      music.resumeFromGesture();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("touchend", gesture, { passive: true });
    window.addEventListener("click", gesture);
    window.addEventListener("keydown", gesture);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("touchend", gesture);
      window.removeEventListener("click", gesture);
      window.removeEventListener("keydown", gesture);
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
