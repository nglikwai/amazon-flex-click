import { ipcMain, BrowserWindow } from 'electron';
import { BotController } from '../BotController';

export function registerBotHandlers(getWindow: () => BrowserWindow | null): { controller: BotController; cleanup: () => Promise<void> } {
  const controller = new BotController(getWindow);

  ipcMain.handle('start-bot', () => controller.start());
  ipcMain.handle('stop-bot',  () => controller.stop());
  ipcMain.handle('get-status', () => controller.isRunning() ? 'running' : 'stopped');

  return {
    controller,
    cleanup: () => controller.cleanup(),
  };
}
