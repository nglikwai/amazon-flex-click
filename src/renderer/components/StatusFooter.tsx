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
    <footer className="bg-gh-bg-secondary px-6 py-4 border-t border-gh-border">
      <div className="flex gap-3 justify-center items-center">
        <button
          className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 text-white ${
            isRunning
              ? 'bg-gh-danger hover:bg-gh-danger-emphasis'
              : 'bg-gh-success hover:bg-gh-success-emphasis'
          }`}
          title={isRunning ? 'Stop' : 'Start'}
          onClick={onToggle}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
            {isRunning ? (
              <rect x="6" y="6" width="12" height="12" rx="1" />
            ) : (
              <path d="M8 5v14l11-7z" />
            )}
          </svg>
        </button>

        <button
          className="w-14 h-14 rounded-xl flex items-center justify-center bg-gh-bg-tertiary border border-gh-border text-gh-text hover:bg-gh-border transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
          title="Settings"
          onClick={onSettings}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
