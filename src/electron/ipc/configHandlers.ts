import { ipcMain, app } from 'electron';
import * as path from 'path';
import { loadConfig, configExists, saveConfig, getDefaultConfig, resetToDefault } from '../../config';
import { Config } from '../../types';

export function registerConfigHandlers(): void {
  ipcMain.handle('get-config', async () => {
    try {
      return loadConfig();
    } catch (err) {
      console.error('Error loading config:', err);
      return getDefaultConfig();
    }
  });

  ipcMain.handle('save-config', async (_, config: Config) => {
    try {
      saveConfig(config);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('config-exists', () => configExists());

  ipcMain.handle('reset-config', async () => {
    try {
      resetToDefault();
      return { success: true, config: getDefaultConfig() };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('get-config-path', () =>
    path.join(app.getPath('userData'), 'config.json')
  );
}
