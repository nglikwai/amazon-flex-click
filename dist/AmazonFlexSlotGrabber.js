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
        this.lastDetectedEarnings = 0;
        this.onAction = null;
        this.config = config;
        this.ocrService = new services_1.OCRService();
    }
    setActionCallback(callback) {
        this.onAction = callback;
    }
    emitAction(type, message, earnings) {
        if (this.onAction) {
            this.onAction({ type, message, timestamp: new Date(), earnings });
        }
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
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] START`);
        // Take screenshot of the search area only for better accuracy
        const screenshot = await services_1.ScreenshotService.takeRegionScreenshot(this.config.searchArea.x, this.config.searchArea.y, this.config.searchArea.width, this.config.searchArea.height);
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] screenshot taken`);
        // Extract numbers from the screenshot using OCR
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] calling detectNumbers...`);
        const text = await this.ocrService.detectNumbers(screenshot);
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] detectNumbers returned: "${text}"`);
        // Parse text to find the highest dollar amount (e.g., $45.50, $25.00)
        const detectedEarnings = +text;
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] parsed earnings: ${detectedEarnings}`);
        // Check if earnings meet our minimum threshold
        if (detectedEarnings >= this.config.minEarnings) {
            this.lastDetectedEarnings = detectedEarnings;
            console.log((0, time_1.getCurrentTimeMMSS)(), ` ✅ Found matched slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)} `);
            this.emitAction('found', `Found ${(0, earnings_1.formatEarnings)(detectedEarnings)} slot!`, detectedEarnings);
            console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] END - returning true`);
            return true;
        }
        else if (detectedEarnings > 0) {
            console.log((0, time_1.getCurrentTimeMMSS)(), ` 💰 Found slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)}`);
            this.emitAction('found', `Detected ${(0, earnings_1.formatEarnings)(detectedEarnings)} (below min)`, detectedEarnings);
        }
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] END - returning false`);
        return false;
    }
    // Attempt to grab/schedule a slot that was found
    async grabSlot() {
        console.log("Attempting to grab slot...");
        this.emitAction('grabbing', `Grabbing ${(0, earnings_1.formatEarnings)(this.lastDetectedEarnings)} slot...`, this.lastDetectedEarnings);
        try {
            // Calculate center of search area where the slot should be
            const centerX = this.config.searchArea.x + this.config.searchArea.width / 2;
            const centerY = this.config.searchArea.y + this.config.searchArea.height / 2;
            // Click on the slot to open details
            (0, utils_1.clickPosition)(centerX, centerY);
            this.emitAction('clicked', 'Clicked on slot');
            // Wait for detail page to load
            await (0, utils_1.sleep)(this.config.detailPageLoadMs);
            // Click the schedule button to book the slot
            console.log((0, time_1.getCurrentTimeMMSS)(), " clicked on schedule button!");
            (0, utils_1.clickPosition)(this.config.scheduleButtonX, this.config.scheduleButtonY);
            this.emitAction('clicked', 'Clicked schedule button');
            // Wait for booking response
            await (0, utils_1.sleep)(1000);
            // Verify if booking was successful by checking the app window content
            const resultImg = await services_1.ScreenshotService.takeRegionScreenshot(this.config.appWindow.x, this.config.appWindow.y, this.config.appWindow.width, this.config.appWindow.height);
            const resultText = await this.ocrService.detectText(resultImg);
            if (resultText.toLowerCase().includes("block unavailable")) {
                console.log((0, time_1.getCurrentTimeMMSS)(), " ❌ Block Unavailable - Someone else reserved that block.");
                this.emitAction('unavailable', 'Block unavailable - taken by someone else');
                return false;
            }
            else {
                console.log((0, time_1.getCurrentTimeMMSS)(), " ✅ Successfully scheduled the slot!");
                this.emitAction('success', `Scheduled ${(0, earnings_1.formatEarnings)(this.lastDetectedEarnings)}!`, this.lastDetectedEarnings);
                return true;
            }
        }
        catch (error) {
            console.error("Error during slot grab:", error);
            this.emitAction('failed', 'Error grabbing slot');
            return false;
        }
    }
    async start() {
        console.log("Starting Amazon Flex slot grabber...");
        console.log(`Refresh button position: (${this.config.refreshButtonX}, ${this.config.refreshButtonY})`);
        console.log(`Minimum earnings: ${(0, earnings_1.formatEarnings)(this.config.minEarnings)}`);
        console.log(`Interval: ${this.config.intervalMs}ms`);
        // Clear debug screenshots from previous run
        services_1.ScreenshotService.clearDebugScreenshots();
        this.isRunning = true;
        // Ensure OCR is ready before starting the main loop
        try {
            await this.ocrService.initialize();
            console.log("OCR service confirmed ready, starting main loop...");
        }
        catch (error) {
            console.error("Failed to initialize OCR service:", error);
            this.isRunning = false;
            throw error;
        }
        while (this.isRunning) {
            try {
                console.log("\x1b[36m%s\x1b[0m", `${(0, time_1.getCurrentTimeMMSS)()}, === LOOP ITERATION START, isRunning: ${this.isRunning} ===`);
                console.log("\x1b[32m%s\x1b[0m", `${(0, time_1.getCurrentTimeMMSS)()}, refreshing!`);
                (0, utils_1.clickPosition)(this.config.refreshButtonX, this.config.refreshButtonY);
                this.emitAction('refresh', 'Refreshed');
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, clicked refresh button`);
                await (0, utils_1.sleep)(500);
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, slept 500ms after refresh`);
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, checking for slots...`);
                const slotFound = await this.checkForSlot();
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, slot found: ${slotFound}, isRunning: ${this.isRunning}`);
                if (slotFound) {
                    console.log(`${(0, time_1.getCurrentTimeMMSS)()}, calling grabSlot()...`);
                    const success = await this.grabSlot();
                    console.log(`${(0, time_1.getCurrentTimeMMSS)()}, grabSlot returned: ${success}`);
                    if (success) {
                        console.log("🎉 Slot successfully scheduled! Stopping...");
                        this.stop();
                        break;
                    }
                }
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, waiting ${this.config.intervalMs}ms before next refresh...`);
                await (0, utils_1.sleep)(this.config.intervalMs || 350);
                console.log("\x1b[36m%s\x1b[0m", `${(0, time_1.getCurrentTimeMMSS)()}, === LOOP ITERATION END, isRunning: ${this.isRunning} ===`);
            }
            catch (error) {
                console.error(`${(0, time_1.getCurrentTimeMMSS)()}, ERROR in main loop:`, error);
                console.error("Stack trace:", error.stack);
                await (0, utils_1.sleep)(1000);
            }
        }
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, exited main loop, isRunning: ${this.isRunning}`);
    }
    stop() {
        console.log("Stopping slot grabber...");
        console.log("Called from:", new Error().stack);
        this.isRunning = false;
    }
    getLastDetectedEarnings() {
        return this.lastDetectedEarnings;
    }
}
exports.AmazonFlexSlotGrabber = AmazonFlexSlotGrabber;
