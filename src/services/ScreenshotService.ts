import screenshot from "screenshot-desktop";
import sharp from "sharp";
import { DisplayManager } from "../utils/display";
import * as fs from "fs";
import * as path from "path";

export class ScreenshotService {
  private static screenshotCounter = 0;
  private static debugDir = "./tmp/debug-screenshots";

  static setDebugDir(dir: string): void {
    this.debugDir = dir;
  }

  static getDebugDir(): string {
    return this.debugDir;
  }

  // Clear all debug screenshots from previous runs
  static clearDebugScreenshots(): void {
    if (fs.existsSync(this.debugDir)) {
      const files = fs.readdirSync(this.debugDir);
      for (const file of files) {
        if (file.endsWith('.png')) {
          fs.unlinkSync(path.join(this.debugDir, file));
        }
      }
      console.log(`Cleared ${files.length} debug screenshots from previous run`);
    }
    this.screenshotCounter = 0;
  }

  // Save debug screenshot with timestamp
  private static saveDebugScreenshot(buffer: Buffer, prefix: string): void {
    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `${String(this.screenshotCounter).padStart(4, '0')}_${timestamp}_${prefix}.png`;
    const filepath = path.join(this.debugDir, filename);
    
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

    const originalBuffer = await sharpInstance
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();
    this.saveDebugScreenshot(originalBuffer, 'original');

    return originalBuffer;
  }
}
