type P = { className?: string };

export const IconPlay = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M4.5 2.8v10.4L13 8z" fill="currentColor" />
  </svg>
);
export const IconPause = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <rect x="3.8" y="3" width="2.8" height="10" fill="currentColor" />
    <rect x="9.4" y="3" width="2.8" height="10" fill="currentColor" />
  </svg>
);
export const IconRewind = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <path d="M8 3.2v9.6L1.6 8zM14.6 3.2v9.6L8.2 8z" fill="currentColor" />
  </svg>
);
export const IconStopEject = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden>
    <rect x="2" y="4.5" width="6" height="6" fill="currentColor" />
    <path d="M10 9.2h4.6L12.3 5.6z M10 10.6h4.6v1.4H10z" fill="currentColor" />
  </svg>
);
export const IconTick = ({ className }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3.5 8.5l3 3 6-7" />
  </svg>
);
export const IconSpeaker = ({ className = "h-4 w-4", off = false }: P & { off?: boolean }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7.5h3l4-3.5v12l-4-3.5H3z" fill="currentColor" stroke="none" />
    {off ? <path d="M13.5 7.5l4 5m0-5l-4 5" /> : (<><path d="M13.2 7.2a4 4 0 0 1 0 5.6" /><path d="M15.6 5a7.2 7.2 0 0 1 0 10" /></>)}
  </svg>
);
export const IconBack = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 16 16" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 3 5 8l5 5" />
  </svg>
);

export const IconMusic = ({ className = "h-4 w-4", off = false }: P & { off?: boolean }) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7.5 14.5V4.8l8-1.8v9.7" />
    <circle cx="5.6" cy="14.6" r="2" fill="currentColor" stroke="none" />
    <circle cx="13.6" cy="12.8" r="2" fill="currentColor" stroke="none" />
    {off && <path d="M3 3l14 14" />}
  </svg>
);
export const IconSliders = ({ className = "h-4 w-4" }: P) => (
  <svg viewBox="0 0 20 20" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M4 6h12M4 14h12" />
    <circle cx="8" cy="6" r="1.9" fill="#2a201b" />
    <circle cx="13" cy="14" r="1.9" fill="#2a201b" />
  </svg>
);
