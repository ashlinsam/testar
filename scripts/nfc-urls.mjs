// Prints the 21 links to write onto the NFC cards.
//   npm run nfc-urls
//   SITE_URL=https://your-domain.com npm run nfc-urls   (overrides content/site.ts)
import { site } from "../content/site.ts";
import { tapes } from "../content/tapes.ts";

const base = (process.env.SITE_URL || site.siteUrl).replace(/\/+$/, "");
console.log("Tape  Name                      Link");
for (const t of tapes) console.log(`${t.number}    ${t.name.padEnd(24)}  ${base}/tape/${t.number}`);
console.log(`\nWithout the cards: ${base}/`);
