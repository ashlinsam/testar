"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { IconBack } from "@/components/icons";
import { tick } from "@/core/sfx";
import { TOTAL, reelFor } from "@/core/tapes";
import { Cassette } from "./Cassette";

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={flip ? "M6 3l5 5-5 5" : "M10 3 5 8l5 5"} />
  </svg>
);

/**
 * Holding a tape: one cassette, large, over the dimmed box. Look through the
 * collection with the arrows, a swipe or the keyboard; turn it over; or put
 * it in the deck.
 */
export function Browse({
  ids,
  currentId,
  dir,
  carryLayout,
  inserting,
  heard,
  onNavigate,
  onClose,
  onInsert,
}: {
  ids: string[];
  currentId: string;
  /** Direction of the last move, for the slide: 1 next, -1 previous. */
  dir: number;
  /** Shares its layout with the compartment, so picking up and putting back are one motion. */
  carryLayout: boolean;
  inserting: boolean;
  heard: Set<string>;
  onNavigate: (step: 1 | -1) => void;
  onClose: () => void;
  onInsert: () => void;
}) {
  const reduce = useReducedMotion();
  // Each tape you move to arrives face up; only the one in your hands is turned.
  const [turned, setTurned] = useState<string | null>(null);
  const side: "A" | "B" = turned === currentId ? "B" : "A";
  const reel = reelFor(currentId)!;
  const dragged = useRef(0);
  const index = ids.indexOf(currentId);
  const isHeard = heard.has(currentId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (inserting) return;
      if (e.key === "ArrowRight") onNavigate(1);
      else if (e.key === "ArrowLeft") onNavigate(-1);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onNavigate, onClose, inserting]);

  function flip() {
    tick();
    setTurned((t) => (t === currentId ? null : currentId));
  }

  const slide = {
    enter: (d: number) => ({ x: `${d * 46}%`, opacity: 0, scale: 0.94 }),
    center: { x: "0%", opacity: 1, scale: 1 },
    exit: (d: number) => ({ x: `${d * -46}%`, opacity: 0, scale: 0.94 }),
  };

  return (
    <motion.div
      className="browse"
      role="dialog"
      aria-modal="true"
      aria-label={reel.special ? "For you" : `Tape ${reel.number}, ${reel.name}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35, delay: 0.1 } }}
      transition={{ duration: 0.35 }}
    >
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between">
        <button type="button" className="link gap-1 !no-underline" onClick={onClose}>
          <IconBack /> Back to collection
        </button>
        <span className="font-mono text-[12px] tracking-[0.1em] text-ivory/60" aria-live="polite">
          {reel.special ? "FOR YOU" : `${reel.number} / ${String(TOTAL).padStart(2, "0")}`}
        </span>
      </div>

      <div className="relative mx-auto flex w-full max-w-[1000px] flex-1 items-center justify-center gap-6">
        <button type="button" className="arrow hidden shrink-0 place-items-center min-[760px]:grid" onClick={() => onNavigate(-1)} disabled={index <= 0 || inserting} aria-label="Previous tape">
          <Chevron />
        </button>

        <div className="relative w-[min(86vw,580px)]" style={{ perspective: 1400 }}>
          <AnimatePresence custom={dir} initial={false} mode="popLayout">
            <motion.div
              key={currentId}
              custom={dir}
              variants={slide}
              initial="enter"
              animate={inserting ? { y: "40%", scale: 0.62, opacity: 0, x: "0%" } : "center"}
              exit="exit"
              transition={{ duration: inserting ? 0.42 : reduce ? 0 : 0.42, ease: [0.3, 0.6, 0.25, 1] }}
            >
              <motion.div
                layoutId={carryLayout ? `tape-${currentId}` : undefined}
                transition={{ duration: 0.55, ease: [0.25, 0.6, 0.3, 1] }}
                style={{ filter: "drop-shadow(10px 22px 22px rgba(0,0,0,.45)) drop-shadow(2px 4px 4px rgba(0,0,0,.35))" }}
              >
                <motion.div
                  drag={inserting ? false : "x"}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.28}
                  onDragStart={() => {
                    dragged.current = Date.now();
                  }}
                  onDragEnd={(_, info) => {
                    dragged.current = Date.now();
                    if (info.offset.x < -60 || info.velocity.x < -400) onNavigate(1);
                    else if (info.offset.x > 60 || info.velocity.x > 400) onNavigate(-1);
                  }}
                  onTap={() => {
                    // a swipe ends with a pointer-up too; only a still tap turns the tape over
                    if (Date.now() - dragged.current > 250) flip();
                  }}
                  className="cursor-grab touch-pan-y active:cursor-grabbing"
                >
                  <div className="flip-card" data-side={side}>
                    <div className="flip-face">
                      <Cassette reel={reel} title={reel.special ? "For you, side A" : `Tape ${reel.number}, ${reel.name}, side A`} />
                    </div>
                    <div className="flip-face flip-face--b">
                      <Cassette reel={reel} side="B" title={reel.special ? "For you, side B" : `Tape ${reel.number}, ${reel.name}, side B`} />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button type="button" className="arrow hidden shrink-0 place-items-center min-[760px]:grid" onClick={() => onNavigate(1)} disabled={index >= ids.length - 1 || inserting} aria-label="Next tape">
          <Chevron flip />
        </button>
      </div>

      <motion.div
        className="mx-auto w-full max-w-[580px] text-center"
        animate={{ opacity: inserting ? 0 : 1 }}
        transition={{ duration: 0.25 }}
      >
        <div className="font-mono text-[11px] tracking-[0.14em] text-ivory/55">
          {reel.special ? "THE LAST TAPE" : `TAPE ${reel.number}`}
          {isHeard ? " HEARD" : ""}
        </div>
        <h2 className="mt-1 font-serif text-[38px] leading-[1.05] min-[760px]:text-[46px]">{reel.name}</h2>
        <div className="mt-4 flex items-center justify-center gap-3">
          <button type="button" className="arrow grid place-items-center min-[760px]:hidden" onClick={() => onNavigate(-1)} disabled={index <= 0 || inserting} aria-label="Previous tape">
            <Chevron />
          </button>
          <button type="button" className="btn !min-h-[48px]" onClick={flip} disabled={inserting} aria-pressed={side === "B"}>
            {side === "A" ? "Turn it over" : "Back to side A"}
          </button>
          <button type="button" className="arrow grid place-items-center min-[760px]:hidden" onClick={() => onNavigate(1)} disabled={index >= ids.length - 1 || inserting} aria-label="Next tape">
            <Chevron flip />
          </button>
        </div>
        <button type="button" className="btn btn--caps btn--solid mt-4 w-full max-w-[320px]" onClick={onInsert} disabled={inserting}>
          Insert tape
        </button>
      </motion.div>
    </motion.div>
  );
}

