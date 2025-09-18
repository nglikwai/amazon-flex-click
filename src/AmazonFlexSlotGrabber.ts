import { Config } from './types';
import { clickPosition, sleep } from './utils';
import { ScreenshotService, OCRService } from './services';

export class AmazonFlexSlotGrabber {
  private config: Config;
  private ocrService: OCRService;
  private isRunning: boolean = false;

  constructor(config: Config) {
    this.config = config;
    this.ocrService = new OCRService();
  }

  async initialize(): Promise<void> {
    await this.ocrService.initialize();
  }

  async cleanup(): Promise<void> {
    await this.ocrService.cleanup();
  }

  async checkForSlot(): Promise<boolean> {
    try {
      const screenshot = await ScreenshotService.takeScreenshot();
      const text = await this.ocrService.detectText(screenshot);

      console.log('Scanning for slots...');

      if (text.toLowerCase().includes(this.config.targetText.toLowerCase())) {
        console.log(`Found target slot: ${this.config.targetText}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking for slot:', error);
      return false;
    }
  }

  async grabSlot(): Promise<boolean> {
    console.log('Attempting to grab slot...');

    try {
      const centerX = this.config.searchArea.x + this.config.searchArea.width / 2;
      const centerY = this.config.searchArea.y + this.config.searchArea.height / 2;

      clickPosition(centerX, centerY);

      await sleep(2000);

      clickPosition(this.config.scheduleButtonX, this.config.scheduleButtonY);

      await sleep(2000);

      const resultImg = await ScreenshotService.takeScreenshot();
      const resultText = await this.ocrService.detectText(resultImg);

      if (resultText.toLowerCase().includes('scheduled')) {
        console.log('✅ Successfully scheduled the slot!');
        return true;
      } else {
        console.log('❌ Failed to schedule - slot may have been taken by someone else');
        return false;
      }

    } catch (error) {
      console.error('Error during slot grab:', error);
      return false;
    }
  }

  async start(): Promise<void> {
    console.log('Starting Amazon Flex slot grabber...');
    console.log(`Refresh button position: (${this.config.refreshButtonX}, ${this.config.refreshButtonY})`);
    console.log(`Target text: "${this.config.targetText}"`);
    console.log(`Interval: ${this.config.intervalMs}ms`);

    this.isRunning = true;

    while (this.isRunning) {
      try {
        clickPosition(this.config.refreshButtonX, this.config.refreshButtonY);

        await sleep(500);

        const slotFound = await this.checkForSlot();

        if (slotFound) {
          console.log('🎯 Target slot found! Attempting to grab...');
          const success = await this.grabSlot();

          if (success) {
            console.log('🎉 Slot successfully scheduled! Stopping...');
            this.stop();
            break;
          } else {
            console.log('🔄 Grab failed, continuing to search...');
          }
        }

        await sleep(this.config.intervalMs);

      } catch (error) {
        console.error('Error in main loop:', error);
        await sleep(1000);
      }
    }
  }

  stop(): void {
    console.log('Stopping slot grabber...');
    this.isRunning = false;
  }
}