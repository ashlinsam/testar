// Measures every recording with ffprobe and writes content/durations.json,
// so the collection can show lengths before a tape has ever been played.
//   npm run durations
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { site } from "../content/site.ts";
import { tapes } from "../content/tapes.ts";

const pub = join(import.meta.dirname, "..", "public");
const first = (a) => (Array.isArray(a) ? a : [a]).find((p) => existsSync(join(pub, p)));
const probe = (f) =>
  Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim());

const out = {};
for (const t of [...tapes.map((t) => ({ id: t.number, audio: t.audio })), { id: "for-you", audio: site.forYou.audio }]) {
  const f = first(t.audio);
  if (!f) { console.warn(`  missing audio for ${t.id}`); continue; }
  try { out[t.id] = Math.round(probe(join(pub, f)) * 10) / 10; }
  catch { console.warn(`  couldn't measure ${f} (is ffprobe installed?)`); }
}
writeFileSync(join(import.meta.dirname, "..", "content", "durations.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Measured ${Object.keys(out).length} recordings → content/durations.json`);
