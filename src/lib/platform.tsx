"use client";

/**
 * Everything that depends on where the site runs: links, the address bar and
 * file paths. The live site uses Next.js routing. The preview build swaps
 * this file for src/preview/platform.tsx, which routes on #hash links.
 */
import NextLink from "next/link";
import { useRouter } from "next/navigation";

export const asset = (path: string) => path;

/** Background music is part of the real site. */
export const musicAllowed = true;

export function useNav() {
  const router = useRouter();
  return { push: (path: string) => router.push(path) };
}

/** Updates the address bar without leaving the page, so /call/007 can be reloaded or bookmarked. */
export function replaceUrl(path: string) {
  if (typeof window !== "undefined" && window.location.pathname !== path) {
    window.history.replaceState(window.history.state, "", path);
  }
}

export function NavLink(props: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  "aria-label"?: string;
}) {
  return <NextLink {...props} />;
}
