"use client";

import { useSyncExternalStore } from "react";
import { site } from "@content/site";
import { asset, musicAllowed } from "@/core/platform";
import { audioContext, unlockAudio } from "./sfx";
import { voice } from "./voice";

/**
 * Background music: one playlist, one <audio> element, for the whole visit.
 *
 * - Starts only after the visitor turns sound on (or, if they turned it on
 *   before, at their next tap: never on its own).
 * - Plays the songs in order and loops. Never restarts on navigation.
 * - Ducks under the voice recordings, and comes back up when a voice stops.
 * - Turning it off fades out and pauses in place; turning it on resumes there.
 *
 * Volume runs through the Web Audio API where possible, because iPhone Safari
 * ignores volume on <audio>. The voice recordings never pass through here.
 */

const config = site.music ?? { tracks: [], volume: 0.2, ducked: 0.06 };
const tracks = musicAllowed ? config.tracks : [];
const PREFS_KEY = "21-tapes:music:v1";

const FADE_IN = 1.8;
const FADE_OUT = 0.8;
const DUCK_DOWN = 0.65;
const DUCK_UP = 1.2;
/** Brief gaps between tapes (stop, then load the next) shouldn't bring the music up. */
const UNDUCK_DELAY = 350;

type Prefs = { on: boolean; scale: number; track: number; time: number };
export type MusicState = {
  available: boolean;
  /** The visitor wants music. */
  on: boolean;
  /** It is actually sounding. */
  playing: boolean;
  /** Waiting for a tap before the browser will let it play. */
  waiting: boolean;
  /** Visitor's volume, 0–2 (1 = the level set in content/site.ts). */
  scale: number;
  track: number;
  ducked: boolean;
};

let state: MusicState = {
  available: tracks.length > 0,
  on: false,
  playing: false,
  waiting: false,
  scale: 1,
  track: 0,
  ducked: false,
};
const SERVER_STATE = state;
const listeners = new Set<() => void>();
let loaded = false;
let resumeAt = 0;

let el: HTMLAudioElement | null = null;
let gain: GainNode | null = null;
let starting = false;
let pauseTimer: ReturnType<typeof setTimeout> | null = null;
let unduckTimer: ReturnType<typeof setTimeout> | null = null;
let volumeTween = 0;
let pausedByVisibility = false;
let lastSave = 0;

function set(patch: Partial<MusicState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

// ------------------------------------------------------------- preferences
function loadPrefs() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const p = JSON.parse(localStorage.getItem(PREFS_KEY) || "null") as Prefs | null;
    if (p) {
      const track = Number.isInteger(p.track) && p.track >= 0 && p.track < tracks.length ? p.track : 0;
      resumeAt = Number.isFinite(p.time) ? p.time : 0;
      // A saved "on" only marks it as waiting for a tap; it never starts by itself.
      state = { ...state, on: !!p.on && state.available, waiting: !!p.on && state.available, scale: clampScale(p.scale), track };
    }
  } catch {
    /* unavailable: defaults */
  }
}

function savePrefs(force = false) {
  const now = Date.now();
  if (!force && now - lastSave < 4000) return;
  lastSave = now;
  try {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ on: state.on, scale: state.scale, track: state.track, time: el ? el.currentTime : resumeAt } satisfies Prefs),
    );
  } catch {
    /* storage unavailable: preference lasts for this visit */
  }
}

const clampScale = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? Math.max(0, Math.min(2, v)) : 1);

// ------------------------------------------------------------------ levels
function speaking() {
  const s = voice.get().status;
  return s === "playing" || s === "loading";
}

/** Where the music should sit right now. */
function target() {
  if (!state.on) return 0;
  const t = tracks[state.track];
  const base = state.ducked ? config.ducked : config.volume;
  return Math.min(1, base * state.scale * (t?.gain ?? 1));
}

function rampTo(value: number, seconds: number) {
  if (gain) {
    const ctx = gain.context;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(value, now + Math.max(0.01, seconds));
    return;
  }
  // Fallback where Web Audio can't be used: tween the element's own volume.
  if (!el) return;
  cancelAnimationFrame(volumeTween);
  const from = el.volume;
  const start = performance.now();
  const step = (t: number) => {
    if (!el) return;
    const k = Math.min(1, (t - start) / (seconds * 1000));
    el.volume = from + (value - from) * k;
    if (k < 1) volumeTween = requestAnimationFrame(step);
  };
  volumeTween = requestAnimationFrame(step);
}

// ----------------------------------------------------------------- element
function setTrack(i: number, at?: number) {
  if (!el) return;
  const t = tracks[i];
  set({ track: i });
  el.src = asset(t.src);
  const seekTo = at ?? t.start ?? 0;
  if (seekTo > 0) {
    const onMeta = () => {
      if (el && seekTo < (el.duration || Infinity) - 1) el.currentTime = seekTo;
      el?.removeEventListener("loadedmetadata", onMeta);
    };
    el.addEventListener("loadedmetadata", onMeta);
  }
  el.load();
}

function nextTrack() {
  if (!el || !tracks.length) return;
  setTrack((state.track + 1) % tracks.length);
  savePrefs(true);
  if (state.on) {
    el.play().catch(() => set({ waiting: true, playing: false }));
    rampTo(target(), 1);
  }
}

function element() {
  if (el || typeof window === "undefined") return el;
  el = new Audio();
  el.preload = "auto";
  el.setAttribute("playsinline", "");

  // Route through Web Audio for real volume control on iPhone. Not possible
  // from an opaque origin (a sandboxed frame), where the element's own volume is used.
  const ctx = audioContext();
  if (ctx && window.location.origin !== "null") {
    try {
      const source = ctx.createMediaElementSource(el);
      gain = ctx.createGain();
      gain.gain.value = 0;
      source.connect(gain).connect(ctx.destination);
    } catch {
      gain = null;
    }
  }
  if (!gain) el.volume = 0;

  el.addEventListener("ended", nextTrack);
  el.addEventListener("timeupdate", () => {
    const end = tracks[state.track]?.end;
    if (el && end && el.currentTime >= end) nextTrack();
    savePrefs();
  });
  el.addEventListener("playing", () => set({ playing: true, waiting: false }));
  el.addEventListener("pause", () => set({ playing: false }));
  el.addEventListener("error", () => {
    if (!el?.getAttribute("src")) return;
    console.warn(`[21 Tapes] Couldn't play background track "${tracks[state.track]?.title}". Skipping it.`);
    // Skip a broken file; give up quietly if every track fails.
    const failed = (el as HTMLAudioElement & { _fails?: number })._fails ?? 0;
    (el as HTMLAudioElement & { _fails?: number })._fails = failed + 1;
    if (failed + 1 < tracks.length) nextTrack();
    else set({ available: false, on: false, playing: false, waiting: false });
  });

  setTrack(state.track, resumeAt || undefined);

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pagehide", () => savePrefs(true));
  return el;
}

/** Don't keep playing in a hidden tab; pick up again when it's back. */
function onVisibility() {
  if (!el) return;
  if (document.hidden) {
    if (!el.paused) {
      pausedByVisibility = true;
      savePrefs(true);
      el.pause();
    }
  } else if (pausedByVisibility && state.on) {
    pausedByVisibility = false;
    audioContext()?.resume().catch(() => {});
    if (gain) gain.gain.value = 0;
    el.play()
      .then(() => rampTo(target(), 1))
      .catch(() => set({ waiting: true }));
  }
}

// ---------------------------------------------------------------- ducking
let wasSpeaking = false;
function onVoice() {
  const now = speaking();
  if (now === wasSpeaking) return;
  wasSpeaking = now;
  if (unduckTimer) clearTimeout(unduckTimer);
  unduckTimer = null;
  if (now) {
    set({ ducked: true });
    rampTo(target(), DUCK_DOWN);
  } else {
    unduckTimer = setTimeout(() => {
      if (speaking()) return;
      set({ ducked: false });
      rampTo(target(), DUCK_UP);
    }, UNDUCK_DELAY);
  }
}
let voiceHooked = false;
function hookVoice() {
  if (voiceHooked || typeof window === "undefined") return;
  voiceHooked = true;
  voice.subscribe(onVoice);
}

// ------------------------------------------------------------------ public
export const music = {
  get: () => state,

  /** Turn music on. Call from a tap or click. */
  enable(fade = FADE_IN) {
    loadPrefs();
    if (!state.available || starting) return;
    hookVoice();
    unlockAudio();
    const a = element();
    if (!a) return;
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = null;
    set({ on: true, ducked: speaking() });
    savePrefs(true);
    setAudioSession("playback");
    if (!a.paused) {
      rampTo(target(), fade);
      return;
    }
    starting = true;
    if (gain) gain.gain.value = 0;
    else a.volume = 0;
    a.play()
      .then(() => {
        set({ waiting: false });
        rampTo(target(), fade);
      })
      .catch(() => set({ waiting: true, playing: false }))
      .finally(() => {
        starting = false;
      });
  },

  /** Fade out and pause where it is. Voices are unaffected. */
  disable() {
    loadPrefs();
    set({ on: false, waiting: false });
    savePrefs(true);
    rampTo(0, FADE_OUT);
    if (pauseTimer) clearTimeout(pauseTimer);
    pauseTimer = setTimeout(() => {
      if (!state.on) el?.pause();
      setAudioSession("auto");
    }, FADE_OUT * 1000 + 60);
  },

  toggle() {
    if (state.on && !state.waiting) music.disable();
    else music.enable();
  },

  /** 0–2, where 1 is the level set in content/site.ts. */
  setScale(v: number) {
    set({ scale: clampScale(v) });
    savePrefs(true);
    rampTo(target(), 0.25);
  },

  /** Any tap: if they'd chosen music before, this is the gesture that may start it. */
  resumeFromGesture() {
    loadPrefs();
    if (state.on && state.available && (!el || el.paused) && !starting) music.enable(1.5);
  },

  nowPlaying: () => tracks[state.track],
};

function setAudioSession(type: "playback" | "auto") {
  // Safari 16.4+: let the music play alongside the voices even with the silent switch on.
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try {
    if (nav.audioSession) nav.audioSession.type = type;
  } catch {
    /* unsupported */
  }
}

function subscribe(l: () => void) {
  loadPrefs();
  hookVoice();
  listeners.add(l);
  return () => listeners.delete(l);
}

const getSnapshot = () => {
  loadPrefs();
  return state;
};

export function useMusic() {
  return useSyncExternalStore(subscribe, getSnapshot, () => SERVER_STATE);
}

/** For debugging and tests: the current music level, 0–1. */
export function musicLevel() {
  if (gain) return gain.gain.value;
  return el ? el.volume : 0;
}
if (typeof window !== "undefined") (window as unknown as { __music?: object }).__music = { music, musicLevel, get el() { return el; } };
