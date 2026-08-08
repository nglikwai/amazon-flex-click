import { BrowserWindow } from 'electron';
import { AmazonFlexSlotGrabber } from '../AmazonFlexSlotGrabber';
import { loadConfig } from '../config';
import { sendSuccessNotification } from '../services/EmailService';
import { detectCurrentPage, navigateToOffers } from '../services/LoginService';

type GetWindow = () => BrowserWindow | null;

export interface ActivityEntry {
  type: string;
  message: string;
  timestamp: string;
  earnings?: number;
}

export class BotController {
  private grabber: AmazonFlexSlotGrabber | null = null;
  private getWindow: GetWindow;
  private activity: ActivityEntry[] = [];
  private _loginRunning = false;
  private _loginAborted = false;

  constructor(getWindow: GetWindow) {
    this.getWindow = getWindow;
  }

  getActivity(): ActivityEntry[] {
    return this.activity;
  }

  addActivity(type: string, message: string): void {
    const entry: ActivityEntry = { type, message, timestamp: new Date().toISOString() };
    this.activity.push(entry);
    this.send('bot-action', entry);
  }

  private send(channel: string, ...args: any[]) {
    this.getWindow()?.webContents.send(channel, ...args);
  }

  isRunning(): boolean {
    return this.grabber !== null || this._loginRunning;
  }

  isLoginRunning(): boolean {
    return this._loginRunning;
  }

  async startLogin(fn: (shouldAbort: () => boolean) => Promise<void>): Promise<void> {
    if (this._loginRunning) return;
    this._loginAborted = false;
    this._loginRunning = true;
    try {
      await fn(() => this._loginAborted);
    } catch (err: any) {
      if (err.message !== 'Login aborted') {
        this.addActivity('error', err.message);
      }
    } finally {
      this._loginRunning = false;
    }
  }

  getEarnings(): number {
    return this.grabber?.getLastDetectedEarnings() ?? 0;
  }

  async start(): Promise<{ success: boolean; error?: string }> {
    if (this.grabber) return { success: false, error: 'Bot is already running' };
    this.activity = [];
    try {
      const log = (msg: string) => this.addActivity('info', msg);
      const initialPage = await detectCurrentPage(log);
      if (initialPage === 'landing' || initialPage === 'signin-form') {
        this.addActivity('error', 'App is not ready');
        return { success: false, error: 'App is not ready' };
      }
      await navigateToOffers(log);
      const page = await detectCurrentPage(log);
      if (page !== 'offers') {
        this.addActivity('error', 'App is not ready');
        return { success: false, error: 'App is not ready' };
      }

      const config = loadConfig();
      this.grabber = new AmazonFlexSlotGrabber(config);

      this.grabber.setActionCallback((action) => {
        const entry: ActivityEntry = {
          type: action.type,
          message: action.message,
          timestamp: action.timestamp.toISOString(),
          earnings: action.earnings,
        };
        this.activity.push(entry);
        this.send('bot-action', entry);
      });

      console.log('Initializing bot and OCR worker...');
      await this.grabber.initialize();
      await new Promise((r) => setTimeout(r, 100));
      console.log('Bot initialized and ready to start');

      this.grabber.start().then(async () => {
        const earnings = this.grabber?.getLastDetectedEarnings() ?? 0;
        if (earnings > 0) {
          this.send('bot-success', earnings);
          this.send('bot-status', 'success');
          const cfg = loadConfig();
          if (cfg.notificationEmail) {
            try {
              await sendSuccessNotification(
                cfg.notificationEmail,
                earnings,
                this.grabber?.getLastSuccessMessage() ?? `$${earnings.toFixed(2)}`,
                this.grabber?.getLastSlotScreenshot() ?? null,
              );
            } catch (err) {
              console.error('[bot] Failed to send email notification:', err);
            }
          }
        } else {
          this.send('bot-status', 'stopped');
        }
        this.grabber = null;
      }).catch((err) => {
        console.error('Bot error:', err);
        this.send('bot-error', err.message);
        this.send('bot-status', 'error');
        this.grabber = null;
      });

      this.send('bot-status', 'running');
      return { success: true };
    } catch (err: any) {
      console.error('Failed to start bot:', err);
      this.grabber = null;
      return { success: false, error: err.message };
    }
  }

  async stop(): Promise<{ success: boolean; error?: string }> {
    this._loginAborted = true;
    if (!this.grabber && !this._loginRunning) {
      return { success: false, error: 'Nothing is running' };
    }
    try {
      if (this.grabber) {
        this.grabber.stop();
        await this.grabber.cleanup();
        this.grabber = null;
      }
      this.send('bot-status', 'stopped');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  async cleanup(): Promise<void> {
    if (this.grabber) {
      this.grabber.stop();
      await this.grabber.cleanup();
    }
  }
}
