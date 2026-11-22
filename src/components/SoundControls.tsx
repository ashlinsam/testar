"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { IconMusic, IconSliders } from "@/components/icons";
import { music, useMusic } from "@/lib/music";
import { progress, useProgress } from "@/lib/progress";
import { tick } from "@/lib/sfx";

/**
 * Header sound controls: a music on/off button, and a small panel for the
 * music level and the mechanical effects. Voices are never affected.
 */
export function SoundControls() {
  const m = useMusic();
  const { sfxMuted } = useProgress();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | TouchEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const musicOn = m.on && !m.waiting;
  const track = m.available ? music.nowPlaying() : undefined;

  return (
    <div className="relative flex items-center" ref={panel}>
      {m.available && (
        <button
          type="button"
          onClick={() => music.toggle()}
          aria-pressed={musicOn}
          aria-label={musicOn ? "Background music on. Turn off" : "Background music off. Turn on"}
          title={musicOn ? "Music on" : "Music off"}
          className={`grid h-11 w-11 place-items-center rounded-full transition-colors ${musicOn ? "text-ivory/85" : "text-ivory/45"}`}
        >
          <IconMusic className="h-[19px] w-[19px]" off={!musicOn} />
        </button>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Sound settings"
        className="grid h-11 w-11 place-items-center rounded-full text-ivory/60"
      >
        <IconSliders className="h-[18px] w-[18px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="paper absolute right-0 top-[46px] z-50 w-[250px] rounded-[3px] p-4 text-ink shadow-[0_1px_1px_rgba(0,0,0,.3),0_14px_28px_-8px_rgba(0,0,0,.55)]"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            role="group"
            aria-label="Sound settings"
          >
            {m.available && (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">Music</span>
                  <Switch on={musicOn} onChange={() => music.toggle()} label="Background music" />
                </div>
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.05}
                  value={m.scale}
                  onChange={(e) => music.setScale(Number(e.currentTarget.value))}
                  disabled={!musicOn}
                  aria-label="Music volume"
                  className="mt-3 w-full accent-[#713e43] disabled:opacity-40"
                />
                {track && (
                  <p className="mt-1.5 truncate font-mono text-[10.5px] text-ink/55">
                    {musicOn ? "Now playing: " : "Next up: "}
                    {track.title}
                    {track.artist ? `, ${track.artist}` : ""}
                  </p>
                )}
                <div className="my-3 border-t border-ink/12" />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium">Tape sounds</span>
              <Switch
                on={!sfxMuted}
                onChange={() => {
                  progress.setSfxMuted(!sfxMuted);
                  if (sfxMuted) setTimeout(tick, 0);
                }}
                label="Mechanical tape sounds"
              />
            </div>
            <p className="mt-3 text-[11.5px] leading-snug text-ink/55">The voices always play at full volume.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={`relative h-[26px] w-[44px] rounded-full transition-colors ${on ? "bg-burgundy" : "bg-ink/20"}`}
    >
      <span className={`absolute top-[3px] h-5 w-5 rounded-full bg-[#f6f2ea] shadow transition-[left] ${on ? "left-[21px]" : "left-[3px]"}`} />
    </button>
  );
}

/** The landing page's one sound control: quiet, and entirely optional. */
export function EnableSound() {
  const m = useMusic();
  if (!m.available) return null;
  const musicOn = m.on && !m.waiting;
  return (
    <button
      type="button"
      onClick={() => music.toggle()}
      aria-pressed={musicOn}
      className="flex h-11 items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-ivory/60 active:text-ivory"
    >
      <IconMusic className="h-[15px] w-[15px]" off={!musicOn} />
      {musicOn ? "SOUND ON" : "ENABLE SOUND"}
    </button>
  );
}
