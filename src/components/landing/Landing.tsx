"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { Cassette } from "@/components/deck/Cassette";
import { EnableSound } from "@/components/SoundControls";
import { boxOpen, unlockAudio } from "@/lib/sfx";
import { FOR_YOU, reelFor, site, tapes } from "@/lib/tapes";

const SPINE_SHELLS: Record<string, string> = {
  smoke: "#4a4744",
  black: "#1f1e1d",
  ivory: "#d9d1c0",
  clear: "#a9adab",
};

/**
 * The first thing they see: one archival box on the desk, its lid set
 * askew so a single cassette shows through, labelled by hand.
 * Opening it lifts the lid away, shows the 21 tapes standing inside,
 * and hands over to the deck.
 */
export function Landing({ onOpened }: { onOpened: () => void }) {
  const reduce = useReducedMotion();
  const [opening, setOpening] = useState(false);
  const forYou = reelFor(FOR_YOU)!;

  function open() {
    if (opening) return;
    unlockAudio();
    if (reduce) return onOpened();
    setOpening(true);
    boxOpen();
    setTimeout(onOpened, 1650);
  }

  return (
    <main className="page flex flex-col">
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between">
        <span className="font-serif text-[22px] tracking-[0.12em] min-[1000px]:text-[24px]">21 TAPES</span>
        <div className="flex items-center gap-5">
          <EnableSound />
          <span className="hidden font-mono text-[10.5px] tracking-[0.16em] text-ivory/50 min-[420px]:inline">FOR {site.recipient.toUpperCase()}</span>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1180px] flex-1 content-center items-center gap-6 py-6 min-[1000px]:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] min-[1000px]:gap-16">
        {/* the box */}
        <motion.div
          className="flex justify-center min-[1000px]:order-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          <div className="landing-object">
            <div className="abox linen">
              <div className="abox__well">
                <div className="abox__spines" aria-hidden>
                  {tapes.map((t) => (
                    <div key={t.number} className="spine" style={{ backgroundColor: SPINE_SHELLS[t.shell ?? "smoke"] }}>
                      <div className="spine__label">
                        <svg viewBox="0 0 20 60" className="h-full w-full" aria-hidden>
                          <text x="10" y="34" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#262422" transform="rotate(-90 10 30)">
                            {t.number}
                          </text>
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
                <motion.div
                  className="abox__tape"
                  style={{ rotate: -1.5 }}
                  animate={opening ? { y: "-3%", scale: 1.015 } : { y: "0%", scale: 1 }}
                  transition={{ delay: 0.55, duration: 0.6, ease: [0.3, 0.6, 0.3, 1] }}
                >
                  <Cassette reel={forYou} title="A cassette labelled For you" />
                </motion.div>
              </div>

              {/* the lid, resting askew */}
              <motion.div
                className="abox__lid linen"
                initial={{ x: "5%", y: "40%", rotate: 3.5 }}
                animate={
                  opening
                    ? { x: ["5%", "5.5%", "34%"], y: ["40%", "34%", "128%"], rotate: [3.5, 2.6, 9], opacity: [1, 1, 0] }
                    : { x: "5%", y: "40%", rotate: 3.5 }
                }
                transition={opening ? { duration: 1.05, times: [0, 0.28, 1], ease: [0.4, 0, 0.3, 1] } : undefined}
                aria-hidden
              >
                <div className="holder">
                  <div className="holder__card">
                    <svg viewBox="0 0 200 84" className="h-full w-full">
                      <text x="100" y="30" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" letterSpacing="4" fill="#262422" fillOpacity="0.6">
                        21 TAPES
                      </text>
                      <text x="100" y="66" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontSize="30" fill="#262422">
                        {site.recipient}
                      </text>
                    </svg>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* the words */}
        <motion.div
          className="text-center min-[1000px]:order-1 min-[1000px]:text-left"
          initial={{ opacity: 0 }}
          animate={{ opacity: opening ? 0 : 1 }}
          transition={opening ? { duration: 0.5 } : { duration: 1, delay: 0.5 }}
        >
          <h1 className="mx-auto max-w-[13ch] font-serif text-[40px] leading-[1.02] text-balance min-[1000px]:mx-0 min-[1000px]:text-[64px]">
            Some things are worth keeping.
          </h1>
          <p className="mt-3 font-serif text-[20px] italic text-ivory/75 min-[1000px]:mt-4 min-[1000px]:text-[24px]">
            21 voices, recorded just for you.
          </p>
          <button type="button" className="btn btn--caps mt-7 min-[1000px]:mt-10" onClick={open} disabled={opening}>
            Open the collection
          </button>
        </motion.div>
      </div>
    </main>
  );
}
