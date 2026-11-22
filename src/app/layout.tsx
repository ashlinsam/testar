import type { Metadata, Viewport } from "next";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { site } from "@/lib/tapes";

export const metadata: Metadata = {
  title: "21 Tapes",
  description: `21 tapes. 21 voices. For ${site.recipient}.`,
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "21 Tapes", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2a201b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <body>
        <div className="desk" aria-hidden />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
