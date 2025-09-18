"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupRecorder = void 0;
const robotjs_1 = __importDefault(require("robotjs"));
const config_1 = require("./config");
class SetupRecorder {
    constructor() {
        this.config = {};
    }
    async recordCoordinates() {
        console.log("Amazon Flex Setup");
        console.log("=================\n");
        // 1. Refresh button
        await this.recordPosition("refresh button", (x, y) => {
            this.config.refreshButtonX = x;
            this.config.refreshButtonY = y;
        });
        // 2. Search area
        let searchX1 = 0, searchY1 = 0, searchX2 = 0, searchY2 = 0;
        await this.recordPosition("search area top-left", (x, y) => {
            searchX1 = x;
            searchY1 = y;
        });
        await this.recordPosition("search area bottom-right", (x, y) => {
            searchX2 = x;
            searchY2 = y;
        });
        this.config.searchArea = {
            x: Math.min(searchX1, searchX2),
            y: Math.min(searchY1, searchY2),
            width: Math.abs(searchX2 - searchX1),
            height: Math.abs(searchY2 - searchY1),
        };
        // 3. Schedule button
        await this.recordPosition("schedule button", (x, y) => {
            this.config.scheduleButtonX = x;
            this.config.scheduleButtonY = y;
        });
        // 4. App window
        let appX1 = 0, appY1 = 0, appX2 = 0, appY2 = 0;
        await this.recordPosition("app window top-left", (x, y) => {
            appX1 = x;
            appY1 = y;
        });
        await this.recordPosition("app window bottom-right", (x, y) => {
            appX2 = x;
            appY2 = y;
        });
        this.config.appWindow = {
            x: Math.min(appX1, appX2),
            y: Math.min(appY1, appY2),
            width: Math.abs(appX2 - appX1),
            height: Math.abs(appY2 - appY1),
        };
        // 5. Minimum earnings
        await this.getTextualConfig();
        // Save config
        const finalConfig = this.config;
        (0, config_1.saveConfig)(finalConfig);
        console.log("\n✅ Setup complete!");
    }
    async recordPosition(description, callback) {
        const readline = require("readline");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question(`${description}`, () => {
                const mouse = robotjs_1.default.getMousePos();
                // Validate coordinates are within screen bounds
                const screenSize = robotjs_1.default.getScreenSize();
                if (mouse.x < 0 ||
                    mouse.x > screenSize.width ||
                    mouse.y < 0 ||
                    mouse.y > screenSize.height) {
                    console.log(`⚠️  Warning: Coordinates (${mouse.x}, ${mouse.y}) may be outside screen bounds`);
                }
                callback(mouse.x, mouse.y);
                rl.close();
                resolve();
            });
        });
    }
    async getTextualConfig() {
        const readline = require("readline");
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        return new Promise((resolve) => {
            rl.question("\nMinimum earnings (e.g., 25 for $25.00): ", (minEarnings) => {
                this.config.minEarnings = parseFloat(minEarnings) || 25;
                rl.close();
                resolve();
            });
        });
    }
}
exports.SetupRecorder = SetupRecorder;
async function main() {
    const recorder = new SetupRecorder();
    await recorder.recordCoordinates();
}
if (require.main === module) {
    main().catch(console.error);
}
