import type { Metadata } from "next";
import { CardSheet } from "@/components/CardSheet";

export const metadata: Metadata = { title: "Card links & QR codes — 21 Tapes" };

export default function Page() {
  return <CardSheet />;
}
