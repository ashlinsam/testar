"use client";

import { motion } from "motion/react";
import { FOR_YOU, reelFor, tapes } from "@/core/tapes";
import { Cassette } from "./Cassette";

/** A tiny check, cut into the lining of a compartment whose tape has been heard. */
function HeardMark() {
  return (
    <svg viewBox="0 0 14 12" className="h-[10px] w-[12px]" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.8 6.6l3.1 3 7.2-8" />
    </svg>
  );
}

function Compartment({
  id,
  heard,
  out,
  lifting,
  returning,
  onPick,
  solo,
}: {
  solo?: boolean;
  id: string;
  heard: boolean;
  /** The tape is out of the box (being browsed or in the deck). */
  out: boolean;
  lifting: boolean;
  returning: boolean;
  onPick: (id: string) => void;
}) {
  const reel = reelFor(id)!;
  const label = reel.special ? "For you, the last tape" : `Tape ${reel.number}, ${reel.name}`;
  return (
    <li className={`cell ${solo ? "cell--solo" : ""}`} data-cell={id}>
      {!out && (
        <button type="button" className="cell__btn" onClick={() => onPick(id)} aria-label={`${label}${heard ? ", heard" : ""}`}>
          <motion.div
            layoutId={`tape-${id}`}
            className="cell__tape"
            initial={returning ? { y: "-14%", scale: 1.06, opacity: 0 } : false}
            animate={lifting ? { y: "-7%", scale: 1.06 } : { y: "0%", scale: 1, opacity: 1 }}
            transition={{ duration: lifting ? 0.18 : returning ? 0.55 : 0.4, ease: [0.25, 0.6, 0.3, 1] }}
            style={lifting ? { filter: "drop-shadow(5px 10px 9px rgba(40,22,10,.45)) drop-shadow(1px 2px 2px rgba(40,22,10,.3))" } : undefined}
          >
            <Cassette reel={reel} />
          </motion.div>
        </button>
      )}
      {!reel.special && <span className="cell__num" aria-hidden>{reel.number}</span>}
      {heard && (
        <span className="cell__mark" aria-hidden>
          <HeardMark />
        </span>
      )}
    </li>
  );
}

/** The custom oak case: 21 ivory-lined compartments, one tape in each. */
export function Collection({
  heard,
  outId,
  liftingId,
  returningId,
  showForYou,
  forYouHeard,
  onPick,
}: {
  heard: Set<string>;
  outId: string | null;
  liftingId: string | null;
  returningId: string | null;
  showForYou: boolean;
  forYouHeard: boolean;
  onPick: (id: string) => void;
}) {
  return (
    <div className="case">
      <ul className="case__grid" aria-label="The collection">
        {tapes.map((t) => (
          <Compartment
            key={t.number}
            id={t.number}
            heard={heard.has(t.number)}
            out={outId === t.number}
            lifting={liftingId === t.number}
            returning={returningId === t.number}
            onPick={onPick}
          />
        ))}
      </ul>
      {showForYou && (
        <motion.ul
          className="case__drawer"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.7, ease: [0.25, 0.6, 0.3, 1] }}
          aria-label="One more tape"
        >
          <Compartment
              solo
              id={FOR_YOU}
              heard={forYouHeard}
              out={outId === FOR_YOU}
              lifting={liftingId === FOR_YOU}
              returning={returningId === FOR_YOU}
              onPick={onPick}
            />
        </motion.ul>
      )}
    </div>
  );
}
