"use client";

import { motion } from "motion/react";
import { asset } from "@/core/platform";
import type { Memory, Tape } from "@/core/tapes";
import { firstName } from "@/core/tapes";

/** Anything else they kept with the tape, laid out beside the deck as objects. */
export function Keepsakes({ tape }: { tape: Tape }) {
  const items: React.ReactNode[] = [];
  if (tape.note)
    items.push(
      <div key="note" className="sheet paper w-[min(86vw,360px)]">
        {tape.note.split(/\n\s*\n/).map((para, i) => (
          <p key={i} className="mb-3 font-serif text-[20px] leading-[1.45] last:mb-0">
            {para}
          </p>
        ))}
        <p className="mt-3 text-right font-serif text-[19px] italic text-ink/75">{tape.signoff ?? firstName(tape.name)}</p>
      </div>,
    );
  (tape.memories ?? []).forEach((m, i) => items.push(<MemoryObject key={`m${i}`} m={m} number={tape.number} name={tape.name} />));
  if (!items.length) return null;

  return (
    <div className="flex flex-col items-center gap-5 py-2 min-[1000px]:items-start">
      {items.map((node, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 18, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.4 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.45, delay: 0.35 + i * 0.12, ease: [0.25, 0.6, 0.3, 1] }}
        >
          {node}
        </motion.div>
      ))}
    </div>
  );
}

function MemoryObject({ m, number, name }: { m: Memory; number: string; name: string }) {
  if (m.type === "ticket")
    return (
      <div className="ticket w-[min(82vw,330px)]">
        <div className="px-5 py-4">
          <div className="font-serif text-[26px] leading-tight">{m.title}</div>
          {m.detail && <div className="mt-1 text-[13px] text-ivory/75">{m.detail}</div>}
          {m.date && <div className="mt-3 font-mono text-[12px] tracking-[0.06em] text-ivory/90">{m.date}</div>}
        </div>
        <div className="ticket__stub flex w-[76px] flex-col items-center justify-center gap-2 px-2 py-4 text-center">
          <span className="engraved !text-[8px] leading-tight text-ivory/70">{m.admit ?? "Admit one"}</span>
          <span className="font-mono text-[13px]">№ {number}</span>
        </div>
      </div>
    );
  if (m.type === "scan")
    return (
      <figure className="relative w-[min(80vw,340px)] bg-[#f4f1ea] p-2 shadow-[0_1px_1px_rgba(0,0,0,.3),0_14px_24px_-8px_rgba(0,0,0,.55)]">
        <span className="tape-strip -top-2.5 left-1/2 -translate-x-1/2 -rotate-3" aria-hidden />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(m.src)} alt={m.alt} className="block h-auto w-full" draggable={false} />
        {m.caption && <figcaption className="px-1 pt-2 font-serif text-[16px] italic text-ink/80">{m.caption}</figcaption>}
      </figure>
    );
  return (
    <div className="sheet paper w-[min(86vw,360px)]">
      <p className="font-serif text-[20px] leading-[1.45]">{m.body}</p>
      <p className="mt-3 text-right font-serif text-[19px] italic text-ink/75">{m.signoff ?? firstName(name)}</p>
    </div>
  );
}
