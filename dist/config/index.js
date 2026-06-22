"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.configExists = configExists;
exports.getDefaultConfig = getDefaultConfig;
exports.resetToDefault = resetToDefault;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const electron_1 = require("electron");
// Default configuration - used for first-time users
const DEFAULT_CONFIG = {
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
    maxEarnings: 0,
    intervalMs: 500,
    detailPageLoadMs: 1000
};
// Get the user data directory (persists across app updates)
function getUserConfigPath() {
    const userDataPath = electron_1.app.getPath('userData');
    return path.join(userDataPath, 'config.json');
}
function loadConfig() {
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
        const config = JSON.parse(configData);
        console.log('✅ Config loaded successfully from:', configPath);
        return config;
    }
    catch (error) {
        console.error('❌ Error reading config file:', error);
        console.log('📝 Using default config instead');
        return DEFAULT_CONFIG;
    }
}
function saveConfig(config) {
    try {
        const configPath = getUserConfigPath();
        const userDataPath = electron_1.app.getPath('userData');
        // Ensure the userData directory exists
        if (!fs.existsSync(userDataPath)) {
            fs.mkdirSync(userDataPath, { recursive: true });
        }
        const configData = JSON.stringify(config, null, 2);
        fs.writeFileSync(configPath, configData, 'utf8');
        console.log('✅ Configuration saved to:', configPath);
    }
    catch (error) {
        console.error('❌ Error saving config file:', error);
        throw error;
    }
}
function configExists() {
    const configPath = getUserConfigPath();
    return fs.existsSync(configPath);
}
function getDefaultConfig() {
    return { ...DEFAULT_CONFIG };
}
function resetToDefault() {
    saveConfig(DEFAULT_CONFIG);
    console.log('✅ Configuration reset to defaults');
}
