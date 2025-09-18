import { Config } from '../types';
import * as fs from 'fs';
import * as path from 'path';

const CONFIG_PATH = path.join(process.cwd(), 'config.json');

export function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error('❌ Config file not found!');
    console.log('Please run setup first: npm run setup');
    console.log('This will help you record the screen coordinates.');
    process.exit(1);
  }

  try {
    const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configData) as Config;
    console.log('✅ Config loaded successfully');
    return config;
  } catch (error) {
    console.error('❌ Error reading config file:', error);
    console.log('Please run setup again: npm run setup');
    process.exit(1);
  }
}

export function saveConfig(config: Config): void {
  try {
    const configData = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, configData, 'utf8');
    console.log('✅ Configuration saved to config.json');
  } catch (error) {
    console.error('❌ Error saving config file:', error);
    throw error;
  }
}

export function configExists(): boolean {
  return fs.existsSync(CONFIG_PATH);
}