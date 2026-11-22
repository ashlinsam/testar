/**
 * Shapes for the personal content. You shouldn't need to edit this file,
 * only content/tapes.ts and content/site.ts.
 */

/** Something else they kept, shown as a physical object beside the deck. */
export type Memory =
  /** Any image: a scanned handwritten letter, a ticket, a screenshot, a drawing. */
  | { type: "scan"; src: string; alt: string; caption?: string }
  /** A printed ticket stub, typeset by the site. */
  | { type: "ticket"; title: string; detail?: string; date?: string; admit?: string }
  /** A short written memory, set on a sheet of paper. */
  | { type: "text"; body: string; signoff?: string };

export type Shell = "smoke" | "black" | "ivory" | "clear";

export type Tape = {
  /** "01" to "21". Also the address: /tape/01 */
  number: string;
  /** The friend's name, on the label and in the collection. */
  name: string;
  /**
   * The recording, inside /public, e.g. "/audio/tape-01.m4a".
   * Give a list to offer more than one format: ["/audio/tape-01.m4a", "/audio/tape-01.mp3"].
   */
  audio: string | string[];

  /* ---- the cassette itself ---- */

  /**
   * Your own label artwork, inside /public, e.g. "/labels/tape-01.png".
   * Design it on public/labels/_template.png. Leave out for the typeset label.
   */
  label?: string;
  /**
   * Optional artwork for the back of the cassette, seen when it's flipped over
   * while browsing. Without it, the back shows a plain Side B label (with the
   * caption, if there is one).
   */
  labelB?: string;
  /** Shell plastic. Defaults to smoke. */
  shell?: Shell;
  /** A colour band across the typeset label, if they have a colour that means something. */
  labelColor?: string;
  /** One short line on the typeset label: a date, a dedication, an inside joke. */
  dedication?: string;

  /* ---- what comes with the tape ---- */

  /** A photograph, shown in the deck right under the counter while this tape is in. */
  photo?: string;
  photoAlt?: string;
  /** A short line shown under their name while the tape is in. */
  caption?: string;
  /** A written message from them. Blank lines make paragraphs. */
  note?: string;
  /** How the note is signed. Defaults to their first name. */
  signoff?: string;
  /** Anything else: scans of handwritten letters, tickets, screenshots. */
  memories?: Memory[];

  /**
   * Length in seconds. Optional: `npm run durations` measures every file,
   * and the site also learns it the first time a tape is played.
   */
  duration?: number;
};

/** One song in the background playlist. */
export type MusicTrack = {
  /** Inside /public, e.g. "/audio/background/song.mp3" (.mp3 or .m4a). */
  src: string;
  title: string;
  artist?: string;
  /**
   * Playback level for this song, 0–1, to even out songs mastered at different
   * loudness. The file itself is never altered.
   */
  gain?: number;
  /** Start this many seconds in (to skip silence at the top). */
  start?: number;
  /** Move to the next song at this many seconds (to skip silence at the end). */
  end?: number;
};

export type Site = {
  /** The birthday person's first name. */
  recipient: string;
  /** The hidden 22nd tape, revealed once all 21 have been heard. */
  forYou: {
    audio: string | string[];
    /** Optional label artwork for it. */
    label?: string;
    duration?: number;
  };
  /** The public address, used for the NFC links and QR codes. */
  siteUrl: string;
  /**
   * Background music: plays in order and loops, once the visitor turns sound on.
   * Leave `tracks` empty to have no music (the sound controls then disappear).
   */
  music: {
    tracks: MusicTrack[];
    /** Music level while browsing, 0–1. */
    volume: number;
    /** Music level underneath a voice recording, 0–1. */
    ducked: number;
  };
};
