import React from 'react';

const Header: React.FC = () => (
  <header className="drag-region sticky top-0 z-10 backdrop-blur-md bg-gh-bg/60 border-b border-gh-border/50 px-6 py-3 flex justify-center items-center">
    <div className="no-drag flex items-center gap-2.5">
      {/* Inline icon — matches build/icon.svg */}
      <svg className="w-7 h-7" viewBox="0 0 512 512" fill="none">
        <rect width="512" height="512" rx="112" fill="url(#h-bg)"/>
        <path d="M216 110 L176 260 H252 L200 402" stroke="url(#h-bolt)" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="366" cy="150" r="72" fill="url(#h-badge)"/>
        <text x="366" y="178" textAnchor="middle" fill="#0a0d14" fontSize="80" fontWeight="900" fontFamily="-apple-system, Arial, sans-serif">$</text>
        <defs>
          <linearGradient id="h-bg" x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0c1018"/>
            <stop offset="100%" stopColor="#080c12"/>
          </linearGradient>
          <linearGradient id="h-bolt" x1="216" y1="110" x2="200" y2="402" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4d9fff"/>
            <stop offset="100%" stopColor="#2dde84"/>
          </linearGradient>
          <linearGradient id="h-badge" x1="294" y1="78" x2="438" y2="222" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2dde84"/>
            <stop offset="100%" stopColor="#1aad62"/>
          </linearGradient>
        </defs>
      </svg>

      <span className="text-sm font-semibold tracking-wide text-gh-text">Flex Slotter</span>
      <span className="text-xs px-1.5 py-0.5 rounded bg-gh-bg-tertiary/80 border border-gh-border/60 text-gh-text-muted font-mono">v3</span>
    </div>
  </header>
);

export default Header;
