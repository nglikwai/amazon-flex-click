import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { ScreenshotService } from '../services/ScreenshotService';
import { registerConfigHandlers } from './ipc/configHandlers';
import { registerBotHandlers } from './ipc/botHandlers';
import { registerSystemHandlers } from './ipc/systemHandlers';
import { HttpServer } from './HttpServer';
import { loadConfig, saveConfig } from '../config';
import { runLoginFlow } from '../services/LoginService';

let mainWindow: BrowserWindow | null = null;

function getMainWindow(): BrowserWindow | null {
  return mainWindow;
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    resizable: true,
    minWidth: 600,
    minHeight: 500,
    icon: path.join(__dirname, '../../build/icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(() => {
  ScreenshotService.setDebugDir(path.join(app.getPath('userData'), 'debug-screenshots'));

  registerConfigHandlers();
  const { controller, cleanup } = registerBotHandlers(getMainWindow);
  registerSystemHandlers(getMainWindow);

  const config = loadConfig();
  const httpServer = new HttpServer(
    controller,
    config.httpPort ?? 3456,
    () => {
      const c = loadConfig();
      return { email: c.amazonEmail ?? '', password: c.amazonPassword ?? '' };
    },
    (email, password) => {
      const c = loadConfig();
      saveConfig({ ...c, amazonEmail: email, amazonPassword: password });
    },
    (shouldAbort) => runLoginFlow((msg) => controller.addActivity('login', msg), shouldAbort),
    () => loadConfig() as unknown as Record<string, any>,
    (patch: Record<string, any>) => saveConfig({ ...loadConfig(), ...patch }),
  );

  createWindow();

  app.on('before-quit', async () => {
    httpServer.stop();
    await cleanup();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
