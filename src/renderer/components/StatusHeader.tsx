import React from 'react';
import StatusIndicator from './StatusIndicator';

type BotStatus = 'stopped' | 'running' | 'success' | 'error';

interface Props {
  status: BotStatus;
  title: string;
  message: string;
  currentEarnings?: number;
  maxEarnings?: number;
}

const StatusHeader: React.FC<Props> = ({ status, title, message, currentEarnings, maxEarnings }) => {
  const showTarget = currentEarnings !== undefined && currentEarnings > 0 && status === 'running';
  const hasMax = maxEarnings !== undefined && maxEarnings > 0;

  const titleColor =
    status === 'success' ? 'text-gh-success' :
    status === 'error'   ? 'text-gh-danger'  :
    status === 'running' ? 'text-gh-text'     :
                           'text-gh-text-secondary';

  return (
    <div className="flex items-center gap-4 pb-4 border-b border-gh-border shrink-0">
      <StatusIndicator status={status} />

      <div className="flex-1 min-w-0">
        <h2 className={`text-base font-semibold tracking-tight truncate ${titleColor}`}>{title}</h2>
        <p className="text-sm text-gh-text-secondary truncate mt-0.5">{message}</p>
      </div>

      {showTarget && (
        <div className="shrink-0 px-3 py-1.5 rounded-lg bg-gh-success/8 border border-gh-success/20 text-right">
          <div className="text-xs text-gh-success/60 uppercase tracking-widest mb-0.5">target</div>
          <div className="text-lg font-bold font-mono text-gh-success leading-none">
            ${currentEarnings!.toFixed(0)}{hasMax ? `–$${maxEarnings!.toFixed(0)}` : '+'}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusHeader;
