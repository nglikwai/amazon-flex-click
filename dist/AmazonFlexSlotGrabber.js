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
        this.lastSlotScreenshot = null;
        this.lastSuccessMessage = '';
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
    isBlindMode() {
        return this.config.minEarnings === 0;
    }
    // Initialize the OCR service for text detection (skipped in blind mode)
    async initialize() {
        if (this.isBlindMode())
            return;
        await this.ocrService.initialize();
    }
    // Clean up resources when shutting down
    async cleanup() {
        if (this.isBlindMode())
            return;
        await this.ocrService.cleanup();
    }
    // Check if there's a slot with earnings >= minimum threshold
    async checkForSlot() {
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] START`);
        // Blind mode (minEarnings=0): skip screencap/OCR and always attempt to grab
        if (this.isBlindMode()) {
            console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] blind mode — skipping OCR`);
            this.emitAction('scanning', 'Blind mode — clicking without OCR');
            return true;
        }
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
        // Check if earnings meet our min/max threshold
        const meetsMin = detectedEarnings >= this.config.minEarnings;
        const meetsMax = this.config.maxEarnings === 0 || detectedEarnings <= this.config.maxEarnings;
        // Check average earnings per hour if configured and a time area is set
        let meetsAvgPerHour = true;
        let workingHours = null;
        if (meetsMin && meetsMax && detectedEarnings > 0 && this.config.minAvgEarningsPerHour > 0) {
            const timeScreenshot = await services_1.ScreenshotService.takeRegionScreenshot(this.config.timeArea.x, this.config.timeArea.y, this.config.timeArea.width, this.config.timeArea.height);
            const timeText = await this.ocrService.detectText(timeScreenshot);
            console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] time text: "${timeText.trim()}"`);
            workingHours = (0, time_1.parseWorkingHours)(timeText);
            if (workingHours !== null && workingHours > 0) {
                const avgPerHour = detectedEarnings / workingHours;
                meetsAvgPerHour = avgPerHour >= this.config.minAvgEarningsPerHour;
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] ${workingHours.toFixed(2)}h → ${(0, earnings_1.formatEarnings)(avgPerHour)}/hr (min: ${(0, earnings_1.formatEarnings)(this.config.minAvgEarningsPerHour)}/hr) meets: ${meetsAvgPerHour}`);
                if (!meetsAvgPerHour) {
                    this.emitAction('found', `Detected ${(0, earnings_1.formatEarnings)(detectedEarnings)} / ${workingHours.toFixed(1)}h = ${(0, earnings_1.formatEarnings)(avgPerHour)}/hr (below min avg)`, detectedEarnings);
                }
            }
            else {
                console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] could not parse working hours from time text`);
                meetsAvgPerHour = false;
                this.emitAction('found', `Detected ${(0, earnings_1.formatEarnings)(detectedEarnings)} but could not read working hours (avg $/hr filter requires it)`, detectedEarnings);
            }
        }
        if (meetsMin && meetsMax && meetsAvgPerHour) {
            this.lastDetectedEarnings = detectedEarnings;
            this.lastSlotScreenshot = screenshot;
            const hourStr = workingHours ? ` / ${workingHours.toFixed(1)}h = ${(0, earnings_1.formatEarnings)(detectedEarnings / workingHours)}/hr` : '';
            this.lastSuccessMessage = `${(0, earnings_1.formatEarnings)(detectedEarnings)}${hourStr}`;
            console.log((0, time_1.getCurrentTimeMMSS)(), ` ✅ Found matched slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)}${hourStr}`);
            this.emitAction('found', `Found ${(0, earnings_1.formatEarnings)(detectedEarnings)} slot!${hourStr}`, detectedEarnings);
            console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] END - returning true`);
            return true;
        }
        else if (detectedEarnings > 0 && !meetsAvgPerHour) {
            // already emitted above
        }
        else if (detectedEarnings > 0) {
            console.log((0, time_1.getCurrentTimeMMSS)(), ` 💰 Found slot: ${(0, earnings_1.formatEarnings)(detectedEarnings)}`);
            const reason = !meetsMin ? 'below min' : 'above max';
            this.emitAction('found', `Detected ${(0, earnings_1.formatEarnings)(detectedEarnings)} (${reason})`, detectedEarnings);
        }
        console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [checkForSlot] END - returning false`);
        return false;
    }
    // Attempt to grab/schedule a slot that was found
    async grabSlot() {
        const blind = this.isBlindMode();
        console.log(blind ? "Blind grab (no OCR)..." : "Attempting to grab slot...");
        this.emitAction('grabbing', blind
            ? 'Blind click searchArea + schedule...'
            : `Grabbing ${(0, earnings_1.formatEarnings)(this.lastDetectedEarnings)} slot...`, blind ? undefined : this.lastDetectedEarnings);
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
            // Blind mode: no verification — keep looping until stopped manually
            if (blind) {
                await (0, utils_1.sleep)(200);
                return false;
            }
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
        const blind = this.isBlindMode();
        console.log("Starting Amazon Flex slot grabber...");
        console.log(`Refresh button position: (${this.config.refreshButtonX}, ${this.config.refreshButtonY})`);
        console.log(blind
            ? "Mode: BLIND (minEarnings=0) — no screencap/OCR, blink-click only"
            : `Minimum earnings: ${(0, earnings_1.formatEarnings)(this.config.minEarnings)}`);
        console.log(`Interval: ${this.config.intervalMs}ms`);
        // Clear debug screenshots from previous run
        if (!blind)
            services_1.ScreenshotService.clearDebugScreenshots();
        this.isRunning = true;
        // Ensure OCR is ready before starting the main loop (skipped in blind mode)
        if (!blind) {
            try {
                await this.ocrService.initialize();
                console.log("OCR service confirmed ready, starting main loop...");
            }
            catch (error) {
                console.error("Failed to initialize OCR service:", error);
                this.isRunning = false;
                throw error;
            }
        }
        else {
            console.log("Blind mode ready, starting main loop...");
        }
        let noSlotCount = 0;
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
                    noSlotCount = 0;
                    console.log(`${(0, time_1.getCurrentTimeMMSS)()}, calling grabSlot()...`);
                    const success = await this.grabSlot();
                    console.log(`${(0, time_1.getCurrentTimeMMSS)()}, grabSlot returned: ${success}`);
                    if (success) {
                        console.log("🎉 Slot successfully scheduled! Stopping...");
                        this.stop();
                        break;
                    }
                }
                else if (!blind) {
                    noSlotCount++;
                    const interval = this.config.justForYouCheckInterval ?? 0;
                    if (interval > 0 && noSlotCount % interval === 0) {
                        await this.checkJustForYou();
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
    async checkJustForYou() {
        const area = this.config.justForYouArea;
        if (!area?.width || !area?.height)
            return;
        try {
            const screenshot = await services_1.ScreenshotService.takeRegionScreenshot(area.x, area.y, area.width, area.height);
            const text = await this.ocrService.detectText(screenshot);
            console.log(`${(0, time_1.getCurrentTimeMMSS)()}, [justForYou] OCR: "${text.trim().replace(/\n/g, ' ')}"`);
            if (text.toLowerCase().includes('just for you')) {
                this.emitAction('scanning', 'Just for you detected — declining...');
                (0, utils_1.clickPosition)(this.config.justForYouSlotX, this.config.justForYouSlotY);
                await (0, utils_1.sleep)(this.config.detailPageLoadMs);
                (0, utils_1.clickPosition)(this.config.justForYouDeclineX, this.config.justForYouDeclineY);
                await (0, utils_1.sleep)(this.config.detailPageLoadMs);
                (0, utils_1.clickPosition)(this.config.justForYouConfirmDeclineX, this.config.justForYouConfirmDeclineY);
                await (0, utils_1.sleep)(this.config.detailPageLoadMs);
            }
        }
        catch (err) {
            console.error(`${(0, time_1.getCurrentTimeMMSS)()}, [justForYou] error:`, err);
        }
    }
    stop() {
        console.log("Stopping slot grabber...");
        console.log("Called from:", new Error().stack);
        this.isRunning = false;
    }
    getLastDetectedEarnings() {
        return this.lastDetectedEarnings;
    }
    getLastSlotScreenshot() {
        return this.lastSlotScreenshot;
    }
    getLastSuccessMessage() {
        return this.lastSuccessMessage;
    }
}
exports.AmazonFlexSlotGrabber = AmazonFlexSlotGrabber;
