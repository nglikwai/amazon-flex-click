import screenshot from 'screenshot-desktop';
import robot from 'robotjs';

export interface DisplayInfo {
  logicalWidth: number;
  logicalHeight: number;
  actualWidth: number;
  actualHeight: number;
  scalingFactor: number;
}

export class DisplayManager {
  private static cachedDisplayInfo: DisplayInfo | null = null;

  static async getDisplayInfo(): Promise<DisplayInfo> {
    if (this.cachedDisplayInfo) {
      return this.cachedDisplayInfo;
    }

    // Get logical screen size from robotjs
    const screenSize = robot.getScreenSize();
    const logicalWidth = screenSize.width;
    const logicalHeight = screenSize.height;

    // Take a screenshot to get actual pixel dimensions
    const screenshotBuffer = await screenshot({ format: 'png' });
    const sharp = require('sharp');
    const metadata = await sharp(screenshotBuffer).metadata();
    const actualWidth = metadata.width;
    const actualHeight = metadata.height;

    // Calculate scaling factor
    const scalingFactor = actualWidth / logicalWidth;

    this.cachedDisplayInfo = {
      logicalWidth,
      logicalHeight,
      actualWidth,
      actualHeight,
      scalingFactor
    };

    // console.log(`Display Info: ${logicalWidth}x${logicalHeight} logical, ${actualWidth}x${actualHeight} actual, ${scalingFactor}x scaling`);

    return this.cachedDisplayInfo;
  }

  static async scaleCoordinates(x: number, y: number, width: number, height: number): Promise<{x: number, y: number, width: number, height: number}> {
    const displayInfo = await this.getDisplayInfo();

    return {
      x: Math.round(x * displayInfo.scalingFactor),
      y: Math.round(y * displayInfo.scalingFactor),
      width: Math.round(width * displayInfo.scalingFactor),
      height: Math.round(height * displayInfo.scalingFactor)
    };
  }

  static clearCache(): void {
    this.cachedDisplayInfo = null;
  }
}