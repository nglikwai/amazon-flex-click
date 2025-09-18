"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const sharp_1 = __importDefault(require("sharp"));
const display_1 = require("../utils/display");
class ScreenshotService {
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
        // Crop to the specified region and enhance for OCR
        const croppedBuffer = await (0, sharp_1.default)(fullScreenshot)
            .extract({
            left: scaled.x,
            top: scaled.y,
            width: scaled.width,
            height: scaled.height,
        })
            .png({ quality: 100, compressionLevel: 0 })
            .toBuffer();
        // Save debug copy
        const fs = require("fs");
        if (!fs.existsSync("./tmp")) {
            fs.mkdirSync("./tmp", { recursive: true });
        }
        fs.writeFileSync("./tmp/debug_crop.png", croppedBuffer);
        return croppedBuffer;
    }
}
exports.ScreenshotService = ScreenshotService;
