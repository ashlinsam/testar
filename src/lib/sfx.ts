"use client";

import { progress } from "./progress";

/**
 * Interface sounds, synthesised in the browser so there are no files to
 * license or load. They never touch the voice recordings, and the sound
 * toggle silences only these.
 *
 * Browsers keep audio locked until the first tap, so a call opened straight
 * from an NFC card rings silently (visually) until it's answered.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noiseBuf: AudioBuffer | null = null;

function context() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.6; // effects stay well under the music and voices
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return ctx;
}

/** The one AudioContext the site uses (shared with the background music). */
export function audioContext() {
  return context();
}

/** Call from any tap. Safe to call repeatedly. */
export function unlockAudio() {
  const c = context();
  if (c && c.state !== "running") c.resume().catch(() => {});
}

export function audioUnlocked() {
  return !!ctx && ctx.state === "running";
}

const muted = () => progress.get().sfxMuted;

function ready() {
  const c = context();
  if (!c || !master || muted() || c.state !== "running") return null;
  return c;
}

function noiseBurst(c: AudioContext, at: number, dur: number, freq: number, q: number, gain: number) {
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = q;
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  src.connect(bp).connect(g).connect(master!);
  src.start(at);
  src.stop(at + dur + 0.02);
}

function thump(c: AudioContext, at: number, freq: number, dur: number, gain: number) {
  const o = c.createOscillator();
  o.type = "sine";
  o.frequency.setValueAtTime(freq * 1.6, at);
  o.frequency.exponentialRampToValueAtTime(freq, at + dur * 0.6);
  const g = c.createGain();
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(gain, at + 0.004);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g).connect(master!);
  o.start(at);
  o.stop(at + dur + 0.02);
}

/** A transport key going down: a firm mechanical clunk. */
export function keyClunk() {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  thump(c, t, 110, 0.07, 0.24);
  noiseBurst(c, t, 0.022, 2600, 1.4, 0.16);
  noiseBurst(c, t + 0.03, 0.015, 5200, 3, 0.05);
}

/** A light switch-like tick for small buttons. */
export function tick() {
  const c = ready();
  if (!c) return;
  noiseBurst(c, c.currentTime, 0.012, 4200, 2, 0.08);
}

/** The cassette dropping into the well and the door closing. */
export function insertTape() {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  noiseBurst(c, t, 0.18, 900, 0.7, 0.05);
  noiseBurst(c, t + 0.32, 0.03, 2200, 1.5, 0.2);
  thump(c, t + 0.32, 130, 0.08, 0.22);
  noiseBurst(c, t + 0.44, 0.02, 3400, 2, 0.12);
}

/** The eject spring letting go. */
export function ejectTape() {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  noiseBurst(c, t, 0.02, 3000, 2, 0.18);
  thump(c, t, 160, 0.06, 0.16);
  noiseBurst(c, t + 0.05, 0.16, 1200, 0.8, 0.05);
}

/** A fitted lid lifting off a board box: a soft draw of air, then it's set down. */
export function boxOpen() {
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(380, t);
  lp.frequency.linearRampToValueAtTime(900, t + 0.35);
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.09, t + 0.18);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.48);
  src.connect(lp).connect(g).connect(master!);
  src.start(t);
  src.stop(t + 0.5);
  thump(c, t + 0.86, 90, 0.12, 0.12);
  noiseBurst(c, t + 0.86, 0.06, 700, 0.8, 0.05);
}

let whirr: { stop: () => void } | null = null;

/** The motor spooling tape backwards, until stopWhirr(). */
export function startWhirr() {
  stopWhirr();
  const c = ready();
  if (!c) return;
  const t = c.currentTime;
  const o = c.createOscillator();
  o.type = "sawtooth";
  o.frequency.setValueAtTime(180, t);
  o.frequency.linearRampToValueAtTime(520, t + 0.25);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 900;
  const g = c.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(0.025, t + 0.08);
  o.connect(lp).connect(g).connect(master!);
  o.start(t);
  whirr = {
    stop: () => {
      const n = c.currentTime;
      g.gain.cancelScheduledValues(n);
      g.gain.setTargetAtTime(0, n, 0.03);
      o.frequency.setTargetAtTime(120, n, 0.05);
      o.stop(n + 0.2);
    },
  };
}

export function stopWhirr() {
  whirr?.stop();
  whirr = null;
}
