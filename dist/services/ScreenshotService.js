"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenshotService = void 0;
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const sharp_1 = __importDefault(require("sharp"));
const display_1 = require("../utils/display");
// Minimum dimensions for OCR to work reliably
const MIN_OCR_WIDTH = 60;
const MIN_OCR_HEIGHT = 27;
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
        // Crop to the specified region
        let sharpInstance = (0, sharp_1.default)(fullScreenshot).extract({
            left: scaled.x,
            top: scaled.y,
            width: scaled.width,
            height: scaled.height,
        });
        // If the cropped region is smaller than minimum OCR dimensions, upscale it
        if (scaled.width < MIN_OCR_WIDTH || scaled.height < MIN_OCR_HEIGHT) {
            // Calculate scale factor to meet minimum dimensions
            const scaleX = scaled.width < MIN_OCR_WIDTH ? MIN_OCR_WIDTH / scaled.width : 1;
            const scaleY = scaled.height < MIN_OCR_HEIGHT ? MIN_OCR_HEIGHT / scaled.height : 1;
            const scale = Math.max(scaleX, scaleY);
            const newWidth = Math.round(scaled.width * scale);
            const newHeight = Math.round(scaled.height * scale);
            console.log(`Upscaling image from ${scaled.width}x${scaled.height} to ${newWidth}x${newHeight} for better OCR`);
            sharpInstance = sharpInstance.resize(newWidth, newHeight, {
                kernel: sharp_1.default.kernel.lanczos3, // High-quality upscaling
                fit: 'fill'
            });
        }
        const croppedBuffer = await sharpInstance
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
