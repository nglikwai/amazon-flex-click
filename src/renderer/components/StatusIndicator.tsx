import React from 'react';

type BotStatus = 'stopped' | 'running' | 'success' | 'error';

const StatusIndicator: React.FC<{ status: BotStatus }> = ({ status }) => {
  if (status === 'running') {
    return (
      <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-gh-success/20 animate-spin-slow" />
        <div className="absolute inset-1 rounded-full border border-gh-success/40" />
        <div className="w-4 h-4 rounded-full bg-gh-success animate-pulse-glow" />
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-gh-success/10 border border-gh-success/30 flex items-center justify-center glow-success">
        <svg className="w-7 h-7 text-gh-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-14 h-14 shrink-0 rounded-full bg-gh-danger/10 border border-gh-danger/30 flex items-center justify-center">
        <svg className="w-7 h-7 text-gh-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    );
  }

  // stopped
  return (
    <div className="w-14 h-14 shrink-0 rounded-full bg-gh-bg-tertiary border border-gh-border flex items-center justify-center">
      <div className="w-3 h-3 rounded-full bg-gh-text-muted" />
    </div>
  );
};

export default StatusIndicator;
