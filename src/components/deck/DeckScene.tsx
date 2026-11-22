"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { IconBack } from "@/components/icons";
import { Landing } from "@/components/landing/Landing";
import { SoundControls } from "@/components/SoundControls";
import { NavLink, replaceUrl } from "@/lib/platform";
import { progress, useProgress } from "@/lib/progress";
import { ejectTape, insertTape, keyClunk, startWhirr, stopWhirr, tick, unlockAudio } from "@/lib/sfx";
import { FOR_YOU, TOTAL, hasKeepsakes, nextUnheard, reelFor, tapes } from "@/lib/tapes";
import { useVoice, voice } from "@/lib/voice";
import { Browse } from "./Browse";
import { Collection } from "./Collection";
import { Deck } from "./Deck";
import { Keepsakes } from "./Keepsakes";
import { usePlaybackTime } from "./usePlayback";

// Bump the version to make everyone see the opening again.
const SESSION_KEY = "21-tapes:open:v2";
let pendingStop: ReturnType<typeof setTimeout> | null = null;

type View = "loading" | "opening" | "collection" | "browse" | "player";
const EJECT_MS = 480;

/**
 * The whole experience, in three places:
 *
 *   COLLECTION  the oak box of 21 tapes (after the landing, once per visit)
 *   BROWSE      one tape picked up and held: look through, turn over, insert
 *   PLAYER      the deck, with that tape in it
 *
 * "/tape/07" (an NFC card or QR code) goes straight to the player with that
 * tape inserted. Moving around updates the address bar without reloading,
 * so the player's address can be reloaded or bookmarked.
 */
export function DeckScene({ initialId }: { initialId?: string }) {
  const reduce = useReducedMotion();
  const p = useProgress();
  const v = useVoice();

  const [view, setView] = useState<View>("loading");
  // collection & browse
  const [browseId, setBrowseId] = useState<string | null>(null);
  const [dir, setDir] = useState(0);
  const [carry, setCarry] = useState(false);
  const [inserting, setInserting] = useState(false);
  const [liftingId, setLiftingId] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);
  // player
  const [deckId, setDeckId] = useState<string | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [stopped, setStopped] = useState(true);
  const [rewinding, setRewinding] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const rewTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeAfterRewind = useRef(false);
  const busy = useRef(false);

  const heardCount = tapes.filter((t) => p.heardSet.has(t.number)).length;
  const allHeard = p.ready && heardCount === TOTAL;
  const ids = [...tapes.map((t) => t.number), ...(allHeard ? [FOR_YOU] : [])];
  const heardAll = new Set([...p.heardSet, ...(p.finalHeard ? [FOR_YOU] : [])]);
  const reel = deckId ? reelFor(deckId) : undefined;
  const mine = !!deckId && v.id === deckId;
  const status = mine ? v.status : "idle";
  const time = usePlaybackTime(mine);
  const duration = (mine ? v.duration : undefined) ?? (deckId ? p.durations[deckId] : undefined) ?? reel?.durationHint;

  const load = useCallback((id: string) => {
    const r = reelFor(id);
    if (r) voice.load(r.id, r.sources, r.special ? "For you" : `${r.number} · ${r.name}`, r.durationHint);
  }, []);

  // ---------------------------------------------------------------- start
  useEffect(() => {
    if (pendingStop) clearTimeout(pendingStop);
    pendingStop = null;
    if (initialId && reelFor(initialId)) {
      setDeckId(initialId);
      setAnimateIn(true);
      setView("player");
      load(initialId);
    } else {
      let opened = false;
      try {
        opened = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {}
      setView(opened ? "collection" : "opening");
    }
    return () => {
      stopWhirr();
      if (rewTimer.current) clearInterval(rewTimer.current);
      pendingStop = setTimeout(() => voice.stop(), 0);
    };
  }, [initialId, load]);

  // The last tape stays hidden until all 21 have been heard.
  useEffect(() => {
    if (deckId === FOR_YOU && p.ready && !allHeard) {
      voice.stop();
      setDeckId(null);
      setNotice("locked");
      setView("collection");
      replaceUrl("/");
    }
  }, [deckId, p.ready, allHeard]);

  // When a recording finishes, file it as heard.
  useEffect(() => {
    if (!mine || v.status !== "ended" || !deckId) return;
    setStopped(true);
    if (deckId === FOR_YOU) {
      progress.markFinalHeard();
      const t = setTimeout(() => setClosing(true), 1100);
      return () => clearTimeout(t);
    }
    progress.markHeard(deckId);
  }, [mine, v.status, deckId]);

  const later = (fn: () => void, ms: number) => setTimeout(fn, reduce ? 0 : ms);

  // ------------------------------------------------- collection ↔ browse
  function pick(id: string) {
    if (busy.current) return;
    busy.current = true;
    unlockAudio();
    tick();
    setNotice(null);
    setLiftingId(id); // it rises in its compartment first
    later(() => {
      setLiftingId(null);
      setDir(0);
      setCarry(true); // …then is carried out to be looked at
      setBrowseId(id);
      setView("browse");
      later(() => {
        setCarry(false);
        busy.current = false;
      }, 650);
    }, 190);
  }

  const navigate = useCallback(
    (step: 1 | -1) => {
      setBrowseId((cur) => {
        if (!cur) return cur;
        const i = ids.indexOf(cur) + step;
        if (i < 0 || i >= ids.length) return cur;
        tick();
        setCarry(false);
        setDir(step);
        return ids[i];
      });
    },
    [ids.length], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const closeBrowse = useCallback(() => {
    if (busy.current) return;
    busy.current = true;
    tick();
    setCarry(true); // so it's carried back into its own compartment
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setView("collection");
        setBrowseId(null);
        later(() => {
          setCarry(false);
          busy.current = false;
        }, 600);
      }),
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ------------------------------------------------------ browse → player
  function insertFromBrowse() {
    if (!browseId || busy.current) return;
    busy.current = true;
    unlockAudio();
    const id = browseId;
    setInserting(true); // it moves off towards the deck
    later(() => {
      setDeckId(id);
      setAnimateIn(true);
      setStopped(true);
      load(id);
      replaceUrl(id === FOR_YOU ? "/tape/for-you" : `/tape/${id}`);
      setView("player");
      setBrowseId(null);
      setInserting(false);
      window.scrollTo(0, 0);
      later(insertTape, 120);
      busy.current = false;
    }, 420);
  }

  // ------------------------------------------------------ player → back
  function ejectThen(next: (id: string) => void) {
    if (!deckId) return next("");
    const id = deckId;
    endRewind(false);
    voice.stop();
    ejectTape();
    setDeckId(null); // the tape rises out of the well
    setStopped(true);
    replaceUrl("/");
    later(() => next(id), EJECT_MS);
  }

  function backToCollection() {
    ejectThen((id) => {
      setReturningId(id || null);
      setView("collection");
      window.scrollTo(0, 0);
      if (id) {
        requestAnimationFrame(() => document.querySelector(`[data-cell="${id}"]`)?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }));
        later(() => setReturningId(null), 900);
      }
    });
  }

  function backToBrowse() {
    ejectThen((id) => {
      if (!id) return setView("collection");
      setDir(0);
      setCarry(false);
      setBrowseId(id);
      setView("browse");
    });
  }

  /** Straight from one tape to another in the deck (after "Next tape"). */
  function swapTo(id: string) {
    endRewind(false);
    voice.stop();
    ejectTape();
    setDeckId(id);
    setStopped(true);
    load(id);
    replaceUrl(`/tape/${id}`);
    later(insertTape, 480);
  }

  // ------------------------------------------------------------ transport
  const handlers = {
    onPlay() {
      keyClunk();
      if (!deckId) return;
      setStopped(false);
      if (status === "paused") voice.resume();
      else if (status !== "playing" && status !== "loading") voice.play(140);
    },
    onPause() {
      keyClunk();
      if (!deckId) return;
      if (status === "playing" || status === "loading") voice.pause();
      else if (status === "paused" && !stopped) voice.resume();
    },
    onStop() {
      keyClunk();
      if (!deckId) return;
      const running = status === "playing" || status === "loading" || (status === "paused" && !stopped);
      if (running) {
        endRewind(false);
        voice.pause();
        voice.seek(0);
        setStopped(true);
      } else {
        // Already stopped: the same key ejects, and the tape goes back in its box.
        setTimeout(backToCollection, 120);
      }
    },
    onRewindTap() {
      if (!deckId) return;
      keyClunk();
      startWhirr();
      setRewinding(true);
      voice.seek(voice.currentTime() - 10);
      setTimeout(() => {
        stopWhirr();
        setRewinding(false);
      }, reduce ? 0 : 420);
    },
    onRewindHold(holding: boolean) {
      if (!deckId) return;
      if (holding) {
        keyClunk();
        resumeAfterRewind.current = status === "playing";
        voice.pause();
        startWhirr();
        setRewinding(true);
        rewTimer.current = setInterval(() => {
          const t = voice.currentTime() - 0.9;
          voice.seek(Math.max(0, t));
          if (t <= 0) endRewind(true);
        }, 80);
      } else endRewind(true);
    },
    onSeek(t: number) {
      voice.seek(t);
    },
  };

  function endRewind(resume: boolean) {
    if (rewTimer.current) clearInterval(rewTimer.current);
    rewTimer.current = null;
    stopWhirr();
    setRewinding(false);
    if (resume && resumeAfterRewind.current) voice.resume();
    resumeAfterRewind.current = false;
  }

  function openCollection() {
    unlockAudio();
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {}
    setView("collection");
  }

  // ---------------------------------------------------------------- views
  if (view === "loading") return <main className="page" />;
  if (view === "opening") return <Landing onOpened={openCollection} />;

  const header = (
    <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between pb-2">
      <span className="font-serif text-[20px] tracking-[0.1em]">21 TAPES</span>
      <div className="flex items-center gap-1">
        <span className="font-mono text-[11px] text-ivory/55">{p.ready ? `${heardCount} of ${TOTAL} heard` : ""}</span>
        <SoundControls />
      </div>
    </header>
  );

  if (view === "player") {
    const next = deckId && deckId !== FOR_YOU ? nextUnheard(new Set([...p.heardSet, deckId]), deckId) : undefined;
    const kept = reel?.tape && hasKeepsakes(reel.tape) ? reel.tape : undefined;
    return (
      <motion.main className="page" key="player" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
        {header}
        <nav className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-x-6 pb-3" aria-label="Collection">
          <button type="button" className="link gap-1 !no-underline" onClick={backToCollection}>
            <IconBack /> Back to collection
          </button>
          <button type="button" className="link" onClick={backToBrowse}>
            Look through the tapes
          </button>
        </nav>

        <div className="mx-auto grid w-full max-w-[1180px] gap-6 min-[1000px]:grid-cols-[minmax(0,640px)_minmax(0,1fr)] min-[1000px]:gap-12">
          <div>
            <Deck
              reel={reel}
              animateIn={animateIn}
              status={status}
              stopped={stopped}
              rewinding={rewinding}
              time={time}
              duration={duration}
              handlers={handlers}
            />
          </div>

          <section className="min-w-0" aria-live="polite">
            {reel ? (
              <div>
                <div className="font-mono text-[11px] tracking-[0.12em] text-ivory/55">
                  {reel.special ? "THE LAST TAPE" : `TAPE ${reel.number} OF ${TOTAL}`}
                </div>
                <h2 className="mt-1.5 font-serif text-[40px] leading-[1.02] min-[1000px]:text-[52px]">{reel.name}</h2>
                {reel.caption && <p className="mt-1.5 font-serif text-[20px] text-ivory/85">{reel.caption}</p>}
                <p className="mt-2 font-serif text-[19px] italic text-ivory/65">
                  {status === "error"
                    ? "This recording couldn't be loaded."
                    : status === "ended"
                      ? "End of the tape. Press play to hear it again."
                      : status === "playing" || status === "loading"
                        ? "Playing."
                        : status === "blocked"
                          ? "Press play again to start the tape."
                          : status === "paused" && !stopped
                            ? "Paused."
                            : "Press play to listen."}
                </p>
                {status === "error" && (
                  <p className="mt-1 text-[14px] text-ivory/65">
                    Check your connection, then{" "}
                    <button type="button" className="link !min-h-0" onClick={() => { load(reel.id); voice.play(); setStopped(false); }}>
                      try again
                    </button>
                    .
                  </p>
                )}
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1">
                  {status === "ended" && next && (
                    <button type="button" className="link" onClick={() => swapTo(next.number)}>
                      Next tape: {next.number}
                    </button>
                  )}
                  <button type="button" className="link" onClick={() => { keyClunk(); backToCollection(); }}>
                    Eject
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-serif text-[19px] italic text-ivory/60 min-[1000px]:pt-6">Back into the box…</p>
            )}

            <AnimatePresence mode="wait">
              {kept && (
                <motion.div key={kept.number} className="mt-6" initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.25 } }}>
                  <Keepsakes tape={kept} />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>

        <Closing open={closing} onClose={() => { setClosing(false); backToCollection(); }} />
      </motion.main>
    );
  }

  // collection, with browse laid over it
  const forYouWaiting = allHeard && !p.finalHeard;
  return (
    <LayoutGroup>
      <motion.main
        className="page flex flex-col"
        key="box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        aria-hidden={view === "browse" || undefined}
      >
        <motion.div animate={{ opacity: view === "browse" ? 0 : 1 }} transition={{ duration: 0.3 }}>
          {header}
        </motion.div>
        <motion.div
          className="mx-auto flex w-full max-w-[1240px] flex-1 flex-col min-[1024px]:justify-center min-[1024px]:pb-[4vh]"
          animate={view === "browse" ? { opacity: 0.35, scale: 0.985 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <section className="pb-5 pt-3 min-[1024px]:pb-7 min-[1024px]:pt-6">
            <h1 className="font-serif text-[38px] leading-[1.02] min-[1024px]:text-[52px]">A collection, just for you.</h1>
            <p className="mt-2 max-w-[44ch] font-serif text-[19px] italic leading-snug text-ivory/75 min-[1024px]:text-[22px]">
              21 voices. 21 little pieces of everyone who loves you.
            </p>
            {notice === "locked" && (
              <p className="mt-3 text-[14px] text-ivory/70">
                That tape isn&rsquo;t in the box yet. It appears once all {TOTAL} have been heard. You&rsquo;ve heard {heardCount}.
              </p>
            )}
            {forYouWaiting && (
              <p className="mt-3 font-serif text-[18px] italic text-ivory/85">There&rsquo;s one more tape at the bottom of the box.</p>
            )}
          </section>

          <Collection
            heard={heardAll}
            outId={browseId}
            liftingId={liftingId}
            returningId={returningId}
            showForYou={allHeard}
            forYouHeard={p.finalHeard}
            onPick={pick}
          />

          <footer className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-0.5">
            <p className="text-[12.5px] text-ivory/50">Tap a tape to pick it up. Listening is saved on this device; every tape can be played again.</p>
            <div className="flex flex-wrap gap-x-5">
              <NavLink href="/cards" className="link !min-h-[36px] text-[12.5px]">
                Card links &amp; QR codes
              </NavLink>
              <button
                type="button"
                className="link !min-h-[36px] text-[12.5px]"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(SESSION_KEY);
                  } catch {}
                  window.scrollTo(0, 0);
                  setView("opening");
                }}
              >
                See the opening again
              </button>
            </div>
          </footer>
        </motion.div>
      </motion.main>

      <AnimatePresence>
        {view === "browse" && browseId && (
          <Browse
            key="browse"
            ids={ids}
            currentId={browseId}
            dir={dir}
            carryLayout={carry}
            inserting={inserting}
            heard={heardAll}
            onNavigate={navigate}
            onClose={closeBrowse}
            onInsert={insertFromBrowse}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}

function Closing({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-8 text-center"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(62,46,36,.97), rgba(26,19,15,.99))" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="closing-title"
        >
          <div className="max-w-[420px]">
            <motion.h2 id="closing-title" className="font-serif text-[60px] leading-none" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 1.2 }}>
              Happy 21st.
            </motion.h2>
            <motion.p className="mt-5 font-serif text-[24px] italic text-ivory/80" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4, duration: 1.2 }}>
              Some things are worth keeping.
            </motion.p>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.8, duration: 1 }}>
              <button type="button" onClick={onClose} className="btn mt-12">
                Return to the collection
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

