import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page grid place-items-center text-center">
      <div className="max-w-[340px]">
        <p className="font-mono text-[11px] tracking-[0.14em] text-ivory/50">NO TAPE HERE</p>
        <h1 className="mt-4 font-serif text-[36px] leading-tight">There&rsquo;s nothing on this shelf.</h1>
        <p className="mt-3 font-serif text-[19px] italic text-ivory/70">All 21 tapes are in the collection.</p>
        <Link href="/" className="btn mt-8">
          Open the collection
        </Link>
      </div>
    </main>
  );
}
