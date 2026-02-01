import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import StatusView, { ActionLog } from './components/StatusView';
import SettingsView, { SettingsViewRef } from './components/SettingsView';
import './styles.css';

type ViewType = 'status' | 'settings';
type BotStatus = 'stopped' | 'running' | 'success' | 'error';

const MAX_LOGS = 100;

function App() {
  const settingsRef = useRef<SettingsViewRef>(null);
  const [currentView, setCurrentView] = useState<ViewType>('status');
  const [botStatus, setBotStatus] = useState<BotStatus>('stopped');
  const [statusTitle, setStatusTitle] = useState<string>('Stopped');
  const [statusMessage, setStatusMessage] = useState<string>('Click Start to begin');
  const [currentMinEarnings, setCurrentMinEarnings] = useState<number>(0);
  const [successEarnings, setSuccessEarnings] = useState<number>(0);
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [actionLogs, setActionLogs] = useState<ActionLog[]>([]);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      const permissions = await window.electronAPI.checkPermissions();
      if (permissions.needsPermissions) {
        updateStatus('error', 'Permissions Required',
          'This app needs Accessibility permission to control mouse clicks. Click Settings for help.');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }

    const config = await window.electronAPI.getConfig();
    if (config) {
      setCurrentMinEarnings(config.minEarnings);
    }

    const status = await window.electronAPI.getStatus();
    updateStatus(status as BotStatus, getStatusTitle(status), getStatusMessage(status));

    window.electronAPI.onBotStatus((status: string) => {
      updateStatus(status as BotStatus, getStatusTitle(status), getStatusMessage(status));
    });

    window.electronAPI.onBotError((error: string) => {
      updateStatus('error', 'Error', error);
    });

    window.electronAPI.onBotSuccess((earnings: number) => {
      setSuccessEarnings(earnings);
      updateStatus('success', 'Success!', `Slot grabbed for $${earnings.toFixed(2)}`);
    });

    window.electronAPI.onBotAction((action) => {
      setActionLogs(prev => {
        const newLogs = [...prev, action as ActionLog];
        if (newLogs.length > MAX_LOGS) {
          return newLogs.slice(-MAX_LOGS);
        }
        return newLogs;
      });
    });
  };

  const updateStatus = (status: BotStatus, title: string, message: string) => {
    setBotStatus(status);
    setStatusTitle(title);
    setStatusMessage(message);
  };

  const getStatusTitle = (status: string): string => {
    switch (status) {
      case 'running':
        return 'Running';
      case 'stopped':
        return `Welcome`;
      case 'success':
        return 'Success!';
      case 'error':
        return 'Error';
      default:
        return `Welcome`;
    }
  };

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'running':
        return 'Press ESC to stop';
      case 'stopped':
        return 'Click Start to begin';
      case 'success':
        return successEarnings > 0
          ? `Successfully grabbed a slot worth $${successEarnings.toFixed(2)}!`
          : 'Slot successfully grabbed!';
      case 'error':
        return 'An error occurred';
      default:
        return 'Click Start to begin';
    }
  };

  const handleToggleBot = async () => {
    if (botStatus === 'running') {
      const result = await window.electronAPI.stopBot();
      if (!result.success) {
        updateStatus('error', 'Error', result.error || 'Failed to stop bot');
      }
    } else {
      const permissions = await window.electronAPI.checkPermissions();
      if (permissions.needsPermissions) {
        if (confirm('This app needs Accessibility permissions to control mouse clicks.\n\nWould you like to open System Preferences now?')) {
          await window.electronAPI.openSystemPreferences();
          updateStatus('error', 'Permissions Required',
            'Please enable Accessibility permissions, then restart the app.');
        }
        return;
      }

      setActionLogs([]);
      const result = await window.electronAPI.startBot();
      if (!result.success) {
        updateStatus('error', 'Error', result.error || 'Failed to start bot');
      }
    }
  };

  const handleSettingsSaved = (minEarnings: number) => {
    setCurrentMinEarnings(minEarnings);
    setCurrentView('status');
    updateStatus('stopped', 'Stopped', 'Settings saved! Click Start to begin');
  };

  useEffect(() => {
    const handleEsc = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' && botStatus === 'running') {
        const result = await window.electronAPI.stopBot();
        if (!result.success) {
          updateStatus('error', 'Error', result.error || 'Failed to stop bot');
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [botStatus]);

  return (
    <div className="flex flex-col h-screen bg-gh-bg">
      <Header />

      <main className="flex-1 px-6 flex items-center justify-center overflow-hidden">
        {currentView === 'status' ? (
          <StatusView
            status={botStatus}
            title={statusTitle}
            message={statusMessage}
            actionLogs={actionLogs}
            currentEarnings={currentMinEarnings}
          />
        ) : (
          <SettingsView
            ref={settingsRef}
            onSave={handleSettingsSaved}
            onMousePosition={(x, y) => {
              setMouseX(x);
              setMouseY(y);
            }}
          />
        )}
      </main>

      {currentView === 'status' ? (
        <footer className="bg-gh-bg-secondary px-6 py-4 border-t border-gh-border">
          <div className="flex gap-3 justify-center items-center">
            <button
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 text-white ${
                botStatus === 'running'
                  ? 'bg-gh-danger hover:bg-gh-danger-emphasis'
                  : 'bg-gh-success hover:bg-gh-success-emphasis'
              }`}
              title={botStatus === 'running' ? 'Stop' : 'Start'}
              onClick={handleToggleBot}
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                {botStatus === 'running' ? (
                  <rect x="6" y="6" width="12" height="12" rx="1"/>
                ) : (
                  <path d="M8 5v14l11-7z"/>
                )}
              </svg>
            </button>
            <button
              className="w-14 h-14 rounded-xl flex items-center justify-center bg-gh-bg-tertiary border border-gh-border text-gh-text hover:bg-gh-border transition-all shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0"
              title="Settings"
              onClick={() => setCurrentView('settings')}
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
              </svg>
            </button>
          </div>
        </footer>
      ) : (
        <footer className="bg-gh-bg-secondary px-6 py-4 border-t border-gh-border">
          <div className="flex gap-4 justify-center items-center">
            {/* Mouse Position Display */}
            <div className="flex-1 flex flex-col gap-1 px-4 py-2 bg-gh-bg-tertiary border border-gh-border rounded-lg mr-4">
              <div className="text-xs font-semibold text-gh-text-muted uppercase tracking-wider">
                Mouse Position
              </div>
              <div className="flex gap-4 items-center">
                <span className="text-sm text-gh-text-secondary">X:</span>
                <span className="text-lg font-bold font-mono text-gh-accent min-w-[60px]">{mouseX}</span>
                <span className="text-sm text-gh-text-secondary">Y:</span>
                <span className="text-lg font-bold font-mono text-gh-accent min-w-[60px]">{mouseY}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                className="px-5 py-2.5 bg-gh-bg-tertiary border border-gh-border text-gh-text rounded-lg font-medium hover:bg-gh-border transition-colors"
                onClick={() => setCurrentView('status')}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-5 py-2.5 bg-gh-accent hover:bg-gh-accent-emphasis text-white rounded-lg font-medium transition-colors"
                onClick={() => settingsRef.current?.saveSettings()}
              >
                Save Settings
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
