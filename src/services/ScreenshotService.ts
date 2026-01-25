import screenshot from "screenshot-desktop";
import sharp from "sharp";
import { DisplayManager } from "../utils/display";
import * as fs from "fs";
import * as path from "path";

// Minimum dimensions for OCR to work reliably - increased for smaller phone screens
const MIN_OCR_WIDTH = 120;
const MIN_OCR_HEIGHT = 54;

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

    // Save original crop for debugging
    const originalBuffer = await sharpInstance
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    this.saveDebugScreenshot(originalBuffer, 'original');

    // Always upscale for better OCR on small phone screens (2x minimum)
    const MIN_SCALE = 2.5;
    const scaleX = scaled.width < MIN_OCR_WIDTH ? MIN_OCR_WIDTH / scaled.width : MIN_SCALE;
    const scaleY = scaled.height < MIN_OCR_HEIGHT ? MIN_OCR_HEIGHT / scaled.height : MIN_SCALE;
    const scale = Math.max(scaleX, scaleY, MIN_SCALE);

    const newWidth = Math.round(scaled.width * scale);
    const newHeight = Math.round(scaled.height * scale);

    console.log(`Upscaling image from ${scaled.width}x${scaled.height} to ${newWidth}x${newHeight} (${scale.toFixed(2)}x) for better OCR`);

    // Upscale with high-quality interpolation
    sharpInstance = sharp(originalBuffer).resize(newWidth, newHeight, {
      kernel: sharp.kernel.lanczos3, // High-quality upscaling
      fit: 'fill'
    });

    // Apply preprocessing for better OCR on small text
    const processedBuffer = await sharpInstance
      .grayscale() // Convert to grayscale for better contrast
      .normalize() // Auto-adjust contrast
      .sharpen({ sigma: 1.5 }) // Sharpen text edges
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();

    // Save processed version for debugging
    this.saveDebugScreenshot(processedBuffer, 'processed');

    return processedBuffer;
  }
}
