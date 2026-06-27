import { ipcMain, BrowserWindow } from 'electron';
import { AmazonFlexSlotGrabber } from '../../AmazonFlexSlotGrabber';
import { loadConfig } from '../../config';
import { sendSuccessNotification } from '../../services/EmailService';

export function registerBotHandlers(getWindow: () => BrowserWindow | null): { cleanup: () => Promise<void> } {
  let grabber: AmazonFlexSlotGrabber | null = null;

  function send(channel: string, ...args: any[]) {
    getWindow()?.webContents.send(channel, ...args);
  }

  ipcMain.handle('start-bot', async () => {
    if (grabber) return { success: false, error: 'Bot is already running' };
    try {
      const config = loadConfig();
      grabber = new AmazonFlexSlotGrabber(config);

      grabber.setActionCallback((action) => {
        send('bot-action', {
          type: action.type,
          message: action.message,
          timestamp: action.timestamp.toISOString(),
          earnings: action.earnings,
        });
      });

      console.log('Initializing bot and OCR worker...');
      await grabber.initialize();
      await new Promise((r) => setTimeout(r, 100));
      console.log('Bot initialized and ready to start');

      grabber.start().then(async () => {
        const earnings = grabber?.getLastDetectedEarnings() ?? 0;
        if (earnings > 0) {
          send('bot-success', earnings);
          send('bot-status', 'success');
          const cfg = loadConfig();
          if (cfg.notificationEmail) {
            try {
              await sendSuccessNotification(
                cfg.notificationEmail,
                earnings,
                grabber?.getLastSuccessMessage() ?? `$${earnings.toFixed(2)}`,
                grabber?.getLastSlotScreenshot() ?? null,
              );
            } catch (err) {
              console.error('[bot] Failed to send email notification:', err);
            }
          }
        } else {
          send('bot-status', 'stopped');
        }
        grabber = null;
      }).catch((err) => {
        console.error('Bot error:', err);
        send('bot-error', err.message);
        send('bot-status', 'error');
        grabber = null;
      });

      send('bot-status', 'running');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to start bot:', err);
      grabber = null;
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('stop-bot', async () => {
    if (!grabber) return { success: false, error: 'Bot is not running' };
    try {
      grabber.stop();
      await grabber.cleanup();
      grabber = null;
      send('bot-status', 'stopped');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-status', () => (grabber ? 'running' : 'stopped'));

  return {
    cleanup: async () => {
      if (grabber) {
        grabber.stop();
        await grabber.cleanup();
      }
    },
  };
}
