import React, { useRef, useEffect } from 'react';

type ActionType = 'refresh' | 'scanning' | 'found' | 'grabbing' | 'clicked' | 'success' | 'failed' | 'unavailable';

export interface ActionLog {
  type: ActionType;
  message: string;
  timestamp: string;
  earnings?: number;
}

interface ActivityLogProps {
  logs: ActionLog[];
  emptyMessage?: string;
}

const ActivityLog: React.FC<ActivityLogProps> = ({ logs, emptyMessage = 'No activity yet' }) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getIcon = (type: ActionType) => {
    switch (type) {
      case 'refresh': return '↻';
      case 'scanning': return '◎';
      case 'found': return '$';
      case 'grabbing': return '⎯';
      case 'clicked': return '•';
      case 'success': return '✓';
      case 'failed': return '✕';
      case 'unavailable': return '⊘';
      default: return '•';
    }
  };

  const getStyles = (type: ActionType) => {
    switch (type) {
      case 'success':
        return 'text-gh-success';
      case 'failed':
      case 'unavailable':
        return 'text-gh-danger';
      case 'found':
      case 'grabbing':
        return 'text-gh-warning';
      default:
        return 'text-gh-text-secondary';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <span className="text-xs font-medium text-gh-text-muted uppercase tracking-wider">Activity</span>
        {logs.length > 0 && (
          <span className="text-xs text-gh-text-muted">{logs.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto bg-gh-bg rounded-md min-h-[120px]">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[120px] text-gh-text-muted text-sm">
            {emptyMessage}
          </div>
        ) : (
          <div>
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 px-2 py-1 text-xs hover:bg-gh-bg-tertiary ${getStyles(log.type)}`}
              >
                <span className="shrink-0 w-4 text-center font-mono">{getIcon(log.type)}</span>
                <span className="flex-1 text-gh-text truncate">{log.message}</span>
                <span className="shrink-0 text-gh-text-muted font-mono">{formatTime(log.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default ActivityLog;
