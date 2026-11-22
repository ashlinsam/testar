import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { DeckScene } from "@/components/deck/DeckScene";
import { FOR_YOU, normalizeId, reelFor, tapes } from "@/core/tapes";

type Params = { params: Promise<{ id: string }> };

// Every card's page is built ahead of time, so an NFC tap or QR scan loads instantly.
export function generateStaticParams() {
  return [...tapes.map((t) => ({ id: t.number })), { id: FOR_YOU }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const id = normalizeId((await params).id);
  const reel = id ? reelFor(id) : undefined;
  return { title: reel ? (reel.special ? "For you — 21 Tapes" : `Tape ${reel.number} — 21 Tapes`) : "21 Tapes" };
}

export default async function Page({ params }: Params) {
  const { id: raw } = await params;
  const id = normalizeId(raw);
  if (!id) notFound();
  // /tape/7 goes to /tape/07
  if (id !== raw) permanentRedirect(`/tape/${id}`);
  return <DeckScene initialId={id} />;
}
