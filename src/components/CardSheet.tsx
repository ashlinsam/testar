"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { IconBack } from "@/components/icons";
import { NavLink } from "@/lib/platform";
import { site, tapes } from "@/lib/tapes";

/**
 * Printable reference for making the cards: each tape's link and QR code.
 * Links use the address the site is actually on, so they're right once deployed.
 */
export function CardSheet() {
  const [base, setBase] = useState(site.siteUrl.replace(/\/+$/, ""));
  const [codes, setCodes] = useState<Record<string, string>>({});

  useEffect(() => {
    const origin = window.location.origin;
    const usable = /^https?:/.test(origin) && !/localhost|127\.0\.0\.1|claude/.test(origin);
    const b = usable ? origin : site.siteUrl.replace(/\/+$/, "");
    setBase(b);
    Promise.all(
      tapes.map(async (t) => [
        t.number,
        await QRCode.toString(`${b}/tape/${t.number}`, { type: "svg", margin: 0, errorCorrectionLevel: "M", color: { dark: "#242424", light: "#0000" } }),
      ]),
    ).then((pairs) => setCodes(Object.fromEntries(pairs)));
  }, []);

  return (
    <main className="page print:bg-white print:p-0">
      <div className="mx-auto max-w-[1000px] print:hidden">
        <NavLink href="/" className="link gap-1 !no-underline">
          <IconBack /> Back to the collection
        </NavLink>
        <h1 className="mt-3 font-serif text-[40px] leading-tight">Card links &amp; QR codes</h1>
        <p className="mt-2 max-w-[62ch] text-[14.5px] leading-relaxed text-ivory/70">
          Write each link onto its NFC card as a URL record, and print the QR code on the card as a fallback. These use{" "}
          <span className="font-mono text-[13px] text-ivory">{base}</span>. If that isn&rsquo;t the live address yet, set{" "}
          <span className="font-mono text-[13px]">siteUrl</span> in content/site.ts, or open this page on the live site. Use your browser&rsquo;s Print
          to save a sheet.
        </p>
      </div>

      <ul className="mx-auto mt-6 grid max-w-[1000px] grid-cols-1 gap-3 min-[560px]:grid-cols-2 min-[900px]:grid-cols-3 print:mt-0 print:grid-cols-3 print:gap-2">
        {tapes.map((t) => (
          <li key={t.number} className="paper flex items-center gap-4 rounded-[3px] p-4 print:break-inside-avoid print:border print:border-black/20 print:shadow-none">
            <div className="h-[92px] w-[92px] shrink-0" dangerouslySetInnerHTML={{ __html: codes[t.number] ?? "" }} aria-label={`QR code for tape ${t.number}`} role="img" />
            <div className="min-w-0">
              <div className="font-mono text-[11px] tracking-[0.12em] text-ink/55">TAPE {t.number}</div>
              <div className="truncate font-serif text-[22px] leading-tight">{t.name}</div>
              <div className="mt-1 break-all font-mono text-[10.5px] text-ink/70">
                {base.replace(/^https?:\/\//, "")}/tape/{t.number}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
