import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="drag-region bg-gh-bg-secondary px-6 py-4 border-b border-gh-border flex justify-center items-center">
      <div className="flex items-center gap-3">
        <svg className="w-10 h-10 text-gh-accent" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="14" width="32" height="24" rx="2" stroke="currentColor" strokeWidth="2.5" fill="none"/>
          <path d="M24 6L20 18h6l-4 12" stroke="url(#lightning-gradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          <line x1="14" y1="20" x2="34" y2="20" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="14" y1="26" x2="34" y2="26" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="14" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <circle cx="38" cy="12" r="6" fill="url(#money-gradient)"/>
          <text x="38" y="15.5" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">$</text>
          <defs>
            <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#58a6ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#3fb950" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="money-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3fb950" stopOpacity="1" />
              <stop offset="100%" stopColor="#238636" stopOpacity="1" />
            </linearGradient>
          </defs>
        </svg>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-gh-accent to-gh-success bg-clip-text text-transparent">
          Amazon Flex Slotter V2
        </h1>
      </div>
    </header>
  );
};

export default Header;
