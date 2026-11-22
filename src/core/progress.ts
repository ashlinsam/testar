"use client";

import { useSyncExternalStore } from "react";

/**
 * Listening progress, kept in localStorage so it survives closing the tab.
 * Nothing is ever locked away: heard calls stay playable forever.
 */
type State = {
  heard: string[];
  finalHeard: boolean;
  sfxMuted: boolean;
  /** Lengths learned from playback, for files not measured by `npm run durations`. */
  durations: Record<string, number>;
};

// Bump the version to start everyone with a clean slate.
const KEY = "21-tapes:v2";
const EMPTY: State = { heard: [], finalHeard: false, sfxMuted: false, durations: {} };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  // Always a fresh object, so components can tell "loaded, nothing saved" from the server snapshot.
  state = { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...EMPTY, ...JSON.parse(raw) };
  } catch {
    /* private mode or corrupted value: start fresh */
  }
}

function save() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable: progress lasts for this visit only */
  }
}

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  save();
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  load();
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    load();
    listeners.forEach((fn) => fn());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return state;
};
const getServerSnapshot = () => EMPTY;

export const progress = {
  get: getSnapshot,
  markHeard(id: string) {
    if (state.heard.includes(id)) return;
    set({ heard: [...state.heard, id] });
  },
  markFinalHeard() {
    set({ finalHeard: true });
  },
  setSfxMuted(sfxMuted: boolean) {
    set({ sfxMuted });
  },
  rememberDuration(id: string, seconds: number) {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    if (Math.abs((state.durations[id] ?? 0) - seconds) < 0.5) return;
    set({ durations: { ...state.durations, [id]: seconds } });
  },
  reset() {
    set({ ...EMPTY, sfxMuted: state.sfxMuted });
  },
};

export function useProgress() {
  const s = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    ...s,
    heardSet: new Set(s.heard),
    /** False on the server and during hydration, true once localStorage is read. */
    ready: s !== EMPTY,
  };
}
