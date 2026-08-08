import React from 'react';
import { BotStatus } from '../hooks/useBot';

interface Props {
  status: BotStatus;
  onToggle: () => void;
  onSettings: () => void;
}

export default function StatusFooter({ status, onToggle, onSettings }: Props) {
  const isRunning = status === 'running';

  return (
    <footer className="sticky bottom-0 z-10 backdrop-blur-md bg-gh-bg/60 border-t border-gh-border/50 px-6 py-4">
      <div className="flex gap-3 justify-center items-center">
        <button
          onClick={onToggle}
          title={isRunning ? 'Stop' : 'Start'}
          className={`w-13 h-13 rounded-xl flex items-center justify-center transition-all duration-200 text-white font-medium
            ${isRunning
              ? 'bg-gh-danger/90 hover:bg-gh-danger border border-gh-danger/40 hover:glow-danger'
              : 'bg-gh-success/90 hover:bg-gh-success border border-gh-success/40 hover:glow-success'
            } hover:-translate-y-0.5 active:translate-y-0`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            {isRunning
              ? <rect x="6" y="6" width="12" height="12" rx="1.5" />
              : <path d="M8 5.14v14l11-7-11-7z" />
            }
          </svg>
        </button>

        <button
          onClick={onSettings}
          title="Settings"
          className="w-13 h-13 rounded-xl flex items-center justify-center bg-gh-bg-secondary/80 border border-gh-border/60 text-gh-text-secondary hover:text-gh-text hover:border-gh-border transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
