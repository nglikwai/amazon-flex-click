import { Config } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

// Default configuration - used for first-time users
const DEFAULT_CONFIG: Config = {
  refreshButtonX: 1300,
  refreshButtonY: 989,
  scheduleButtonX: 1290,
  scheduleButtonY: 957,
  searchArea: {
    x: 1420,
    y: 400,
    width: 62,
    height: 27
  },
  appWindow: {
    x: 1085,
    y: 240,
    width: 431,
    height: 123
  },
  minEarnings: 60,
  intervalMs: 500,
  detailPageLoadMs: 1000
};

// Get the user data directory (persists across app updates)
function getUserConfigPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'config.json');
}

export function loadConfig(): Config {
  const configPath = getUserConfigPath();
  
  // If user config doesn't exist, create it with default values
  if (!fs.existsSync(configPath)) {
    console.log('📝 First time run - creating default config...');
    saveConfig(DEFAULT_CONFIG);
    console.log('✅ Default config created at:', configPath);
    return DEFAULT_CONFIG;
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as Config;
    console.log('✅ Config loaded successfully from:', configPath);
    return config;
  } catch (error) {
    console.error('❌ Error reading config file:', error);
    console.log('📝 Using default config instead');
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: Config): void {
  try {
    const configPath = getUserConfigPath();
    const userDataPath = app.getPath('userData');
    
    // Ensure the userData directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, configData, 'utf8');
    console.log('✅ Configuration saved to:', configPath);
  } catch (error) {
    console.error('❌ Error saving config file:', error);
    throw error;
  }
}

export function configExists(): boolean {
  const configPath = getUserConfigPath();
  return fs.existsSync(configPath);
}

export function getDefaultConfig(): Config {
  return { ...DEFAULT_CONFIG };
}

export function resetToDefault(): void {
  saveConfig(DEFAULT_CONFIG);
  console.log('✅ Configuration reset to defaults');
}