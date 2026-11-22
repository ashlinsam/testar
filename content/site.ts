import type { Site } from "./types";

export const site: Site = {
  recipient: "Sam",
  forYou: {
    audio: "/audio/for-you.m4a",
  },
  // Change this once the site is live, then run `npm run nfc-urls` and `npm run qr`.
  siteUrl: "https://21tapes.example.com",

  music: {
    // Played in this order, then back to the first.
    // `gain` levels each song to the quietest one; `start`/`end` skip silence.
    tracks: [
      { src: "/audio/background/a-couple-minutes.mp3", title: "A Couple Minutes", artist: "Olivia Dean", gain: 0.54, end: 209.6 },
      { src: "/audio/background/like-a-tattoo.mp3", title: "Like a Tattoo", artist: "Sade", gain: 1, start: 0.8, end: 214.6 },
    ],
    // Level while browsing, and underneath a voice. All three songs have vocals,
    // so the ducked level sits about 14 dB below the recordings to keep words clear.
    volume: 0.2,
    ducked: 0.045,
  },
};
