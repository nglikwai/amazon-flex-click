"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AmazonFlexSlotGrabber_1 = require("./AmazonFlexSlotGrabber");
const config_1 = require("./config");
const utils_1 = require("./utils");
async function main() {
    console.log('🤖 Amazon Flex Slot Grabber');
    console.log('============================\n');
    // Validate configuration
    if (!(0, config_1.configExists)()) {
        console.log('⚠️  No configuration found!');
        console.log('Please run the setup first to record your screen coordinates:');
        console.log('npm run setup\n');
        return;
    }
    const config = (0, config_1.loadConfig)();
    const grabber = new AmazonFlexSlotGrabber_1.AmazonFlexSlotGrabber(config);
    try {
        await grabber.initialize();
        console.log('🎯 IMPORTANT: Make sure Amazon Flex is open and visible');
        console.log('🛑 Press Ctrl+C to stop the program');
        console.log('⏱️  Starting in 2 seconds...\n');
        await (0, utils_1.sleep)(2000);
        await grabber.start();
    }
    catch (error) {
        console.error('💥 Fatal error:', error);
    }
    finally {
        await grabber.cleanup();
    }
}
// Handle interruption
process.on('SIGINT', () => {
    console.log('\nStopping application...');
    process.exit(0);
});
main().catch(console.error);
