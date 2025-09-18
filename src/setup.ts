import robot from "robotjs";
import { saveConfig } from "./config";
import { Config } from "./types";

export class SetupRecorder {
  private config: Partial<Config> = {};

  async recordCoordinates(): Promise<void> {
    console.log("Amazon Flex Setup");
    console.log("=================\n");

    // 1. Refresh button
    await this.recordPosition("refresh button", (x, y) => {
      this.config.refreshButtonX = x;
      this.config.refreshButtonY = y;
    });

    // 2. Search area
    let searchX1 = 0,
      searchY1 = 0,
      searchX2 = 0,
      searchY2 = 0;

    await this.recordPosition("search area top-left", (x, y) => {
      searchX1 = x;
      searchY1 = y;
    });

    await this.recordPosition("search area bottom-right", (x, y) => {
      searchX2 = x;
      searchY2 = y;
    });

    this.config.searchArea = {
      x: Math.min(searchX1, searchX2),
      y: Math.min(searchY1, searchY2),
      width: Math.abs(searchX2 - searchX1),
      height: Math.abs(searchY2 - searchY1),
    };

    // 3. Schedule button
    await this.recordPosition("schedule button", (x, y) => {
      this.config.scheduleButtonX = x;
      this.config.scheduleButtonY = y;
    });

    // 4. App window
    let appX1 = 0,
      appY1 = 0,
      appX2 = 0,
      appY2 = 0;

    await this.recordPosition("app window top-left", (x, y) => {
      appX1 = x;
      appY1 = y;
    });

    await this.recordPosition("app window bottom-right", (x, y) => {
      appX2 = x;
      appY2 = y;
    });

    this.config.appWindow = {
      x: Math.min(appX1, appX2),
      y: Math.min(appY1, appY2),
      width: Math.abs(appX2 - appX1),
      height: Math.abs(appY2 - appY1),
    };

    // 5. Minimum earnings
    await this.getTextualConfig();

    // Save config
    const finalConfig = this.config as Config;
    saveConfig(finalConfig);

    console.log("\n✅ Setup complete!");
  }

  private async recordPosition(
    description: string,
    callback: (x: number, y: number) => void
  ): Promise<void> {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(`${description}`, () => {
        const mouse = robot.getMousePos();
        // Validate coordinates are within screen bounds
        const screenSize = robot.getScreenSize();
        if (
          mouse.x < 0 ||
          mouse.x > screenSize.width ||
          mouse.y < 0 ||
          mouse.y > screenSize.height
        ) {
          console.log(
            `⚠️  Warning: Coordinates (${mouse.x}, ${mouse.y}) may be outside screen bounds`
          );
        }
        callback(mouse.x, mouse.y);
        rl.close();
        resolve();
      });
    });
  }

  private async getTextualConfig(): Promise<void> {
    const readline = require("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(
        "\nMinimum earnings (e.g., 25 for $25.00): ",
        (minEarnings: string) => {
          this.config.minEarnings = parseFloat(minEarnings) || 25;
          rl.close();
          resolve();
        }
      );
    });
  }
}

async function main() {
  const recorder = new SetupRecorder();
  await recorder.recordCoordinates();
}

if (require.main === module) {
  main().catch(console.error);
}
