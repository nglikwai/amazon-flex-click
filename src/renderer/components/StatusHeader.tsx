import React from 'react';
import StatusIndicator from './StatusIndicator';

type BotStatus = 'stopped' | 'running' | 'success' | 'error';

interface StatusHeaderProps {
  status: BotStatus;
  title: string;
  message: string;
  currentEarnings?: number;
}

const StatusHeader: React.FC<StatusHeaderProps> = ({ status, title, message, currentEarnings }) => {
  return (
    <div className="flex items-center gap-4 pb-4 border-b border-gh-border shrink-0">
      <StatusIndicator status={status} />

      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold text-gh-text truncate">{title}</h2>
        <p className="text-sm text-gh-text-secondary truncate">{message}</p>
      </div>

      {currentEarnings !== undefined && currentEarnings > 0 && status === 'running' && (
        <div className="flex flex-col items-end shrink-0">
          <span className="text-xs text-gh-text-muted uppercase tracking-wide">Target</span>
          <span className="text-xl font-bold text-gh-success">${currentEarnings.toFixed(2)}+</span>
        </div>
      )}
    </div>
  );
};

export default StatusHeader;
