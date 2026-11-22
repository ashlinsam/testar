"use client";

import { useId } from "react";
import { HandLettering } from "@/components/landing/HandLettering";
import { asset } from "@/core/platform";
import type { Reel, Shell } from "@/core/tapes";

/**
 * A compact cassette at true proportions (100 × 64 mm → 1000 × 640).
 * Every tape shares this shell; the label is where each one differs:
 * the friend's own artwork if supplied, otherwise a typeset paper label.
 */

const SHELLS: Record<Shell, { a: string; b: string; edge: string; opacity: number; label: string }> = {
  smoke: { a: "#55524e", b: "#2e2c2a", edge: "#77736d", opacity: 0.96, label: "#f2ede3" },
  black: { a: "#2b2a28", b: "#141413", edge: "#45433f", opacity: 1, label: "#efe9dd" },
  ivory: { a: "#ebe5d8", b: "#cfc7b6", edge: "#f7f3ea", opacity: 1, label: "#f7f3ea" },
  clear: { a: "#c9ccc9", b: "#8f9391", edge: "#e7e9e7", opacity: 0.72, label: "#f2ede3" },
};

const HUB_L = { x: 362, y: 275 };
const HUB_R = { x: 638, y: 275 };

function Hub({ x, y, id }: { x: number; y: number; id: string }) {
  return (
    <g className="hub">
      <circle cx={x} cy={y} r={36} fill={`url(#${id}-hub)`} stroke="#9c968b" strokeWidth="2" />
      <circle cx={x} cy={y} r={21} fill="#1b1917" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <rect key={a} x={x - 3.5} y={y - 21} width={7} height={9} fill="#efebe2" transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x + 26} cy={y} r={3.2} fill="#7d776c" />
    </g>
  );
}

export function Cassette({
  reel,
  side = "A",
  progress = 0,
  motion = "stop",
  title,
}: {
  reel: Reel;
  /** The back of the cassette, seen when it's flipped over. */
  side?: "A" | "B";
  /** 0–1: how much tape has wound onto the take-up reel. */
  progress?: number;
  motion?: "stop" | "play" | "rewind";
  /** Accessible name; omit when the tape is described elsewhere. */
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  const s = SHELLS[reel.shell];
  const p = Math.max(0, Math.min(1, progress));
  const left = 46 + 80 * (side === "A" ? 1 - p : p);
  const right = 46 + 80 * (side === "A" ? p : 1 - p);
  const art = side === "A" ? reel.label : reel.labelB;
  const labelFill = reel.special ? "#f3eee3" : s.label;
  const ink = "#262422";
  const nameSize = reel.name.length > 18 ? 54 : reel.name.length > 13 ? 66 : 80;
  const photo = reel.photo ? asset(reel.photo.src) : undefined;

  return (
    <svg
      viewBox="0 0 1000 640"
      className="cassette"
      data-motion={motion}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" y1="0" x2="0.3" y2="1">
          <stop offset="0" stopColor={s.a} />
          <stop offset="1" stopColor={s.b} />
        </linearGradient>
        <radialGradient id={`${id}-hub`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#fbf8f1" />
          <stop offset="1" stopColor="#d6d0c4" />
        </radialGradient>
        <linearGradient id={`${id}-pack`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a4033" />
          <stop offset="1" stopColor="#36261e" />
        </linearGradient>
        <clipPath id={`${id}-win`}>
          <rect x="255" y="200" width="490" height="150" rx="24" />
        </clipPath>
        <clipPath id={`${id}-label`}>
          <rect x="70" y="56" width="860" height="388" rx="12" />
        </clipPath>
        <clipPath id={`${id}-sticker`}>
          <rect x="99" y="207" width="138" height="138" />
        </clipPath>
        <clipPath id={`${id}-band`}>
          <rect x="70" y="370" width="860" height="56" />
        </clipPath>
        <linearGradient id={`${id}-bandshade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.42" />
        </linearGradient>
        <mask id={`${id}-labelmask`} maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="640">
          <rect width="1000" height="640" fill="#fff" />
          <rect x="255" y="200" width="490" height="150" rx="24" fill="#000" />
        </mask>
      </defs>

      {/* shell */}
      <g opacity={s.opacity}>
        <rect x="0" y="0" width="1000" height="640" rx="30" fill={`url(#${id}-shell)`} />
        <rect x="3" y="3" width="994" height="634" rx="28" fill="none" stroke={s.edge} strokeOpacity="0.55" strokeWidth="3" />
        {/* head opening area */}
        <path d="M206 640 L246 498 Q250 486 262 486 L738 486 Q750 486 754 498 L794 640 Z" fill="#000" fillOpacity="0.16" />
        <path d="M246 498 Q250 486 262 486 L738 486 Q750 486 754 498" fill="none" stroke={s.edge} strokeOpacity="0.4" strokeWidth="3" />
        <circle cx="318" cy="590" r="15" fill="#0d0c0b" fillOpacity="0.75" />
        <circle cx="682" cy="590" r="15" fill="#0d0c0b" fillOpacity="0.75" />
        <rect x="420" y="560" width="34" height="50" rx="4" fill="#0d0c0b" fillOpacity="0.6" />
        <rect x="546" y="560" width="34" height="50" rx="4" fill="#0d0c0b" fillOpacity="0.6" />
        <rect x="474" y="574" width="52" height="36" rx="4" fill="#0d0c0b" fillOpacity="0.5" />
        {/* screws */}
        {[
          [34, 34],
          [966, 34],
          [34, 606],
          [966, 606],
          [500, 466],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="12" fill="#9b968d" />
            <circle cx={x} cy={y} r="12" fill="none" stroke="#000" strokeOpacity="0.35" strokeWidth="2" />
            <path d={`M${x - 7} ${y} H${x + 7} M${x} ${y - 7} V${y + 7}`} stroke="#4a4740" strokeWidth="2.4" />
          </g>
        ))}
      </g>

      {/* window: tape packs and hubs */}
      <g clipPath={`url(#${id}-win)`}>
        <rect x="255" y="200" width="490" height="150" fill="#141210" />
        <circle cx={HUB_L.x} cy={HUB_L.y} r={left} fill={`url(#${id}-pack)`} style={{ transition: "r .4s linear" }} />
        <circle cx={HUB_R.x} cy={HUB_R.y} r={right} fill={`url(#${id}-pack)`} style={{ transition: "r .4s linear" }} />
        <Hub x={HUB_L.x} y={HUB_L.y} id={id} />
        <Hub x={HUB_R.x} y={HUB_R.y} id={id} />
        {/* the window's own plastic catching light */}
        <rect x="255" y="200" width="490" height="150" fill="#fff" fillOpacity="0.04" />
        <path d="M268 214 L420 214" stroke="#fff" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />
      </g>
      <rect x="255" y="200" width="490" height="150" rx="24" fill="none" stroke="#000" strokeOpacity="0.5" strokeWidth="3" />

      {/* label */}
      <g mask={`url(#${id}-labelmask)`}>
        <rect x="70" y="56" width="860" height="388" rx="12" fill={labelFill} />
        {side === "B" && !art ? (
          <g fill={ink}>
            {/* the back: a plain Side B label, with their caption if there is one */}
            <text x="108" y="142" fontFamily="var(--font-serif)" fontSize={reel.special ? 64 : nameSize * 0.85} fillOpacity="0.85">
              {reel.special ? "For you" : reel.name}
            </text>
            <line x1="104" y1="164" x2="896" y2="164" stroke={ink} strokeOpacity="0.28" strokeWidth="2" />
            <text x="164" y="322" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="128">
              B
            </text>
            <text x="838" y="268" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="5" fillOpacity="0.6">
              SIDE
            </text>
            <text x="838" y="306" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="5" fillOpacity="0.6">
              {reel.special ? "LAST" : reel.number}
            </text>
            <line x1="104" y1="374" x2="896" y2="374" stroke={ink} strokeOpacity="0.3" strokeWidth="2" />
            <line x1="104" y1="422" x2="896" y2="422" stroke={ink} strokeOpacity="0.3" strokeWidth="2" />
            <text
              x="500"
              y="406"
              textAnchor="middle"
              fontFamily={reel.caption ? "var(--font-serif)" : "var(--font-mono)"}
              fontStyle={reel.caption ? "italic" : undefined}
              fontSize={reel.caption ? (reel.caption.length > 44 ? 24 : 30) : 19}
              letterSpacing={reel.caption ? 0 : 5}
              fillOpacity={reel.caption ? 0.9 : 0.55}
            >
              {reel.caption ?? "21 TAPES"}
            </text>
          </g>
        ) : reel.special && !art ? (
          <g>
            <line x1="104" y1="374" x2="896" y2="374" stroke={ink} strokeOpacity="0.2" strokeWidth="2" />
            <line x1="104" y1="422" x2="896" y2="422" stroke={ink} strokeOpacity="0.2" strokeWidth="2" />
            <HandLettering transform="translate(196 66) scale(1.02) rotate(-1.5)" />
          </g>
        ) : art ? (
          <image href={asset(art)} x="70" y="56" width="860" height="388" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-label)`} />
        ) : (
          <g fill={ink}>
            {/* name, set on a ruled line */}
            <text x="108" y="142" fontFamily="var(--font-serif)" fontSize={reel.special ? 84 : nameSize} letterSpacing="0.5">
              {reel.name}
            </text>
            <line x1="104" y1="164" x2="896" y2="164" stroke={ink} strokeOpacity="0.28" strokeWidth="2" />
            {photo ? (
              <>
                {/* their photo, printed small and stuck on the label */}
                <g transform="rotate(-3.5 168 276)">
                  <rect x="94" y="206" width="156" height="156" fill="#000" fillOpacity="0.16" transform="translate(4 5)" />
                  <rect x="90" y="198" width="156" height="156" fill="#f8f5ef" />
                  <image href={photo} x="99" y="207" width="138" height="138" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-sticker)`} />
                  <rect x="99" y="207" width="138" height="138" fill="none" stroke="#000" strokeOpacity="0.15" strokeWidth="1.5" />
                </g>
                <text x="838" y="246" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="5" fillOpacity="0.6">
                  TAPE
                </text>
                <text x="838" y="314" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="62" fontWeight="500">
                  {reel.number}
                </text>
                {/* and a strip of the same photo across the foot of the label */}
                <image href={photo} x="70" y="370" width="860" height="56" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-band)`} />
                <rect x="70" y="370" width="860" height="56" fill={reel.labelColor ?? `url(#${id}-bandshade)`} fillOpacity={reel.labelColor ? 0.55 : 1} />
              </>
            ) : (
              <>
                {/* tape number, either side of the window */}
                <text x="164" y="318" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="118">
                  {reel.number}
                </text>
                <text x="838" y="268" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="5" fillOpacity="0.6">
                  TAPE
                </text>
                <text x="838" y="306" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="19" letterSpacing="5" fillOpacity="0.6">
                  OF 21
                </text>
                {reel.labelColor ? (
                  <rect x="70" y="372" width="860" height="52" fill={reel.labelColor} />
                ) : (
                  <>
                    <line x1="104" y1="374" x2="896" y2="374" stroke={ink} strokeOpacity="0.3" strokeWidth="2" />
                    <line x1="104" y1="422" x2="896" y2="422" stroke={ink} strokeOpacity="0.3" strokeWidth="2" />
                  </>
                )}
              </>
            )}
            <text
              x="500"
              y="406"
              textAnchor="middle"
              fontFamily={reel.dedication ? "var(--font-serif)" : "var(--font-mono)"}
              fontSize={reel.dedication ? 30 : 19}
              fontStyle={reel.dedication ? "italic" : undefined}
              letterSpacing={reel.dedication ? 0 : 5}
              fill={photo || reel.labelColor ? "#f6f2ea" : ink}
              fillOpacity={photo || reel.labelColor || reel.dedication ? 1 : 0.6}
            >
              {reel.dedication ?? (reel.special ? "THE LAST TAPE" : "21 TAPES")}
            </text>
          </g>
        )}
      </g>
      {/* paper edge */}
      <rect x="70" y="56" width="860" height="388" rx="12" fill="none" stroke="#000" strokeOpacity="0.12" strokeWidth="2" mask={`url(#${id}-labelmask)`} />
    </svg>
  );
}
