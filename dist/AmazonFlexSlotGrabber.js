"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonFlexSlotGrabber = void 0;
const utils_1 = require("./utils");
const earnings_1 = require("./utils/earnings");
const services_1 = require("./services");
const time_1 = require("./utils/time");
// Amazon Flex Slot Grabber
class AmazonFlexSlotGrabber {
    constructor(config) {
        this.isRunning = false;
        this.config = config;
        this.ocrService = new services_1.OCRService();
    }
    // Initialize the OCR service for text detection
    async initialize() {
        await this.ocrService.initialize();
    }
    // Clean up resources when shutting down
    async cleanup() {
        await this.ocrService.cleanup();
    }
    // Check if there's a slot with earnings >= minimum threshold
    async checkForSlot() {
        // Take screenshot of the search area only for better accuracy
        console.log((0, time_1.getCurrentTimeMMSS)(), " taking region screenshot...");
        const screenshot = await services_1.ScreenshotService.takeRegionScreenshot(this.config.searchArea.x, this.config.searchArea.y, this.config.searchArea.width, this.config.searchArea.height);
        // Extract numbers from the screenshot using OCR
        console.log((0, time_1.getCurrentTimeMMSS)(), " detecting numbers...");
        const text = await this.ocrService.detectNumbers(screenshot);
        console.log((0, time_1.getCurrentTimeMMSS)(), " Scanning for slots...");
        // Parse text to find the highest dollar amount (e.g., $45.50, $25.00)
        const detectedEarnings = (0, earnings_1.parseEarnings)(text);
        console.log((0, time_1.getCurrentTimeMMSS)(), " detectedEarnings: ", detectedEarnings);
        // Check if earnings meet our minimum threshold
        if (detectedEarnings >= this.config.minEarnings) {
            console.log((0, time_1.getCurrentTimeMMSS)(), ` ✅ Found suitable slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)} `);
            return true;
        }
        else if (detectedEarnings > 0) {
            console.log((0, time_1.getCurrentTimeMMSS)(), ` 💰 Found slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)}`);
        }
        return false;
    }
    // Attempt to grab/schedule a slot that was found
    async grabSlot() {
        console.log("Attempting to grab slot...");
        try {
            // Calculate center of search area where the slot should be
            const centerX = this.config.searchArea.x + this.config.searchArea.width / 2;
            const centerY = this.config.searchArea.y + this.config.searchArea.height / 2;
            // Click on the slot to open details
            (0, utils_1.clickPosition)(centerX, centerY);
            // Wait for detail page to load
            await (0, utils_1.sleep)(200);
            // Click the schedule button to book the slot
            console.log((0, time_1.getCurrentTimeMMSS)(), " clicked on schedule button!");
            (0, utils_1.clickPosition)(this.config.scheduleButtonX, this.config.scheduleButtonY);
            // Wait for booking response
            await (0, utils_1.sleep)(1000);
            // Verify if booking was successful by checking the app window content
            const resultImg = await services_1.ScreenshotService.takeRegionScreenshot(this.config.appWindow.x, this.config.appWindow.y, this.config.appWindow.width, this.config.appWindow.height);
            const resultText = await this.ocrService.detectText(resultImg);
            if (resultText.toLowerCase().includes("block unavailable")) {
                console.log((0, time_1.getCurrentTimeMMSS)(), " ❌ Block Unavailable - Someone else reserved that block.");
                return false;
            }
            else {
                console.log((0, time_1.getCurrentTimeMMSS)(), " ✅ Successfully scheduled the slot!");
                return true;
            }
        }
        catch (error) {
            console.error("Error during slot grab:", error);
            return false;
        }
    }
    async start() {
        console.log("Starting Amazon Flex slot grabber...");
        console.log(`Refresh button position: (${this.config.refreshButtonX}, ${this.config.refreshButtonY})`);
        console.log(`Minimum earnings: ${(0, earnings_1.formatEarnings)(this.config.minEarnings)}`);
        console.log(`Interval: ${this.config.intervalMs}ms`);
        this.isRunning = true;
        while (this.isRunning) {
            try {
                console.log("\x1b[32m%s\x1b[0m", `${(0, time_1.getCurrentTimeMMSS)()}, clicked on refresh button!`);
                (0, utils_1.clickPosition)(this.config.refreshButtonX, this.config.refreshButtonY);
                await (0, utils_1.sleep)(500);
                const slotFound = await this.checkForSlot();
                if (slotFound) {
                    const success = await this.grabSlot();
                    if (success) {
                        console.log("🎉 Slot successfully scheduled! Stopping...");
                        this.stop();
                        break;
                    }
                }
                await (0, utils_1.sleep)(350);
            }
            catch (error) {
                console.error("Error in main loop:", error);
                await (0, utils_1.sleep)(1000);
            }
        }
    }
    stop() {
        console.log("Stopping slot grabber...");
        this.isRunning = false;
    }
}
exports.AmazonFlexSlotGrabber = AmazonFlexSlotGrabber;
