import robot from 'robotjs';

class SetupHelper {
  static getMousePosition() {
    const pos = robot.getMousePos();
    console.log(`Current mouse position: (${pos.x}, ${pos.y})`);
    return pos;
  }

  static startPositionCapture() {
    console.log('Position Capture Tool');
    console.log('====================');
    console.log('Position your mouse precisely, then press ANY KEY to capture.');
    console.log('(robotjs cannot detect actual clicks on macOS)\n');

    const positions: { [key: string]: { x: number; y: number } } = {};

    const capturePosition = (name: string) => {
      return new Promise<void>((resolve) => {
        console.log(`\n📍 Click anywhere on: ${name}`);
        console.log('Waiting for mouse click...');

        // Since robotjs can't detect mouse clicks directly on macOS,
        // we'll use a simple approach: press any key after positioning mouse
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        console.log('Position your mouse and press ANY KEY (space, enter, etc.)');

        const onKeyPress = (key: string) => {
          if (key === '\u0003') { // Ctrl+C
            process.exit();
          }

          const pos = robot.getMousePos();
          positions[name] = pos;
          console.log(`✅ ${name} captured: (${pos.x}, ${pos.y})\n`);
          process.stdin.removeListener('data', onKeyPress);
          resolve();
        };

        process.stdin.on('data', onKeyPress);
      });
    };

    const captureSequence = async () => {
      console.log('Starting position capture sequence...\n');
      console.log('Instructions: Position mouse precisely, then press ANY KEY!\n');

      await capturePosition('refresh button');
      await capturePosition('slot area top-left corner');
      await capturePosition('slot area bottom-right corner');
      await capturePosition('schedule button');

      const topLeft = positions['slot area top-left corner'];
      const bottomRight = positions['slot area bottom-right corner'];

      console.log('🎉 All positions captured successfully!');
      console.log('\n=== Configuration ===');
      console.log('Copy these values to your config in src/index.ts:');
      console.log(`
const config: Config = {
  refreshButtonX: ${positions['refresh button'].x},
  refreshButtonY: ${positions['refresh button'].y},

  searchArea: {
    x: ${topLeft.x},
    y: ${topLeft.y},
    width: ${bottomRight.x - topLeft.x},
    height: ${bottomRight.y - topLeft.y}
  },

  scheduleButtonX: ${positions['schedule button'].x},
  scheduleButtonY: ${positions['schedule button'].y},

  targetText: "3 hr 30 min",
  intervalMs: 1000
};
      `);

      process.exit();
    };

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log('\n\nSetup cancelled by user.');
      process.exit(0);
    });

    captureSequence();
  }
}

// Run if this file is executed directly
if (require.main === module) {
  SetupHelper.startPositionCapture();
}

export default SetupHelper;