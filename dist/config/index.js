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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const CONFIG_PATH = path.join(__dirname, '../..', 'config.json');
function loadConfig() {
    if (!fs.existsSync(CONFIG_PATH)) {
        console.error('❌ Config file not found!');
        console.log('Please run setup first: npm run setup');
        console.log('This will help you record the screen coordinates.');
        process.exit(1);
    }
    try {
        const configData = fs.readFileSync(CONFIG_PATH, 'utf8');
        const config = JSON.parse(configData);
        console.log('✅ Config loaded successfully');
        return config;
    }
    catch (error) {
        console.error('❌ Error reading config file:', error);
        console.log('Please run setup again: npm run setup');
        process.exit(1);
    }
}
function saveConfig(config) {
    try {
        const configData = JSON.stringify(config, null, 2);
        fs.writeFileSync(CONFIG_PATH, configData, 'utf8');
        console.log('✅ Configuration saved to config.json');
    }
    catch (error) {
        console.error('❌ Error saving config file:', error);
        throw error;
    }
}
function configExists() {
    return fs.existsSync(CONFIG_PATH);
}
