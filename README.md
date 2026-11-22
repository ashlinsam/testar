# 21 Tapes

21 tapes. 21 voices. One person worth celebrating.

A personal archive for a 21st birthday: a custom oak collector's box of 21 cassettes, each holding one friend's voice, and a cassette deck to play them on. Each of the 21 cassette-shaped NFC cards opens its tape directly.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20 or newer (`.node-version` pins 22 for hosts that read it). Placeholder recordings and photos are already in place, so everything works straight away.

## Adding the real content

All personal content lives in two files plus `public/`. You never need to touch the interface code. **Every name, caption and note in the project is a placeholder**: replace them all.

### 1. The tapes: `content/tapes.ts`

```ts
{
  number: "07",                         // two digits; also the address /tape/07
  name: "Margot Ellis",
  audio: "/audio/tape-07.m4a",          // or ["/audio/tape-07.m4a", "/audio/tape-07.mp3"]

  // the cassette
  label: "/labels/tape-07.png",         // optional: your own label artwork
  labelB: "/labels/tape-07-b.png",      // optional: artwork for the back, seen when it's turned over
  shell: "clear",                       // smoke (default), black, ivory or clear
  labelColor: "#713e43",                // optional colour band on the typeset label
  dedication: "Byron, June 2023",       // optional line on the typeset label

  // what comes with the tape
  photo: "/photos/tape-07.jpg",         // shown in the deck, right under the counter
  photoAlt: "Margot on the beach",
  caption: "The weekend it rained",     // shown under their name
  note: "Their written message…\n\nA second paragraph…",
  signoff: "M.",
  memories: [
    { type: "scan", src: "/memories/07-letter.jpg", alt: "Handwritten letter", caption: "Kept since 2019" },
    { type: "ticket", title: "Palace Cinema", detail: "Late session", date: "Fri 9 May" },
    { type: "text", body: "A short written memory." },
  ],
}
```

Only `number`, `name` and `audio` are required. Anything you leave out simply doesn't appear. Tapes are single-sided. The **photo** sits in a small window in the deck's faceplate, right under the counter, and changes with whichever tape is in. A **note** or **memories**, if given, are laid out beside the deck while that tape is in.

Scanned handwriting goes in as a `scan`. The site never imitates handwriting with a font.

### 2. Everything else: `content/site.ts`

The recipient's name (it appears on the landing box's label card), the hidden "For you" tape (its audio and optional label art), and the site's public address. The "FOR YOU" lettering on that tape is drawn as pen strokes, not a font. If you'd rather use a scan of real handwriting, give `forYou.label` an image.

### 3. The files

```
public/audio/tape-01.m4a … tape-21.m4a      recordings (.m4a or .mp3)
public/audio/for-you.m4a                    the final tape
public/labels/tape-01.png …                 label artwork (optional)
public/photos/tape-01.jpg …                 photos shown under the counter (optional)
```

- **Audio:** M4A (AAC) or MP3. iPhone voice memos are already `.m4a`. Recordings play exactly as supplied, with no hiss, filtering or processing. Around 64–128 kbps keeps each file small and loading fast.
- **Label artwork:** start from `public/labels/_template.png`. It's the label at 1720 × 760 px, with the window marked: the reels show through there, so keep it clear. Any image at that ratio works. Without artwork, a tape gets the typeset paper label: their name, the tape number, and (if the tape has a photo) a small print of that photo stuck beside the window plus a strip of it along the foot of the label, so every tape looks like its own. `labelColor` tints that strip; `dedication` replaces the words on it.
- **Photos:** JPG, about 1000 px on the long edge. The window under the counter is roughly 4:3 landscape and crops to fill, so keep faces near the middle.

### 4. Background music (optional)

```
public/audio/background/golden-hour.mp3
public/audio/background/a-couple-minutes.mp3
public/audio/background/like-a-tattoo.mp3
```

The playlist lives in `content/site.ts` under `music`. The songs play in that order and loop. Each song has a `gain` that evens out how loud it was mastered (the files themselves are untouched), and optional `start`/`end` times that skip silence. `volume` is the music level while browsing (0.2). `ducked` is its level underneath a voice (0.045, about 14 dB below the recordings). To have no music, empty `tracks` and the sound controls disappear.

How it behaves:

- **Never starts by itself.** *Enable sound* on the landing page (top right) or the ♪ button in the header turns it on, with a 1.8-second fade-in. If they turned it on during an earlier visit, it waits for their first tap, never autoplays.
- **One continuous soundtrack.** It doesn't stop or restart across the landing, the box, browsing, flipping, inserting, playing, rewinding or ejecting.
- **Ducking.** When a voice starts, the music glides down over about 0.65 seconds and keeps playing underneath. When the voice pauses, stops or ends, it comes back up over about 1.2 seconds. Brief gaps between tapes don't make it jump.
- **Controls.** ♪ toggles the music: a fade-out, pausing in place, then resuming from the same spot. The sliders button opens a small panel with the music volume (ducking scales with it) and the tape-sound effects. The voices are never affected by any of these. Preferences are remembered on the device.
- **iPhone.** Music volume runs through the Web Audio API, because iPhone Safari ignores volume settings on audio elements. It pauses when the tab is hidden and picks up again when it's back.

The songs are commercial recordings. Keep the site private (it's already set to `noindex`) and share the address only with the recipient. The shareable preview build leaves them out.

### 5. Check and measure

```bash
npm run check       # every tape has its files; lists any placeholder names still in place
npm run durations   # measures each recording (needs ffmpeg) so the deck knows each length up front
```

## The NFC cards and QR codes

Each card links to one tape:

```
https://your-domain.com/tape/01
…
https://your-domain.com/tape/21
```

1. Deploy first, so the address is final. Then set `siteUrl` in `content/site.ts`.
2. `npm run nfc-urls` prints all 21 links. Write each one to its card as a **URL record** with any NFC app (for example NFC Tools on iPhone). NTAG213 tags are plenty.
3. **QR fallback:** `npm run qr` writes print-ready `public/qr/tape-01.svg` … `tape-21.svg` for the card printer. The site's `/cards` page shows every tape's link and QR code too, generated for whatever address it's opened on, and prints as a sheet.

How the links behave:

- Every `/tape/01`–`/tape/21` page is pre-built, so a tap opens instantly with that tape already in the deck. You press PLAY.
- `/tape/7` redirects to `/tape/07`.
- iPhones (XS and later) read NFC tags in the background with no app: tapping the card shows a banner that opens Safari.
- Without the cards, `/` is the full experience.

## Deploying

Deploy **before** writing the NFC cards, so the links on them are final.

### Render (recommended: a free Static Site)

The site can be built as plain files, so it runs as a Render **Static Site**: free, served from Render's CDN, and never asleep. A card tap opens instantly.

1. Put the project folder in a GitHub repository (private is fine).
2. In Render: **New → Static Site** → choose the repository, with:
   - **Build command:** `npm ci && npm run build:static`
   - **Publish directory:** `out`

   Or use **New → Blueprint** and Render reads these settings from `render.yaml`.
3. When it's live (an address like `https://21-tapes.onrender.com`), put that address in `siteUrl` in `content/site.ts` and push. Then run `npm run nfc-urls` and `npm run qr`, or open `/cards` on the live site.
4. Optional: add your own domain in the service's settings, then use that address instead.

Links on the static build end in a slash (`/tape/07/`). A card written as `/tape/07` still works: it's redirected there. One difference from the server build: `/tape/7` (no leading zero) shows the not-found page, so write the cards with two digits.

**Avoid a free Render *Web Service* for this.** Free web services are spun down after 15 minutes without visits, and the next visit can take 30–60 seconds to load, which is not what you want when Sam taps her first card. If you prefer the server build (`npm run build` / `npm start`), use a paid instance.

### Vercel or others

Vercel runs the server build with no settings (import the repository, deploy). Netlify, Cloudflare Pages, GitHub Pages and any other static host take the `out/` folder from `npm run build:static`.

The site is set to `noindex`, so search engines won't list it.

## How it behaves

The experience moves between three places, in either direction:

```
LANDING → COLLECTION  ⇄  BROWSE  ⇄  PLAYER
```

| | |
|---|---|
| **Landing** | One archival box on the desk, its lid askew over the hand-lettered "FOR YOU" tape. *Open the collection* lifts the lid and leads into the collection. Shown once per visit. |
| **Collection** | The main screen: a custom oak case with ivory-lined compartments, one tape in each, front labels up. 3 × 7 on desktop, 3 columns on tablets, and a 2-column case you scroll on iPhone. Heard tapes get a tiny engraved check in the corner of their compartment. |
| **Picking up a tape** | Tap one: it rises in its compartment, then is carried forward and enlarged while the box dims behind it. Its compartment stays empty while it's out. |
| **Browse** | One tape held up large: number, name, `07 / 21`. Move through the collection with the arrows, the keyboard (← → and Esc), or a swipe on iPhone; each tape slides away as the next comes forward. *Turn it over* (or tap the tape) shows the back: your `labelB` artwork if given, otherwise a plain Side B label with the caption. *Back to collection* carries it back into its own compartment. |
| **Insert tape** | The tape moves off towards the deck, the player appears, and the tape slides down into the cassette well. Press PLAY. |
| **Player** | The same deck as before: PLAY and PAUSE latch, REW taps back 10 seconds or holds to rewind, STOP/EJ stops and then ejects, and the seek bar scrubs. The reels and counter follow the real audio. The tape's photo sits under the counter; any note or keepsakes lie beside the deck. |
| **Leaving the player** | *Back to collection* stops playback, ejects, and returns the tape to its compartment (the page scrolls to it). *Look through the tapes* ejects into Browse at that tape. Eject, or STOP twice, also goes back to the box. |
| **NFC and QR** | `/tape/07` skips the landing, collection and browse: it opens the player with tape 07 sliding in, and waits for PLAY. Reloading keeps the tape. The collection is one tap away. |
| **"For you"** | Once all 21 have been heard, one more compartment appears at the foot of the box. It can also be browsed (after tape 21). After it plays, the closing words appear, then *Return to the collection*. `/tape/for-you` stays locked until then. |
| **Progress** | Saved in the browser's localStorage, on that device. Nothing is ever locked once played. *See the opening again* (under the box) replays the landing. |
| **Sound** | Background music (see above). The box lid, a soft tick when picking up or browsing, key clunks, insert, eject and the rewind motor are synthesised in the browser and sit well under the music; *Tape sounds* in the sound panel mutes them. Nothing ever mutes or lowers the voices. |

### iPhone details

- No audio plays until PLAY is pressed: Safari's rule, and the deck's too.
- Lock-screen controls show the tape number and name while it plays.
- If the phone's silent switch is on, iOS may silence the interface sounds. The recordings still play.
- Respects Reduced Motion: tapes move between places without travelling, reels stay still and the counter doesn't roll; every control works the same.
- In Browse, swiping only moves sideways, so the page never scrolls by accident.

## Project structure

```
content/            ← all personal content (edit these)
  tapes.ts            the 21 tapes
  site.ts             recipient, the "For you" tape, site URL
  durations.json      written by `npm run durations`
  types.ts
public/
  audio/ photos/ labels/   ← recordings, photographs, label artwork
  qr/                 written by `npm run qr`
  textures/           walnut, oak, paper, grain (part of the design)
src/
  app/                routes: /  /tape/[id]  /cards
  components/
    landing/          the archival box landing page and the hand-lettered label
    deck/             DeckScene (the three views), Collection, Browse, Deck, Cassette, Counter, Keepsakes
    CardSheet.tsx     printable links and QR codes
  lib/
    voice.ts          the single shared <audio> element for the recordings
    music.ts          the background playlist: fades, ducking, preferences
    sfx.ts            synthesised mechanical sounds
    progress.ts       localStorage progress
    platform.tsx      links, address bar and file paths (swapped for the preview build)
    tapes.ts          helpers
  preview/            entry point for the shareable preview build
scripts/              check, durations, nfc-urls, qr, build-preview, placeholder generator
```

### The preview build

`npm run preview:build` writes a single-page version of the same site to `preview-dist/`, using `#tape-07` links instead of `/tape/07` and MP3 audio (made with ffmpeg). It's only for sharing a look before launch. The real site, the NFC cards and the QR codes use the Next.js build.

Placeholder audio and photos were made by `scripts/generate-placeholders.py`. Re-running it overwrites `public/audio` and `public/photos`, so don't run it once the real files are in.

Typefaces (Instrument Serif, Inter, IBM Plex Mono) are bundled locally via Fontsource under the SIL Open Font License. Every texture and sound is generated, so there are no third-party image or audio licences to worry about.
