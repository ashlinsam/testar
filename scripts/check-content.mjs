// Checks content/tapes.ts for mistakes and missing files.
//   npm run check
import { existsSync } from "node:fs";
import { join } from "node:path";
import { site } from "../content/site.ts";
import { tapes } from "../content/tapes.ts";

const pub = join(import.meta.dirname, "..", "public");
const list = (a) => (Array.isArray(a) ? a : [a]);
const has = (p) => existsSync(join(pub, p));
let problems = 0;
const fail = (m) => { problems++; console.log(`  ✗ ${m}`); };

if (tapes.length !== 21) fail(`expected 21 tapes, found ${tapes.length}`);
const seen = new Set();
tapes.forEach((t, i) => {
  const want = String(i + 1).padStart(2, "0");
  if (!/^\d{2}$/.test(t.number)) fail(`tape #${i + 1}: number "${t.number}" should be two digits, like "${want}"`);
  if (seen.has(t.number)) fail(`tape ${t.number}: number used twice`);
  seen.add(t.number);
  if (!t.name?.trim()) fail(`tape ${t.number}: missing name`);
  if (!list(t.audio).some(has)) fail(`tape ${t.number} (${t.name}): no audio at ${list(t.audio).join(" or ")}`);
  for (const k of ["label", "labelB", "photo"]) if (t[k] && !has(t[k])) fail(`tape ${t.number}: ${k} not found at ${t[k]}`);
  for (const m of t.memories ?? []) if (m.type === "scan" && !has(m.src)) fail(`tape ${t.number}: scan not found at ${m.src}`);
  if (/^Friend \d\d$/.test(t.name)) console.log(`  · tape ${t.number} still has its placeholder name`);
});
if (!list(site.forYou.audio).some(has)) fail(`"For you" tape: no audio at ${list(site.forYou.audio).join(" or ")}`);
for (const t of site.music?.tracks ?? []) if (!has(t.src)) fail(`background music: "${t.title}" not found at ${t.src}`);
if (site.forYou.label && !has(site.forYou.label)) fail(`"For you" tape: label not found at ${site.forYou.label}`);

console.log(problems ? `\n${problems} problem(s) found.` : "\nAll 21 tapes and the final tape have their files.");
process.exit(problems ? 1 : 0);
