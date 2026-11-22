"use client";

import { useSyncExternalStore } from "react";
import { asset } from "@/lib/platform";
import { progress } from "./progress";

/**
 * One <audio> element for every recording on the site, so only one voice can
 * ever play at a time and playback survives moving between pages.
 *
 * Recordings are played exactly as supplied: no filters, no processing.
 */

export type VoiceStatus = "idle" | "loading" | "playing" | "paused" | "ended" | "error" | "blocked";

export type VoiceState = {
  id: string | null;
  status: VoiceStatus;
  duration: number | undefined;
  error?: string;
};

const IDLE: VoiceState = { id: null, status: "idle", duration: undefined };

let el: HTMLAudioElement | null = null;
let state: VoiceState = IDLE;
let pendingStart: ReturnType<typeof setTimeout> | null = null;
/** True while a delayed start is running muted, so the UI keeps showing 0:00. */
let warming = false;
const listeners = new Set<() => void>();

function set(patch: Partial<VoiceState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

const MIME: Record<string, string> = {
  m4a: "audio/mp4",
  mp4: "audio/mp4",
  aac: "audio/aac",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  ogg: "audio/ogg",
  oga: "audio/ogg",
  opus: "audio/ogg; codecs=opus",
  webm: "audio/webm",
};

function pickSource(audio: HTMLAudioElement, sources: string[]) {
  for (const src of sources) {
    const ext = src.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
    const type = MIME[ext];
    if (!type || audio.canPlayType(type) !== "") return src;
  }
  return sources[0];
}

function element() {
  if (el || typeof window === "undefined") return el;
  el = new Audio();
  el.preload = "auto";
  el.setAttribute("playsinline", "");
  el.setAttribute("webkit-playsinline", "");

  el.addEventListener("loadedmetadata", () => {
    if (!el || !Number.isFinite(el.duration)) return;
    set({ duration: el.duration });
    if (state.id) progress.rememberDuration(state.id, el.duration);
  });
  el.addEventListener("playing", () => {
    if (!warming) set({ status: "playing" });
  });
  el.addEventListener("waiting", () => {
    if (!warming && state.status === "playing") set({ status: "loading" });
  });
  el.addEventListener("pause", () => {
    if (!warming && state.status !== "ended" && state.status !== "idle") set({ status: "paused" });
  });
  el.addEventListener("ended", () => set({ status: "ended" }));
  el.addEventListener("error", () => {
    if (!el?.getAttribute("src")) return;
    const code = el.error?.code;
    const reason =
      code === 2 ? "network" : code === 3 ? "decode" : code === 4 ? "missing or unsupported" : "unknown";
    console.warn(`[21 Tapes] Couldn't play ${el.currentSrc || el.src} (${reason}).`);
    clearPending();
    set({ status: "error", error: reason });
  });
  return el;
}

function clearPending() {
  if (pendingStart) clearTimeout(pendingStart);
  pendingStart = null;
  if (warming && el) el.muted = false;
  warming = false;
}

function setMediaSession(title: string) {
  if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({ title, artist: "21 Tapes" });
    navigator.mediaSession.setActionHandler("play", () => voice.resume());
    navigator.mediaSession.setActionHandler("pause", () => voice.pause());
  } catch {
    /* unsupported */
  }
}

export const voice = {
  get: () => state,
  /** Listen for changes (used by the background music to duck under voices). */
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  element: () => el,

  /** Prepares a recording without playing it. */
  load(id: string, sources: string[], title: string, durationHint?: number) {
    const a = element();
    if (!a) return;
    if (state.id === id && state.status !== "error") return;
    clearPending();
    a.pause();
    a.src = asset(pickSource(a, sources));
    a.load();
    setMediaSession(title);
    set({ id, status: "idle", duration: durationHint, error: undefined });
  },

  /**
   * Starts playback. Must be called directly inside a tap handler (iOS rule).
   * With `delayMs`, the element starts immediately but muted, which satisfies
   * iOS, then rewinds and unmutes once the pick-up click has finished.
   */
  play(delayMs = 0) {
    const a = element();
    if (!a || !a.getAttribute("src")) return;
    clearPending();
    if (state.status === "ended" || a.ended) a.currentTime = 0;
    set({ status: "loading", error: undefined });

    if (delayMs > 0) {
      warming = true;
      a.muted = true;
    }
    const p = a.play();
    p?.catch((err: DOMException) => {
      clearPending();
      if (err?.name === "NotAllowedError") set({ status: "blocked" });
      else if (err?.name !== "AbortError") set({ status: "error", error: err?.message ?? "unknown" });
    });
    if (delayMs > 0) {
      pendingStart = setTimeout(() => {
        pendingStart = null;
        if (!el) return;
        el.currentTime = 0;
        el.muted = false;
        warming = false;
        set({ status: el.paused ? (state.status === "error" ? "error" : "loading") : "playing" });
      }, delayMs);
    }
  },

  pause() {
    clearPending();
    el?.pause();
  },

  resume() {
    if (!el) return;
    el.play().catch(() => set({ status: "blocked" }));
  },

  replay() {
    if (!el) return;
    clearPending();
    el.currentTime = 0;
    set({ status: "loading" });
    el.play().catch(() => set({ status: "blocked" }));
  },

  seek(t: number) {
    if (!el || !Number.isFinite(t)) return;
    el.currentTime = Math.max(0, Math.min(t, (el.duration || t) - 0.05));
    if (state.status === "ended") set({ status: "paused" });
  },

  /** Stops and forgets the current recording. */
  stop() {
    clearPending();
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
    set(IDLE);
  },

  currentTime() {
    if (!el || warming) return 0;
    return el.currentTime;
  },
};

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useVoice() {
  return useSyncExternalStore(subscribe, voice.get, () => IDLE);
}
