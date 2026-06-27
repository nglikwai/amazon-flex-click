import { ipcMain, shell, systemPreferences, app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import robot from '@jitsi/robotjs';
import { ScreenshotService } from '../../services/ScreenshotService';

export function registerSystemHandlers(getWindow: () => BrowserWindow | null): void {
  ipcMain.handle('check-permissions', () => {
    if (process.platform === 'darwin' && app.isPackaged) {
      const accessibility = systemPreferences.isTrustedAccessibilityClient(false);
      return { accessibility, screenRecording: true, needsPermissions: !accessibility };
    }
    return { accessibility: true, screenRecording: true, needsPermissions: false };
  });

  ipcMain.handle('open-system-preferences', () => {
    if (process.platform === 'darwin') {
      shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
    }
  });

  ipcMain.handle('open-screenshots-folder', async () => {
    const dir = ScreenshotService.getDebugDir();
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await shell.openPath(dir);
  });

  ipcMain.handle('get-mouse-position', () => {
    try {
      const pos = robot.getMousePos();
      return { x: pos.x, y: pos.y };
    } catch {
      return { x: 0, y: 0 };
    }
  });

  ipcMain.handle('pick-coordinate', () =>
    new Promise<{ x: number; y: number } | null>((resolve) => {
      const win = getWindow();
      if (!win) { resolve(null); return; }
      win.minimize();
      setTimeout(() => {
        try {
          const pos = robot.getMousePos();
          win.restore();
          win.focus();
          resolve(pos);
        } catch {
          win.restore();
          win.focus();
          resolve(null);
        }
      }, 2500);
    })
  );

  ipcMain.handle('pick-area', () =>
    new Promise<{ x: number; y: number; width: number; height: number } | null>((resolve) => {
      const win = getWindow();
      if (!win) { resolve(null); return; }
      win.minimize();
      setTimeout(() => {
        try {
          const first = robot.getMousePos();
          setTimeout(() => {
            try {
              const second = robot.getMousePos();
              win.restore();
              win.focus();
              resolve({
                x: Math.min(first.x, second.x),
                y: Math.min(first.y, second.y),
                width: Math.abs(second.x - first.x),
                height: Math.abs(second.y - first.y),
              });
            } catch {
              win.restore();
              win.focus();
              resolve(null);
            }
          }, 2500);
        } catch {
          win.restore();
          win.focus();
          resolve(null);
        }
      }, 2000);
    })
  );
}
