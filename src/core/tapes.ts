import durations from "@content/durations.json";
import { site } from "@content/site";
import { tapes } from "@content/tapes";
import type { Memory, Shell, Tape } from "@content/types";

export type { Memory, Shell, Tape };
export { site, tapes };

export const TOTAL = tapes.length;
/** The hidden 22nd tape. */
export const FOR_YOU = "for-you";

const measured = durations as Record<string, number>;

/** "7", "07" → "07". "for-you" stays. Anything else → null. */
export function normalizeId(raw: string): string | null {
  if (raw === FOR_YOU) return raw;
  if (!/^\d{1,2}$/.test(raw)) return null;
  const id = raw.padStart(2, "0");
  return tapes.some((t) => t.number === id) ? id : null;
}

export const getTape = (id: string) => tapes.find((t) => t.number === id);
export const sourcesOf = (audio: string | string[]) => (Array.isArray(audio) ? audio : [audio]);
export const firstName = (name: string) => name.split(/\s|&/)[0];

/** Everything the deck needs to know about one tape, the hidden one included. */
export type Reel = {
  id: string;
  number: string;
  name: string;
  sources: string[];
  durationHint?: number;
  label?: string;
  labelB?: string;
  caption?: string;
  shell: Shell;
  labelColor?: string;
  dedication?: string;
  photo?: { src: string; alt: string };
  tape?: Tape;
  special?: boolean;
};

export function reelFor(id: string): Reel | undefined {
  if (id === FOR_YOU)
    return {
      id,
      number: "22",
      name: "For you",
      sources: sourcesOf(site.forYou.audio),
      durationHint: site.forYou.duration ?? measured[id],
      label: site.forYou.label,
      shell: "black",
      special: true,
    };
  const t = getTape(id);
  if (!t) return undefined;
  return {
    id,
    number: t.number,
    name: t.name,
    sources: sourcesOf(t.audio),
    durationHint: t.duration ?? measured[id],
    label: t.label,
    labelB: t.labelB,
    caption: t.caption,
    shell: t.shell ?? "smoke",
    labelColor: t.labelColor,
    dedication: t.dedication,
    photo: t.photo ? { src: t.photo, alt: t.photoAlt ?? `Photograph from ${t.name}` } : undefined,
    tape: t,
  };
}

/** Does this tape come with a written note or other keepsakes? */
export const hasKeepsakes = (t?: Tape) => !!t && !!(t.note || t.memories?.length);

export function nextUnheard(heard: Set<string>, fromId?: string): Tape | undefined {
  const start = fromId ? tapes.findIndex((t) => t.number === fromId) + 1 : 0;
  for (let k = 0; k < tapes.length; k++) {
    const t = tapes[(start + k) % tapes.length];
    if (!heard.has(t.number)) return t;
  }
  return undefined;
}

export function formatTime(seconds: number | undefined) {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return "–:––";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
