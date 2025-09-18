"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayManager = void 0;
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const robotjs_1 = __importDefault(require("robotjs"));
class DisplayManager {
    static async getDisplayInfo() {
        if (this.cachedDisplayInfo) {
            return this.cachedDisplayInfo;
        }
        // Get logical screen size from robotjs
        const screenSize = robotjs_1.default.getScreenSize();
        const logicalWidth = screenSize.width;
        const logicalHeight = screenSize.height;
        // Take a screenshot to get actual pixel dimensions
        const screenshotBuffer = await (0, screenshot_desktop_1.default)({ format: 'png' });
        const sharp = require('sharp');
        const metadata = await sharp(screenshotBuffer).metadata();
        const actualWidth = metadata.width;
        const actualHeight = metadata.height;
        // Calculate scaling factor
        const scalingFactor = actualWidth / logicalWidth;
        this.cachedDisplayInfo = {
            logicalWidth,
            logicalHeight,
            actualWidth,
            actualHeight,
            scalingFactor
        };
        // console.log(`Display Info: ${logicalWidth}x${logicalHeight} logical, ${actualWidth}x${actualHeight} actual, ${scalingFactor}x scaling`);
        return this.cachedDisplayInfo;
    }
    static async scaleCoordinates(x, y, width, height) {
        const displayInfo = await this.getDisplayInfo();
        return {
            x: Math.round(x * displayInfo.scalingFactor),
            y: Math.round(y * displayInfo.scalingFactor),
            width: Math.round(width * displayInfo.scalingFactor),
            height: Math.round(height * displayInfo.scalingFactor)
        };
    }
    static clearCache() {
        this.cachedDisplayInfo = null;
    }
}
exports.DisplayManager = DisplayManager;
DisplayManager.cachedDisplayInfo = null;
