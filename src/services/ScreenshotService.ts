import screenshot from "screenshot-desktop";
import sharp from "sharp";
import { DisplayManager } from "../utils/display";

export class ScreenshotService {
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

    // Crop to the specified region and enhance for OCR
    const croppedBuffer = await sharp(fullScreenshot)
      .extract({
        left: scaled.x,
        top: scaled.y,
        width: scaled.width,
        height: scaled.height,
      })
      .png({ quality: 100, compressionLevel: 0 })
      .toBuffer();

    // Save debug copy
    const fs = require("fs");
    if (!fs.existsSync("./tmp")) {
      fs.mkdirSync("./tmp", { recursive: true });
    }
    fs.writeFileSync("./tmp/debug_crop.png", croppedBuffer);

    return croppedBuffer;
  }
}
