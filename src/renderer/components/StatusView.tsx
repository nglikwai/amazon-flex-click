import React from 'react';
import StatusHeader from './StatusHeader';
import ActivityLog, { ActionLog } from './ActivityLog';

type BotStatus = 'stopped' | 'running' | 'success' | 'error';

export type { ActionLog };

interface StatusViewProps {
  status: BotStatus;
  title: string;
  message: string;
  actionLogs: ActionLog[];
  currentEarnings?: number;
}

const StatusView: React.FC<StatusViewProps> = ({ status, title, message, actionLogs, currentEarnings }) => {
  const emptyMessage = status === 'stopped' ? 'Click Start to begin' : 'Waiting for activity...';

  return (
    <div className="w-full max-w-2xl mx-auto h-full flex flex-col py-4">
      <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
        <StatusHeader
          status={status}
          title={title}
          message={message}
          currentEarnings={currentEarnings}
        />

        <ActivityLog
          logs={actionLogs}
          emptyMessage={emptyMessage}
        />
      </div>
    </div>
  );
};

export default StatusView;
