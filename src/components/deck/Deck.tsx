"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { IconPause, IconPlay, IconRewind, IconStopEject } from "@/components/icons";
import { asset } from "@/core/platform";
import type { Reel } from "@/core/tapes";
import { formatTime } from "@/core/tapes";
import type { VoiceStatus } from "@/core/voice";
import { Cassette } from "./Cassette";
import { Counter } from "./Counter";

export type DeckHandlers = {
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRewindTap: () => void;
  onRewindHold: (holding: boolean) => void;
  onSeek: (t: number) => void;
};

/**
 * The cassette deck. A dark well behind a smoked door holds the tape;
 * piano keys below. PLAY stays latched down while the tape plays and
 * PAUSE while it's paused, as on a mechanical deck.
 */
export function Deck({
  reel,
  animateIn,
  status,
  stopped,
  rewinding,
  time,
  duration,
  handlers,
}: {
  reel?: Reel;
  /** Slide the tape in when the deck first appears (arriving from the collection or an NFC card). */
  animateIn?: boolean;
  status: VoiceStatus;
  /** Stopped with STOP (as opposed to paused). */
  stopped: boolean;
  rewinding: boolean;
  time: number;
  duration?: number;
  handlers: DeckHandlers;
}) {
  const playing = status === "playing" || status === "loading";
  const motionState = rewinding ? "rewind" : status === "playing" ? "play" : "stop";
  const progress = duration ? time / duration : 0;
  const hold = useRef<{ timer: ReturnType<typeof setTimeout>; held: boolean } | null>(null);
  const lastPointer = useRef(0);

  function rewDown(e: React.PointerEvent) {
    if (!reel) return;
    lastPointer.current = Date.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const h = { held: false, timer: setTimeout(() => { h.held = true; handlers.onRewindHold(true); }, 280) };
    hold.current = h;
  }
  function rewUp() {
    const h = hold.current;
    if (!h) return;
    lastPointer.current = Date.now(); // the click that follows a release isn't a second tap
    clearTimeout(h.timer);
    hold.current = null;
    if (h.held) handlers.onRewindHold(false);
    else handlers.onRewindTap();
  }

  return (
    <div className="deck">
      <div className="deck__face">
        <div className="mb-2.5 flex items-baseline justify-between px-0.5">
          <span className="engraved !text-[10px] !tracking-[0.3em] text-[#2f2e2b]">21 Tapes</span>
          <span className="engraved !text-[8px] text-[#57554f]">Stereo cassette deck</span>
        </div>

        <div className="deck__main">
          <div className="well" aria-live="polite">
            <AnimatePresence mode="wait" initial={!!animateIn}>
              {reel ? (
                <motion.div
                  key={reel.id}
                  className="relative h-full"
                  initial={{ y: "-130%" }}
                  animate={{ y: "0%" }}
                  exit={{ y: "-130%" }}
                  transition={{ duration: 0.5, ease: [0.3, 0.6, 0.25, 1] }}
                >
                  <Cassette reel={reel} progress={progress} motion={motionState} title={reel.special ? "The last tape, For you" : `Tape ${reel.number}, ${reel.name}`} />
                </motion.div>
              ) : (
                <motion.div key="empty" className="well__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <span className="engraved !text-[8.5px]">No tape</span>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="well__glass" />
          </div>

          <div className="flex min-w-0 flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="engraved !text-[8px] text-[#57554f]">Counter</span>
              <Counter value={reel ? time : 0} />
            </div>
            {/* the photo that belongs to this tape, right under the counter */}
            <div className="snap">
              <AnimatePresence initial={false}>
                {reel?.photo ? (
                  <motion.img
                    key={reel.photo.src}
                    src={asset(reel.photo.src)}
                    alt={reel.photo.alt}
                    className="snap__img"
                    draggable={false}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.25 }}
                  />
                ) : (
                  <motion.span key="none" className="snap__empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
                )}
              </AnimatePresence>
              <span className="snap__glass" aria-hidden />
            </div>
          </div>
        </div>

        <div className="mt-2.5">
          <div className="flex items-center gap-3">
            <span className="w-[34px] font-mono text-[10.5px] tabular-nums text-[#3b3a37]">{reel ? formatTime(time) : "0:00"}</span>
            <div className="seek flex-1">
              <div className="seek__track" aria-hidden>
                <div className="seek__fill" style={{ transform: `scaleX(${Math.min(1, progress)})` }} />
              </div>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.1}
                value={Math.min(time, duration || 1)}
                disabled={!reel || !duration}
                onChange={(e) => handlers.onSeek(Number(e.currentTarget.value))}
                aria-label="Position on the tape"
                aria-valuetext={`${formatTime(time)} of ${formatTime(duration)}`}
              />
            </div>
            <span className="w-[34px] text-right font-mono text-[10.5px] tabular-nums text-[#6a6862]">{reel ? formatTime(duration) : "–:––"}</span>
          </div>
        </div>

        <div className="keys" role="group" aria-label="Transport controls">
          <button
            type="button"
            className="key"
            data-down={rewinding || undefined}
            onPointerDown={rewDown}
            onPointerUp={rewUp}
            onPointerCancel={rewUp}
            onClick={() => {
              // keyboards and screen readers click without pointer events
              if (Date.now() - lastPointer.current > 600) handlers.onRewindTap();
            }}
            aria-label="Rewind. Tap to go back 10 seconds, hold to rewind"
            disabled={!reel}
          >
            <span className="key__mark"><IconRewind /></span>
            <span className="key__label">Rew</span>
          </button>
          <button type="button" className="key" data-down={playing && !rewinding} onClick={handlers.onPlay} aria-label="Play" aria-pressed={playing}>
            <span className="key__mark"><IconPlay /></span>
            <span className="key__label">Play</span>
          </button>
          <button
            type="button"
            className="key"
            data-down={status === "paused" && !stopped && !rewinding}
            onClick={handlers.onPause}
            aria-label="Pause"
            aria-pressed={status === "paused" && !stopped}
          >
            <span className="key__mark"><IconPause /></span>
            <span className="key__label">Pause</span>
          </button>
          <button type="button" className="key" onClick={handlers.onStop} aria-label={stopped || !playing ? "Stop, or eject when stopped" : "Stop"}>
            <span className="key__mark"><IconStopEject /></span>
            <span className="key__label">Stop/Ej</span>
          </button>
        </div>
      </div>
    </div>
  );
}
