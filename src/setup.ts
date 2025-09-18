import robot from 'robotjs';
import { saveConfig } from './config';
import { Config } from './types';

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
    console.log('- Press ENTER to record the position');
    console.log('- Press Ctrl+C to cancel\n');

    // Get coordinates
    await this.recordPosition('refresh button', (x, y) => {
      this.config.refreshButtonX = x;
      this.config.refreshButtonY = y;
    });

    // Define search area
    console.log('\nNow we need to define the search area...');
    let searchX1 = 0, searchY1 = 0, searchX2 = 0, searchY2 = 0;

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

    // Get schedule button
    await this.recordPosition('schedule button', (x, y) => {
      this.config.scheduleButtonX = x;
      this.config.scheduleButtonY = y;
    });

    // Set configuration
    await this.getTextualConfig();

    // Save config
    const finalConfig = this.config as Config;
    saveConfig(finalConfig);

    console.log('\n✅ Setup complete! Configuration saved to config.json');
    console.log('You can now run: npm run start');
  }

  private async recordPosition(description: string, callback: (x: number, y: number) => void): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log(`\nPosition your mouse over the ${description}`);
      rl.question('Press ENTER when ready to record this position: ', () => {
        const mouse = robot.getMousePos();
        console.log(`✓ Recorded ${description} at: (${mouse.x}, ${mouse.y})`);
        // Validate coordinates are within screen bounds
        const screenSize = robot.getScreenSize();
        if (mouse.x < 0 || mouse.x > screenSize.width || mouse.y < 0 || mouse.y > screenSize.height) {
          console.log(`⚠️  Warning: Coordinates (${mouse.x}, ${mouse.y}) may be outside screen bounds`);
        }
        callback(mouse.x, mouse.y);
        rl.close();
        resolve();
      });
    });
  }

  private async getTextualConfig(): Promise<void> {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\nEnter minimum earnings to accept (e.g., 25 for $25.00): ', (minEarnings: string) => {
        this.config.minEarnings = parseFloat(minEarnings) || 25;

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