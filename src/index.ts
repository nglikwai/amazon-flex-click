import { AmazonFlexSlotGrabber } from './AmazonFlexSlotGrabber';
import { loadConfig, configExists } from './config';
import { sleep } from './utils';

async function main() {
  console.log('🤖 Amazon Flex Slot Grabber');
  console.log('============================\n');

  // Check if config exists
  if (!configExists()) {
    console.log('⚠️  No configuration found!');
    console.log('Please run the setup first to record your screen coordinates:');
    console.log('npm run setup\n');
    return;
  }

  const config = loadConfig();
  const grabber = new AmazonFlexSlotGrabber(config);

  // Display loaded configuration
  console.log('📋 Loaded Configuration:');
  console.log(`   Refresh Button: (${config.refreshButtonX}, ${config.refreshButtonY})`);
  console.log(`   Search Area: (${config.searchArea.x}, ${config.searchArea.y}) ${config.searchArea.width}x${config.searchArea.height}`);
  console.log(`   Schedule Button: (${config.scheduleButtonX}, ${config.scheduleButtonY})`);
  console.log(`   Target Text: "${config.targetText}"`);
  console.log(`   Interval: ${config.intervalMs}ms\n`);

  try {
    await grabber.initialize();

    console.log('🎯 IMPORTANT: Make sure Amazon Flex is open and visible');
    console.log('🛑 Press Ctrl+C to stop the program');
    console.log('⏱️  Starting in 5 seconds...\n');

    await sleep(5000);

    await grabber.start();

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await grabber.cleanup();
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\nStopping application...');
  process.exit(0);
});

main().catch(console.error);