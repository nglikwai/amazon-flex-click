import { Config } from "./types";
import { clickPosition, sleep } from "./utils";
import { parseEarnings, formatEarnings } from "./utils/earnings";
import { ScreenshotService, OCRService } from "./services";
import { getCurrentTimeMMSS } from "./utils/time";

// Amazon Flex Slot Grabber
export class AmazonFlexSlotGrabber {
  private config: Config;
  private ocrService: OCRService;
  private isRunning: boolean = false;

  constructor(config: Config) {
    this.config = config;
    this.ocrService = new OCRService();
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
    // Take screenshot of the search area only for better accuracy
    // console.log(getCurrentTimeMMSS(), " taking region screenshot...");
    const screenshot = await ScreenshotService.takeRegionScreenshot(
      this.config.searchArea.x,
      this.config.searchArea.y,
      this.config.searchArea.width,
      this.config.searchArea.height
    );

    // Extract numbers from the screenshot using OCR
    // console.log(getCurrentTimeMMSS(), " detecting numbers...");
    const text = await this.ocrService.detectNumbers(screenshot);

    // console.log(getCurrentTimeMMSS(), " Scanning for slots...");

    // Parse text to find the highest dollar amount (e.g., $45.50, $25.00)
    const detectedEarnings = parseEarnings(text);

    // console.log(getCurrentTimeMMSS(), " detectedEarnings: ", detectedEarnings);
    // Check if earnings meet our minimum threshold
    if (detectedEarnings >= this.config.minEarnings) {
      console.log(
        getCurrentTimeMMSS(),
        ` ✅ Found matched slot: ${formatEarnings(detectedEarnings)} `
      );
      return true;
    } else if (detectedEarnings > 0) {
      console.log(
        getCurrentTimeMMSS(),
        ` 💰 Found slot: ${formatEarnings(detectedEarnings)}`
      );
    }

    return false;
  }

  // Attempt to grab/schedule a slot that was found
  async grabSlot(): Promise<boolean> {
    console.log("Attempting to grab slot...");

    try {
      // Calculate center of search area where the slot should be
      const centerX =
        this.config.searchArea.x + this.config.searchArea.width / 2;
      const centerY =
        this.config.searchArea.y + this.config.searchArea.height / 2;

      // Click on the slot to open details
      clickPosition(centerX, centerY);

      // Wait for detail page to load
      await sleep(this.config.detailPageLoadMs);

      // Click the schedule button to book the slot
      console.log(getCurrentTimeMMSS(), " clicked on schedule button!");
      clickPosition(this.config.scheduleButtonX, this.config.scheduleButtonY);

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
        return false;
      } else {
        console.log(
          getCurrentTimeMMSS(),
          " ✅ Successfully scheduled the slot!"
        );
        return true;
      }
    } catch (error) {
      console.error("Error during slot grab:", error);
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

    this.isRunning = true;

    while (this.isRunning) {
      try {
        console.log(
          "\x1b[32m%s\x1b[0m",
          `${getCurrentTimeMMSS()}, refreshing!`
        );
        clickPosition(this.config.refreshButtonX, this.config.refreshButtonY);

        await sleep(500);

        const slotFound = await this.checkForSlot();

        if (slotFound) {
          const success = await this.grabSlot();

          if (success) {
            console.log("🎉 Slot successfully scheduled! Stopping...");
            this.stop();
            break;
          }
        }

        await sleep(350);
      } catch (error) {
        console.error("Error in main loop:", error);
        await sleep(1000);
      }
    }
  }

  stop(): void {
    console.log("Stopping slot grabber...");
    this.isRunning = false;
  }
}
