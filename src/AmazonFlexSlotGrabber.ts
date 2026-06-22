import { Config } from "./types";
import { clickPosition, sleep } from "./utils";
import { parseEarnings, formatEarnings } from "./utils/earnings";
import { ScreenshotService, OCRService } from "./services";
import { getCurrentTimeMMSS } from "./utils/time";

export type ActionType = 'refresh' | 'scanning' | 'found' | 'grabbing' | 'clicked' | 'success' | 'failed' | 'unavailable';

export interface ActionLog {
  type: ActionType;
  message: string;
  timestamp: Date;
  earnings?: number;
}

export type ActionCallback = (action: ActionLog) => void;

// Amazon Flex Slot Grabber
export class AmazonFlexSlotGrabber {
  private config: Config;
  private ocrService: OCRService;
  private isRunning: boolean = false;
  private lastDetectedEarnings: number = 0;
  private onAction: ActionCallback | null = null;

  constructor(config: Config) {
    this.config = config;
    this.ocrService = new OCRService();
  }

  setActionCallback(callback: ActionCallback): void {
    this.onAction = callback;
  }

  private emitAction(type: ActionType, message: string, earnings?: number): void {
    if (this.onAction) {
      this.onAction({ type, message, timestamp: new Date(), earnings });
    }
  }

  // Initialize the OCR service for text detection
  async initialize(): Promise<void> {
    await this.ocrService.initialize();
  }

  // Clean up resources when shutting down
  async cleanup(): Promise<void> {
    await this.ocrService.cleanup();
  }

  // Check if there's a slot with earnings >= minimum threshold
  async checkForSlot(): Promise<boolean> {
    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] START`);

    // Take screenshot of the search area only for better accuracy
    const screenshot = await ScreenshotService.takeRegionScreenshot(
      this.config.searchArea.x,
      this.config.searchArea.y,
      this.config.searchArea.width,
      this.config.searchArea.height
    );
    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] screenshot taken`);

    // Extract numbers from the screenshot using OCR
    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] calling detectNumbers...`);
    const text = await this.ocrService.detectNumbers(screenshot);
    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] detectNumbers returned: "${text}"`);

    // Parse text to find the highest dollar amount (e.g., $45.50, $25.00)
    const detectedEarnings = +text
    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] parsed earnings: ${detectedEarnings}`);

    // Check if earnings meet our min/max threshold
    const meetsMin = detectedEarnings >= this.config.minEarnings;
    const meetsMax = this.config.maxEarnings === 0 || detectedEarnings <= this.config.maxEarnings;
    if (meetsMin && meetsMax) {
      this.lastDetectedEarnings = detectedEarnings;
      console.log(
        getCurrentTimeMMSS(),
        ` ✅ Found matched slot: ${formatEarnings(detectedEarnings)} `
      );
      this.emitAction('found', `Found ${formatEarnings(detectedEarnings)} slot!`, detectedEarnings);
      console.log(`${getCurrentTimeMMSS()}, [checkForSlot] END - returning true`);
      return true;
    } else if (detectedEarnings > 0) {
      console.log(
        getCurrentTimeMMSS(),
        ` 💰 Found slot: ${formatEarnings(detectedEarnings)}`
      );
      const reason = !meetsMin ? 'below min' : 'above max';
      this.emitAction('found', `Detected ${formatEarnings(detectedEarnings)} (${reason})`, detectedEarnings);
    }

    console.log(`${getCurrentTimeMMSS()}, [checkForSlot] END - returning false`);
    return false;
  }

  // Attempt to grab/schedule a slot that was found
  async grabSlot(): Promise<boolean> {
    console.log("Attempting to grab slot...");
    this.emitAction('grabbing', `Grabbing ${formatEarnings(this.lastDetectedEarnings)} slot...`, this.lastDetectedEarnings);

    try {
      // Calculate center of search area where the slot should be
      const centerX =
        this.config.searchArea.x + this.config.searchArea.width / 2;
      const centerY =
        this.config.searchArea.y + this.config.searchArea.height / 2;

      // Click on the slot to open details
      clickPosition(centerX, centerY);
      this.emitAction('clicked', 'Clicked on slot');

      // Wait for detail page to load
      await sleep(this.config.detailPageLoadMs);

      // Click the schedule button to book the slot
      console.log(getCurrentTimeMMSS(), " clicked on schedule button!");
      clickPosition(this.config.scheduleButtonX, this.config.scheduleButtonY);
      this.emitAction('clicked', 'Clicked schedule button');

      // Wait for booking response
      await sleep(1000);

      // Verify if booking was successful by checking the app window content
      const resultImg = await ScreenshotService.takeRegionScreenshot(
        this.config.appWindow.x,
        this.config.appWindow.y,
        this.config.appWindow.width,
        this.config.appWindow.height
      );
      const resultText = await this.ocrService.detectText(resultImg);

      if (resultText.toLowerCase().includes("block unavailable")) {
        console.log(
          getCurrentTimeMMSS(),
          " ❌ Block Unavailable - Someone else reserved that block."
        );
        this.emitAction('unavailable', 'Block unavailable - taken by someone else');
        return false;
      } else {
        console.log(
          getCurrentTimeMMSS(),
          " ✅ Successfully scheduled the slot!"
        );
        this.emitAction('success', `Scheduled ${formatEarnings(this.lastDetectedEarnings)}!`, this.lastDetectedEarnings);
        return true;
      }
    } catch (error) {
      console.error("Error during slot grab:", error);
      this.emitAction('failed', 'Error grabbing slot');
      return false;
    }
  }

  async start(): Promise<void> {
    console.log("Starting Amazon Flex slot grabber...");
    console.log(
      `Refresh button position: (${this.config.refreshButtonX}, ${this.config.refreshButtonY})`
    );
    console.log(`Minimum earnings: ${formatEarnings(this.config.minEarnings)}`);
    console.log(`Interval: ${this.config.intervalMs}ms`);

    // Clear debug screenshots from previous run
    ScreenshotService.clearDebugScreenshots();

    this.isRunning = true;

    // Ensure OCR is ready before starting the main loop
    try {
      await this.ocrService.initialize();
      console.log("OCR service confirmed ready, starting main loop...");
    } catch (error) {
      console.error("Failed to initialize OCR service:", error);
      this.isRunning = false;
      throw error;
    }

    while (this.isRunning) {
      try {
        console.log(
          "\x1b[36m%s\x1b[0m",
          `${getCurrentTimeMMSS()}, === LOOP ITERATION START, isRunning: ${this.isRunning} ===`
        );
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getCurrentTimeMMSS()}, refreshing!`
        );
        clickPosition(this.config.refreshButtonX, this.config.refreshButtonY);
        this.emitAction('refresh', 'Refreshed');
        console.log(`${getCurrentTimeMMSS()}, clicked refresh button`);

        await sleep(500);
        console.log(`${getCurrentTimeMMSS()}, slept 500ms after refresh`);



        console.log(`${getCurrentTimeMMSS()}, checking for slots...`);
        const slotFound = await this.checkForSlot();
        console.log(`${getCurrentTimeMMSS()}, slot found: ${slotFound}, isRunning: ${this.isRunning}`);

        if (slotFound) {
          console.log(`${getCurrentTimeMMSS()}, calling grabSlot()...`);
          const success = await this.grabSlot();
          console.log(`${getCurrentTimeMMSS()}, grabSlot returned: ${success}`);

          if (success) {
            console.log("🎉 Slot successfully scheduled! Stopping...");
            this.stop();
            break;
          }
        }

        console.log(`${getCurrentTimeMMSS()}, waiting ${this.config.intervalMs}ms before next refresh...`);
        await sleep(this.config.intervalMs || 350);
        console.log(
          "\x1b[36m%s\x1b[0m",
          `${getCurrentTimeMMSS()}, === LOOP ITERATION END, isRunning: ${this.isRunning} ===`
        );
      } catch (error) {
        console.error(`${getCurrentTimeMMSS()}, ERROR in main loop:`, error);
        console.error("Stack trace:", (error as Error).stack);
        await sleep(1000);
      }
    }

    console.log(`${getCurrentTimeMMSS()}, exited main loop, isRunning: ${this.isRunning}`);
  }

  stop(): void {
    console.log("Stopping slot grabber...");
    console.log("Called from:", new Error().stack);
    this.isRunning = false;
  }

  getLastDetectedEarnings(): number {
    return this.lastDetectedEarnings;
  }
}
