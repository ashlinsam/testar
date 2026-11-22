"use client";

/**
 * Preview-build replacement for src/core/platform.tsx.
 * The preview host only passes #hash links, so /tape/07 becomes #tape-07.
 */

export const toHash = (path: string) =>
  path === "/" ? "" : path.startsWith("/tape/") ? `tape-${path.slice(6)}` : path.replace(/^\//, "");

// The preview host serves .mp3 but not .m4a, so the preview build converts the audio.
export const asset = (path: string) => path.replace(/^\//, "").replace(/\.(m4a|aac)$/i, ".mp3");

/**
 * The shareable preview leaves the background songs out: they're commercial
 * recordings, and the preview is a page hosted for anyone with the link.
 */
export const musicAllowed = false;

export function useNav() {
  return { push: (path: string) => (window.location.hash = toHash(path)) };
}

export function replaceUrl(path: string) {
  try {
    const h = toHash(path);
    window.history.replaceState(window.history.state, "", h ? `#${h}` : window.location.pathname + window.location.search);
  } catch {
    /* some frames refuse; the page works without it */
  }
}

export function NavLink({
  href,
  ...rest
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  "aria-label"?: string;
}) {
  const h = toHash(href);
  return <a href={h ? `#${h}` : "#"} {...rest} />;
}
