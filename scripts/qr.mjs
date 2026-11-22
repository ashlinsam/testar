// Writes a print-ready QR code for every tape to public/qr/tape-01.svg … tape-21.svg.
//   npm run qr
//   SITE_URL=https://your-domain.com npm run qr   (overrides content/site.ts)
// The /cards page also shows them, generated for whatever address the site is on.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import QRCode from "qrcode";
import { site } from "../content/site.ts";
import { tapes } from "../content/tapes.ts";

const base = (process.env.SITE_URL || site.siteUrl).replace(/\/+$/, "");
const dir = join(import.meta.dirname, "..", "public", "qr");
mkdirSync(dir, { recursive: true });
for (const t of tapes) {
  const svg = await QRCode.toString(`${base}/tape/${t.number}`, { type: "svg", margin: 1, errorCorrectionLevel: "M", color: { dark: "#242424", light: "#0000" } });
  writeFileSync(join(dir, `tape-${t.number}.svg`), svg);
}
console.log(`Wrote ${tapes.length} QR codes for ${base} → public/qr/`);
