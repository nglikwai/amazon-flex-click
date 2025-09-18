import { AmazonFlexSlotGrabber } from './AmazonFlexSlotGrabber';
import { loadConfig, configExists } from './config';
import { sleep } from './utils';

async function main() {
  console.log('🤖 Amazon Flex Slot Grabber');
  console.log('============================\n');

  // Validate configuration
  if (!configExists()) {
    console.log('⚠️  No configuration found!');
    console.log('Please run the setup first to record your screen coordinates:');
    console.log('node ./disk/setup.js\n');
    return;
  }

  const config = loadConfig();
  const grabber = new AmazonFlexSlotGrabber(config);

  try {
    await grabber.initialize();

    console.log('🎯 IMPORTANT: Make sure Amazon Flex is open and visible');
    console.log('🛑 Press Ctrl+C to stop the program');
    console.log('⏱️  Starting in 2 seconds...\n');

    await sleep(2000);

    await grabber.start();

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await grabber.cleanup();
  }
}

// Handle interruption
process.on('SIGINT', () => {
  console.log('\nStopping application...');
  process.exit(0);
});

main().catch(console.error);