import { app, BrowserWindow, ipcMain, shell, systemPreferences } from 'electron';
import * as path from 'path';
import robot from '@jitsi/robotjs';
import { AmazonFlexSlotGrabber } from '../AmazonFlexSlotGrabber';
import { loadConfig, configExists, saveConfig, getDefaultConfig, resetToDefault } from '../config';
import { Config } from '../types';

let mainWindow: BrowserWindow | null = null;
let grabber: AmazonFlexSlotGrabber | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    resizable: true,
    minWidth: 600,
    minHeight: 500,
    icon: path.join(__dirname, '../../build/icon.png')
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  mainWindow.on('close', (e) => {
    console.log('Window close event triggered - setting isQuitting to true');
    isQuitting = true;
  });

  mainWindow.on('closed', () => {
    console.log('Window closed event triggered');
    mainWindow = null;
  });

  mainWindow.on('blur', () => {
    console.log('Window blur event triggered');
  });

  mainWindow.on('focus', () => {
    console.log('Window focus event triggered');
  });

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers
ipcMain.handle('get-config', async () => {
  try {
    return loadConfig();
  } catch (error) {
    console.error('Error loading config:', error);
    return getDefaultConfig();
  }
});

ipcMain.handle('save-config', async (_, config: Config) => {
  try {
    saveConfig(config);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('config-exists', async () => {
  return configExists();
});

ipcMain.handle('reset-config', async () => {
  try {
    resetToDefault();
    return { success: true, config: getDefaultConfig() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-config-path', async () => {
  return path.join(app.getPath('userData'), 'config.json');
});

ipcMain.handle('check-permissions', async () => {
  if (process.platform === 'darwin') {
    const accessibilityStatus = systemPreferences.isTrustedAccessibilityClient(false);
    // Screen recording permission check
    let screenRecordingStatus = true;
    try {
      // Try to take a screenshot to test screen recording permission
      const { screen } = require('electron');
      const display = screen.getPrimaryDisplay();
      screenRecordingStatus = display ? true : false;
    } catch (error) {
      screenRecordingStatus = false;
    }
    
    return {
      accessibility: accessibilityStatus,
      screenRecording: screenRecordingStatus,
      needsPermissions: !accessibilityStatus
    };
  }
  return { accessibility: true, screenRecording: true, needsPermissions: false };
});

ipcMain.handle('open-system-preferences', async () => {
  if (process.platform === 'darwin') {
    shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
  }
});

ipcMain.handle('start-bot', async () => {
  try {
    if (grabber) {
      return { success: false, error: 'Bot is already running' };
    }

    const config = loadConfig();
    grabber = new AmazonFlexSlotGrabber(config);

    // Set up action callback to forward actions to renderer
    grabber.setActionCallback((action) => {
      mainWindow?.webContents.send('bot-action', {
        type: action.type,
        message: action.message,
        timestamp: action.timestamp.toISOString(),
        earnings: action.earnings
      });
    });

    // Initialize OCR worker and wait for it to be ready
    console.log('Initializing bot and OCR worker...');
    await grabber.initialize();

    // Give OCR worker a moment to fully stabilize
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('Bot initialized and ready to start');

    // Start the bot in background
    grabber.start().then(() => {
      console.log('Bot stopped normally');
      const earnings = grabber?.getLastDetectedEarnings() || 0;
      if (earnings > 0) {
        mainWindow?.webContents.send('bot-success', earnings);
        mainWindow?.webContents.send('bot-status', 'success');
      } else {
        mainWindow?.webContents.send('bot-status', 'stopped');
      }
      grabber = null;
    }).catch((error) => {
      console.error('Bot error:', error);
      mainWindow?.webContents.send('bot-error', error.message);
      mainWindow?.webContents.send('bot-status', 'error');
      grabber = null;
    });

    mainWindow?.webContents.send('bot-status', 'running');
    return { success: true };
  } catch (error: any) {
    console.error('Failed to start bot:', error);
    grabber = null;
    return { success: false, error: error.message };
  }
});

ipcMain.handle('stop-bot', async () => {
  try {
    if (grabber) {
      grabber.stop();
      await grabber.cleanup();
      grabber = null;
      mainWindow?.webContents.send('bot-status', 'stopped');
      return { success: true };
    }
    return { success: false, error: 'Bot is not running' };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-status', async () => {
  if (!grabber) {
    return 'stopped';
  }
  return 'running';
});

ipcMain.handle('get-mouse-position', async () => {
  try {
    const pos = robot.getMousePos();
    return { x: pos.x, y: pos.y };
  } catch (error) {
    return { x: 0, y: 0 };
  }
});

// Coordinate picker - user positions mouse and presses Space/Enter
ipcMain.handle('pick-coordinate', async () => {
  return new Promise((resolve) => {
    if (!mainWindow) {
      resolve(null);
      return;
    }

    // Minimize the window so user can see other apps
    mainWindow.minimize();

    // Wait a bit for window to minimize, then capture after 2 seconds
    setTimeout(() => {
      try {
        const pos = robot.getMousePos();
        mainWindow?.restore();
        mainWindow?.focus();
        resolve({ x: pos.x, y: pos.y });
      } catch (error) {
        mainWindow?.restore();
        mainWindow?.focus();
        resolve(null);
      }
    }, 2500);
  });
});

// Area picker - two captures for corners
ipcMain.handle('pick-area', async () => {
  return new Promise((resolve) => {
    if (!mainWindow) {
      resolve(null);
      return;
    }

    let firstClick: { x: number; y: number } | null = null;

    // Minimize the window
    mainWindow.minimize();

    // First click - wait 2 seconds
    setTimeout(() => {
      try {
        const pos = robot.getMousePos();
        firstClick = { x: pos.x, y: pos.y };

        // Second click - wait another 2 seconds
        setTimeout(() => {
          try {
            const secondClick = robot.getMousePos();

            // Calculate area
            const x = Math.min(firstClick!.x, secondClick.x);
            const y = Math.min(firstClick!.y, secondClick.y);
            const width = Math.abs(secondClick.x - firstClick!.x);
            const height = Math.abs(secondClick.y - firstClick!.y);

            mainWindow?.restore();
            mainWindow?.focus();
            resolve({ x, y, width, height });
          } catch (error) {
            mainWindow?.restore();
            mainWindow?.focus();
            resolve(null);
          }
        }, 2500);
      } catch (error) {
        mainWindow?.restore();
        mainWindow?.focus();
        resolve(null);
      }
    }, 2000);
  });
});

let isQuitting = false;

// Handle app quit
app.on('before-quit', async () => {
  console.log('before-quit event triggered, isQuitting:', isQuitting);

  // Only stop the bot if we're actually quitting
  if (grabber) {
    grabber.stop();
    await grabber.cleanup();
  }
});

app.on('will-quit', () => {
  console.log('will-quit event triggered');
});

app.on('quit', () => {
  console.log('quit event triggered');
});
