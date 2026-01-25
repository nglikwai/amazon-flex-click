import React from 'react';

type BotStatus = 'stopped' | 'running' | 'success' | 'error';

interface StatusIndicatorProps {
  status: BotStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'running':
        return 'bg-gh-success/20 text-gh-success animate-pulse-glow';
      case 'success':
        return 'bg-gh-success/20 text-gh-success';
      case 'error':
        return 'bg-gh-danger/20 text-gh-danger';
      default:
        return 'bg-gh-border/50 text-gh-text-secondary';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'running':
        return <circle cx="12" cy="12" r="10" fill="currentColor"/>;
      case 'success':
        return <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" fill="none" strokeWidth="2"/>;
      case 'error':
        return <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" fill="none" strokeWidth="2"/>;
      default:
        return <circle cx="12" cy="12" r="10" fill="currentColor"/>;
    }
  };

  return (
    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getStyles()}`}>
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        {getIcon()}
      </svg>
    </div>
  );
};

export default StatusIndicator;
