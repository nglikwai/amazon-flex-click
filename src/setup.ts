import robot from 'robotjs';
import { saveConfig } from './config';
import { Config } from './types';
import { sleep } from './utils';

export class SetupRecorder {
  private config: Partial<Config> = {};

  async recordCoordinates(): Promise<void> {
    console.log('Amazon Flex Slot Grabber Setup');
    console.log('=============================\n');

    console.log('This setup will help you record the coordinates for:');
    console.log('1. Refresh button');
    console.log('2. Search area (top-left and bottom-right corners)');
    console.log('3. Schedule button');
    console.log('4. Target text and interval\n');

    console.log('Instructions:');
    console.log('- Move your mouse to the specified location');
    console.log('- Press SPACE to record the position');
    console.log('- Press ESC to cancel\n');

    // Record refresh button
    await this.recordPosition('refresh button', (x, y) => {
      this.config.refreshButtonX = x;
      this.config.refreshButtonY = y;
    });

    // Record search area
    console.log('\nNow we need to define the search area...');
    let searchX1: number, searchY1: number, searchX2: number, searchY2: number;

    await this.recordPosition('TOP-LEFT corner of search area', (x, y) => {
      searchX1 = x;
      searchY1 = y;
    });

    await this.recordPosition('BOTTOM-RIGHT corner of search area', (x, y) => {
      searchX2 = x;
      searchY2 = y;
    });

    this.config.searchArea = {
      x: Math.min(searchX1, searchX2),
      y: Math.min(searchY1, searchY2),
      width: Math.abs(searchX2 - searchX1),
      height: Math.abs(searchY2 - searchY1)
    };

    // Record schedule button
    await this.recordPosition('schedule button', (x, y) => {
      this.config.scheduleButtonX = x;
      this.config.scheduleButtonY = y;
    });

    // Get target text and interval
    await this.getTextualConfig();

    // Save configuration
    const finalConfig = this.config as Config;
    saveConfig(finalConfig);

    console.log('\n✅ Setup complete! Configuration saved to config.json');
    console.log('You can now run: npm run start');
  }

  private async recordPosition(description: string, callback: (x: number, y: number) => void): Promise<void> {
    console.log(`\nPosition your mouse over the ${description} and press SPACE...`);

    return new Promise((resolve) => {
      const checkInput = () => {
        const keys = robot.getPixelColor(0, 0); // Just to keep the robot active

        if (robot.keyToggle('space', 'down')) {
          const mouse = robot.getMousePos();
          console.log(`✓ Recorded ${description} at: (${mouse.x}, ${mouse.y})`);
          callback(mouse.x, mouse.y);

          // Wait for key release
          setTimeout(() => {
            robot.keyToggle('space', 'up');
            resolve();
          }, 100);
        } else if (robot.keyToggle('escape', 'down')) {
          console.log('\nSetup cancelled.');
          process.exit(0);
        } else {
          setTimeout(checkInput, 50);
        }
      };

      checkInput();
    });
  }

  private async getTextualConfig(): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\nEnter the target text to search for (e.g., "3 hr 30 min"): ', (targetText: string) => {
        this.config.targetText = targetText || "3 hr 30 min";

        rl.question('Enter refresh interval in milliseconds (default: 1000): ', (interval: string) => {
          this.config.intervalMs = parseInt(interval) || 1000;
          rl.close();
          resolve();
        });
      });
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