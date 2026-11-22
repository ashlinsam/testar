/**
 * "FOR YOU", lettered by hand in felt-tip: drawn strokes, not a font.
 * Drawn in a 600 × 130 box; place it with a transform.
 */
export const FOR_YOU_STROKES = [
  // F
  "M14 112 C16 82 12 46 15 14",
  "M15 16 C42 11 64 13 84 9",
  "M16 61 C34 58 50 60 66 57",
  // O
  "M146 20 C116 18 101 50 105 74 C109 101 133 116 156 109 C180 101 189 71 181 44 C173 21 153 13 134 23",
  // R
  "M216 113 C217 81 213 45 216 14",
  "M216 17 C251 8 274 22 269 43 C264 63 240 67 219 63",
  "M234 65 C252 83 264 99 279 113",
  // Y
  "M338 15 C348 35 358 51 370 63",
  "M407 12 C392 41 380 59 370 65 C368 83 369 99 368 116",
  // O
  "M459 21 C432 21 418 51 422 75 C426 101 448 116 470 109 C494 101 503 71 495 45 C487 22 468 14 451 25",
  // U
  "M529 15 C525 51 525 81 537 101 C549 117 576 115 586 97 C596 77 596 45 593 12",
];

export function HandLettering({ transform, color = "#1e1c1a", width = 10 }: { transform?: string; color?: string; width?: number }) {
  return (
    <g transform={transform} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={0.93}>
      {FOR_YOU_STROKES.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
}
