import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CardSheet } from "@/components/CardSheet";
import { DeckScene } from "@/components/deck/DeckScene";
import { Providers } from "@/components/Providers";

function App() {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const on = () => {
      setHash(window.location.hash.slice(1));
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  if (hash === "cards") return <CardSheet />;
  const id = hash.startsWith("tape-") ? hash.slice(5) : undefined;
  return <DeckScene key={hash.startsWith("tape-") ? hash : "home"} initialId={id} />;
}

createRoot(document.getElementById("root")!).render(
  <Providers>
    <App />
  </Providers>,
);
