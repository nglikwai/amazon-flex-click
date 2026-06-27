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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const sharp_1 = __importDefault(require("sharp"));
const display_1 = require("../utils/display");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ScreenshotService {
    static setDebugDir(dir) {
        this.debugDir = dir;
    }
    static getDebugDir() {
        return this.debugDir;
    }
    // Clear all debug screenshots from previous runs
    static clearDebugScreenshots() {
        if (fs.existsSync(this.debugDir)) {
            const files = fs.readdirSync(this.debugDir);
            for (const file of files) {
                if (file.endsWith('.png')) {
                    fs.unlinkSync(path.join(this.debugDir, file));
                }
            }
            console.log(`Cleared ${files.length} debug screenshots from previous run`);
        }
        this.screenshotCounter = 0;
    }
    // Save debug screenshot with timestamp
    static saveDebugScreenshot(buffer, prefix) {
        if (!fs.existsSync(this.debugDir)) {
            fs.mkdirSync(this.debugDir, { recursive: true });
        }
        const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
        const filename = `${String(this.screenshotCounter).padStart(4, '0')}_${timestamp}_${prefix}.png`;
        const filepath = path.join(this.debugDir, filename);
        fs.writeFileSync(filepath, buffer);
        this.screenshotCounter++;
    }
    static async takeScreenshot() {
        try {
            const imgBuffer = await (0, screenshot_desktop_1.default)({ format: "png" });
            return imgBuffer;
        }
        catch (error) {
            throw new Error(`Failed to take screenshot: ${error}`);
        }
    }
    static async takeRegionScreenshot(x, y, width, height) {
        // Take full screenshot first
        const fullScreenshot = await (0, screenshot_desktop_1.default)({ format: "png" });
        // Automatically scale coordinates based on display DPI
        const scaled = await display_1.DisplayManager.scaleCoordinates(x, y, width, height);
        // Crop to the specified region
        let sharpInstance = (0, sharp_1.default)(fullScreenshot).extract({
            left: scaled.x,
            top: scaled.y,
            width: scaled.width,
            height: scaled.height,
        });
        const originalBuffer = await sharpInstance
            .png({ quality: 100, compressionLevel: 0 })
            .toBuffer();
        this.saveDebugScreenshot(originalBuffer, 'original');
        return originalBuffer;
    }
}
exports.ScreenshotService = ScreenshotService;
ScreenshotService.screenshotCounter = 0;
ScreenshotService.debugDir = "./tmp/debug-screenshots";
