import screenshot from "screenshot-desktop";
import sharp from "sharp";
import { DisplayManager } from "../utils/display";
import * as fs from "fs";
import * as path from "path";

// Minimum dimensions for OCR to work reliably
const MIN_OCR_WIDTH = 60;
const MIN_OCR_HEIGHT = 27;

// Debug directory for saving screenshots
const DEBUG_DIR = "./tmp/debug-screenshots";

export class ScreenshotService {
  private static screenshotCounter = 0;

  // Clear all debug screenshots from previous runs
  static clearDebugScreenshots(): void {
    if (fs.existsSync(DEBUG_DIR)) {
      const files = fs.readdirSync(DEBUG_DIR);
      for (const file of files) {
        if (file.endsWith('.png')) {
          fs.unlinkSync(path.join(DEBUG_DIR, file));
        }
      }
      console.log(`Cleared ${files.length} debug screenshots from previous run`);
    }
    this.screenshotCounter = 0;
  }

  // Save debug screenshot with timestamp
  private static saveDebugScreenshot(buffer: Buffer, prefix: string): void {
    if (!fs.existsSync(DEBUG_DIR)) {
      fs.mkdirSync(DEBUG_DIR, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `${String(this.screenshotCounter).padStart(4, '0')}_${timestamp}_${prefix}.png`;
    const filepath = path.join(DEBUG_DIR, filename);
    
    fs.writeFileSync(filepath, buffer);
    this.screenshotCounter++;
  }
  static async takeScreenshot(): Promise<Buffer> {
    try {
      const imgBuffer = await screenshot({ format: "png" });
      return imgBuffer;
    } catch (error) {
      throw new Error(`Failed to take screenshot: ${error}`);
    }
  }

  static async takeRegionScreenshot(
    x: number,
    y: number,
    width: number,
    height: number
  ): Promise<Buffer> {
    // Take full screenshot first
    const fullScreenshot = await screenshot({ format: "png" });

    // Automatically scale coordinates based on display DPI
    const scaled = await DisplayManager.scaleCoordinates(x, y, width, height);

    // Crop to the specified region
    let sharpInstance = sharp(fullScreenshot).extract({
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
        kernel: sharp.kernel.lanczos3, // High-quality upscaling
        fit: 'fill'
      });
    }

    const croppedBuffer = await sharpInstance
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();

    // Save debug copy with timestamp
    this.saveDebugScreenshot(croppedBuffer, 'crop');

    return croppedBuffer;
  }
}
