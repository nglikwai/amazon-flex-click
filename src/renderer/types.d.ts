export interface ElectronAPI {
  getConfig: () => Promise<any>;
  saveConfig: (config: any) => Promise<{ success: boolean; error?: string }>;
  configExists: () => Promise<boolean>;
  resetConfig: () => Promise<{ success: boolean; config?: any; error?: string }>;
  getConfigPath: () => Promise<string>;
  checkPermissions: () => Promise<{ accessibility: boolean; screenRecording: boolean; needsPermissions: boolean }>;
  openSystemPreferences: () => Promise<void>;
  startBot: () => Promise<{ success: boolean; error?: string }>;
  stopBot: () => Promise<{ success: boolean; error?: string }>;
  getStatus: () => Promise<string>;
  getMousePosition: () => Promise<{ x: number; y: number }>;
  pickCoordinate: () => Promise<{ x: number; y: number } | null>;
  pickArea: () => Promise<{ x: number; y: number; width: number; height: number } | null>;
  onBotStatus: (callback: (status: string) => void) => void;
  onBotError: (callback: (error: string) => void) => void;
  onBotSuccess: (callback: (earnings: number) => void) => void;
  onBotAction: (callback: (action: { type: string; message: string; timestamp: string; earnings?: number }) => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
