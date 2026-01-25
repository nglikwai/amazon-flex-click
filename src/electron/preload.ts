import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config: any) => ipcRenderer.invoke('save-config', config),
  configExists: () => ipcRenderer.invoke('config-exists'),
  resetConfig: () => ipcRenderer.invoke('reset-config'),
  getConfigPath: () => ipcRenderer.invoke('get-config-path'),
  checkPermissions: () => ipcRenderer.invoke('check-permissions'),
  openSystemPreferences: () => ipcRenderer.invoke('open-system-preferences'),
  startBot: () => ipcRenderer.invoke('start-bot'),
  stopBot: () => ipcRenderer.invoke('stop-bot'),
  getStatus: () => ipcRenderer.invoke('get-status'),
  getMousePosition: () => ipcRenderer.invoke('get-mouse-position'),
  pickCoordinate: () => ipcRenderer.invoke('pick-coordinate'),
  pickArea: () => ipcRenderer.invoke('pick-area'),
  onBotStatus: (callback: (status: string) => void) => {
    ipcRenderer.on('bot-status', (_, status) => callback(status));
  },
  onBotError: (callback: (error: string) => void) => {
    ipcRenderer.on('bot-error', (_, error) => callback(error));
  },
  onBotSuccess: (callback: (earnings: number) => void) => {
    ipcRenderer.on('bot-success', (_, earnings) => callback(earnings));
  },
  onBotAction: (callback: (action: { type: string; message: string; timestamp: string; earnings?: number }) => void) => {
    ipcRenderer.on('bot-action', (_, action) => callback(action));
  }
});
