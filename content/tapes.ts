import type { Tape } from "./types";

/**
 * THE 21 TAPES
 * ------------------------------------------------------------------
 * Everything below is a PLACEHOLDER. Replace each entry with the real
 * friend, then put their files in:
 *
 *   public/audio/tape-01.m4a     the recording (.m4a or .mp3)
 *   public/labels/tape-01.png    label artwork (optional, see _template.png)
 *   public/photos/tape-01.jpg    photograph shown under the counter (optional)
 *
 * Only `number`, `name` and `audio` are required. Leave anything else
 * out and it simply won't appear.
 *
 * Run `npm run check` afterwards to confirm every file is in place.
 */
export const tapes: Tape[] = [
  {
    number: "01",
    name: "Friend 01",
    audio: "/audio/tape-01.mp3",
    shell: "clear",
    photo: "/photos/tape-01.jpg",
    photoAlt: "Two friends laughing and mixing drinks at a bar",
    caption: "Placeholder caption for tape 01",
    note: "Placeholder. Their written message goes here, exactly as they wrote it.",
  },
  {
    number: "02",
    name: "Friend 02",
    audio: "/audio/tape-02.m4a",
    shell: "ivory",
    photo: "/photos/tape-02.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 02",
  },
  {
    number: "03",
    name: "Friend 03",
    audio: "/audio/tape-03.m4a",
    photo: "/photos/tape-03.jpg",
    photoAlt: "Placeholder photograph",
    shell: "black",
    labelColor: "#713e43",
  },
  {
    number: "04",
    name: "Friend 04",
    audio: "/audio/tape-04.m4a",
    photo: "/photos/tape-04.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 04",
  },
  {
    number: "05",
    name: "Friend 05",
    audio: "/audio/tape-05.m4a",
    photo: "/photos/tape-05.jpg",
    photoAlt: "Placeholder photograph",
    shell: "clear",
    memories: [{ type: "ticket", title: "Placeholder ticket", detail: "Replace with the real one", date: "Date" }],
  },
  {
    number: "06",
    name: "Friend 06",
    audio: "/audio/tape-06.m4a",
    shell: "ivory",
    photo: "/photos/tape-06.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 06",
  },
  {
    number: "07",
    name: "Friend 07",
    audio: "/audio/tape-07.m4a",
    shell: "black",
    photo: "/photos/tape-07.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 07",
    note: "Placeholder. Their written message goes here, exactly as they wrote it.",
  },
  {
    number: "08",
    name: "Friend 08",
    audio: "/audio/tape-08.m4a",
    photo: "/photos/tape-08.jpg",
    photoAlt: "Placeholder photograph",
    labelColor: "#777967",
  },
  {
    number: "09",
    name: "Friend 09",
    audio: "/audio/tape-09.m4a",
    shell: "clear",
    photo: "/photos/tape-09.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 09",
  },
  {
    number: "10",
    name: "Friend 10",
    audio: "/audio/tape-10.m4a",
    photo: "/photos/tape-10.jpg",
    photoAlt: "Placeholder photograph",
    shell: "ivory",
    memories: [{ type: "text", body: "Placeholder. A short memory they want to share goes here." }],
  },
  {
    number: "11",
    name: "Friend 11",
    audio: "/audio/tape-11.m4a",
    shell: "black",
    photo: "/photos/tape-11.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 11",
  },
  {
    number: "12",
    name: "Friend 12",
    audio: "/audio/tape-12.m4a",
    photo: "/photos/tape-12.jpg",
    photoAlt: "Placeholder photograph",
  },
  {
    number: "13",
    name: "Friend 13",
    audio: "/audio/tape-13.m4a",
    shell: "clear",
    photo: "/photos/tape-13.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 13",
    note: "Placeholder. Their written message goes here, exactly as they wrote it.",
  },
  {
    number: "14",
    name: "Friend 14",
    audio: "/audio/tape-14.m4a",
    photo: "/photos/tape-14.jpg",
    photoAlt: "Placeholder photograph",
    shell: "ivory",
    labelColor: "#713e43",
  },
  {
    number: "15",
    name: "Friend 15",
    audio: "/audio/tape-15.m4a",
    shell: "black",
    photo: "/photos/tape-15.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 15",
  },
  {
    number: "16",
    name: "Friend 16",
    audio: "/audio/tape-16.m4a",
    photo: "/photos/tape-16.jpg",
    photoAlt: "Placeholder photograph",
  },
  {
    number: "17",
    name: "Friend 17",
    audio: "/audio/tape-17.m4a",
    shell: "clear",
    photo: "/photos/tape-17.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 17",
  },
  {
    number: "18",
    name: "Friend 18",
    audio: "/audio/tape-18.m4a",
    photo: "/photos/tape-18.jpg",
    photoAlt: "Placeholder photograph",
    shell: "ivory",
  },
  {
    number: "19",
    name: "Friend 19",
    audio: "/audio/tape-19.m4a",
    shell: "black",
    photo: "/photos/tape-19.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 19",
    note: "Placeholder. Their written message goes here, exactly as they wrote it.",
  },
  {
    number: "20",
    name: "Friend 20",
    audio: "/audio/tape-20.m4a",
    photo: "/photos/tape-20.jpg",
    photoAlt: "Placeholder photograph",
  },
  {
    number: "21",
    name: "Friend 21",
    audio: "/audio/tape-21.m4a",
    shell: "clear",
    photo: "/photos/tape-21.jpg",
    photoAlt: "Placeholder photograph",
    caption: "Placeholder caption for tape 21",
  },
];
