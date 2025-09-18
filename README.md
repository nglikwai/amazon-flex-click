# Amazon Flex Slot Grabber

An automated TypeScript application for macOS that helps grab Amazon Flex delivery slots by continuously monitoring for available slots and clicking them automatically.

## Features

- Automatically clicks refresh button every 1 second
- Uses OCR to detect "3 hours 30 minutes" slots
- Automatically clicks on detected slots and schedule button
- Configurable screen positions and search areas

## Prerequisites

- macOS (required for robotjs automation)
- Node.js 16+
- Accessibility permissions for Terminal/your app

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Grant accessibility permissions:**
   - See detailed instructions in [SETUP-PERMISSIONS.md](./SETUP-PERMISSIONS.md)
   - Quick version: System Preferences → Security & Privacy → Privacy → Accessibility → Add your terminal app
   - This allows the app to control mouse and keyboard

3. **Configure screen positions:**

   Run the setup helper to capture exact positions:
   ```bash
   npm run setup
   ```

   Or manually edit the coordinates in `src/index.ts`:
   ```typescript
   const config: Config = {
     refreshButtonX: 800,    // X coordinate of refresh button
     refreshButtonY: 200,    // Y coordinate of refresh button
     searchArea: {
       x: 400,               // Left edge of slot area
       y: 300,               // Top edge of slot area
       width: 800,           // Width of slot area
       height: 400           // Height of slot area
     },
     targetText: "3 hr 30 min",
     intervalMs: 1000        // 1 second between clicks
   };
   ```

## Usage

1. **Open Amazon Flex** in your browser and navigate to the slots page
2. **Position the window** so refresh button and slots are visible
3. **Run the grabber:**
   ```bash
   npm start
   ```
4. **The app will:**
   - Click refresh button every second
   - Scan for "3 hours 30 minutes" text
   - Automatically click slot and schedule button when found
   - Stop after attempting to grab a slot

## Scripts

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript
- `npm start` - Build and run the app
- `npm run dev` - Run with ts-node for development
- `npm run setup` - Run position capture tool

## Configuration

Edit the `config` object in `src/index.ts`:

- `refreshButtonX/Y` - Exact pixel coordinates of refresh button
- `searchArea` - Rectangle where slots appear
- `targetText` - Text to search for (e.g., "3 hours 30 minutes")
- `intervalMs` - Milliseconds between refresh clicks

## Important Notes

⚠️ **Disclaimer:** This tool is for educational purposes. Use responsibly and in accordance with Amazon's terms of service.

- Test coordinates carefully before running
- Ensure Amazon Flex page is visible and active
- Press Ctrl+C to stop the application
- The app stops after one slot grab attempt

## Troubleshooting

**Permission denied errors:**
- Ensure accessibility permissions are granted
- Run from Terminal that has accessibility access

**App not clicking correctly:**
- Recapture screen positions using setup helper
- Verify Amazon Flex window is active and visible
- Check screen resolution and scaling settings

**OCR not detecting text:**
- Ensure text is clearly visible on screen
- Adjust searchArea to cover slot display area
- Text recognition works best with high contrast