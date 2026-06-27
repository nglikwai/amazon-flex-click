import { useState, useEffect } from 'react';
import { ActionLog } from '../components/StatusView';

export type BotStatus = 'stopped' | 'running' | 'success' | 'error';

const MAX_LOGS = 100;

function playSuccessSound() {
  const ctx = new AudioContext();
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.13;
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
    osc.start(t);
    osc.stop(t + 0.4);
  });
}

function statusTitle(s: string): string {
  switch (s) {
    case 'running': return 'Running';
    case 'success': return 'Success!';
    case 'error':   return 'Error';
    default:        return 'Welcome';
  }
}

function statusMessage(s: string, earnings = 0): string {
  switch (s) {
    case 'running': return 'Press ESC to stop';
    case 'success': return earnings > 0
      ? `Successfully grabbed a slot worth $${earnings.toFixed(2)}!`
      : 'Slot successfully grabbed!';
    case 'error':   return 'An error occurred';
    default:        return 'Click Start to begin';
  }
}

export function useBot() {
  const [status, setStatus]   = useState<BotStatus>('stopped');
  const [title, setTitle]     = useState('Stopped');
  const [message, setMessage] = useState('Click Start to begin');
  const [earnings, setEarnings] = useState(0);
  const [logs, setLogs]       = useState<ActionLog[]>([]);

  function applyStatus(s: string, overrideMessage?: string) {
    setStatus(s as BotStatus);
    setTitle(statusTitle(s));
    setMessage(overrideMessage ?? statusMessage(s));
  }

  useEffect(() => {
    (async () => {
      const s = await window.electronAPI.getStatus();
      applyStatus(s);
    })();

    window.electronAPI.onBotStatus((s) => applyStatus(s));

    window.electronAPI.onBotError((err) => {
      setStatus('error');
      setTitle('Error');
      setMessage(err);
    });

    window.electronAPI.onBotSuccess((e) => {
      playSuccessSound();
      setEarnings(e);
      setStatus('success');
      setTitle('Success!');
      setMessage(statusMessage('success', e));
    });

    window.electronAPI.onBotAction((action) => {
      setLogs((prev) => {
        const incoming = action as ActionLog;
        const last = prev[prev.length - 1];
        if (last?.type === incoming.type && last.message === incoming.message) {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...last,
            count: (last.count ?? 1) + 1,
            timestamp: incoming.timestamp,
          };
          return updated;
        }
        const next = [...prev, incoming];
        return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
      });
    });
  }, []);

  useEffect(() => {
    const onEsc = async (e: KeyboardEvent) => {
      if (e.key === 'Escape' && status === 'running') await toggle();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [status]);

  async function toggle() {
    if (status === 'running') {
      const res = await window.electronAPI.stopBot();
      if (!res.success) applyStatus('error', res.error || 'Failed to stop bot');
    } else {
      const perms = await window.electronAPI.checkPermissions();
      if (perms.needsPermissions) {
        if (confirm('This app needs Accessibility permissions.\n\nOpen System Preferences now?')) {
          await window.electronAPI.openSystemPreferences();
          applyStatus('error', 'Enable Accessibility permissions, then restart the app.');
        }
        return;
      }
      setLogs([]);
      const res = await window.electronAPI.startBot();
      if (!res.success) applyStatus('error', res.error || 'Failed to start bot');
    }
  }

  return { status, title, message, earnings, logs, toggle };
}
