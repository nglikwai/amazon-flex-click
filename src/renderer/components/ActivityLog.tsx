import React, { useRef, useEffect } from 'react';

type ActionType = 'refresh' | 'scanning' | 'found' | 'grabbing' | 'clicked' | 'success' | 'failed' | 'unavailable';

export interface ActionLog {
  type: ActionType;
  message: string;
  timestamp: string;
  earnings?: number;
  count?: number;
}

const DOT_COLOR: Record<ActionType, string> = {
  refresh:     'bg-gh-text-muted',
  scanning:    'bg-gh-text-secondary',
  found:       'bg-gh-warning',
  grabbing:    'bg-gh-warning',
  clicked:     'bg-gh-accent',
  success:     'bg-gh-success',
  failed:      'bg-gh-danger',
  unavailable: 'bg-gh-danger',
};

const TEXT_COLOR: Record<ActionType, string> = {
  refresh:     'text-gh-text-muted',
  scanning:    'text-gh-text-secondary',
  found:       'text-gh-warning',
  grabbing:    'text-gh-warning',
  clicked:     'text-gh-accent',
  success:     'text-gh-success',
  failed:      'text-gh-danger',
  unavailable: 'text-gh-danger',
};

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

const ActivityLog: React.FC<{ logs: ActionLog[]; emptyMessage?: string }> = ({ logs, emptyMessage = 'No activity yet' }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col min-h-0 mt-4">
      <div className="flex justify-between items-center mb-2 shrink-0 px-1">
        <span className="text-xs font-medium text-gh-text-muted uppercase tracking-widest">Activity</span>
        {logs.length > 0 && (
          <span className="text-xs font-mono text-gh-text-muted">{logs.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto rounded-lg border border-gh-border bg-gh-bg min-h-[100px]">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[100px] gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gh-text-muted opacity-40" />
            <span className="text-xs text-gh-text-muted">{emptyMessage}</span>
          </div>
        ) : (
          <div className="divide-y divide-gh-border/40">
            {logs.map((log, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-gh-bg-tertiary/60 transition-colors"
              >
                <div className={`shrink-0 w-1.5 h-1.5 rounded-full ${DOT_COLOR[log.type]}`} />
                <span className={`flex-1 text-xs font-mono truncate ${TEXT_COLOR[log.type]}`}>
                  {log.message}
                  {log.count && log.count > 1 && (
                    <span className="ml-1.5 text-gh-text-muted">×{log.count}</span>
                  )}
                </span>
                <span className="shrink-0 text-xs font-mono text-gh-text-muted tabular-nums">
                  {formatTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default ActivityLog;
