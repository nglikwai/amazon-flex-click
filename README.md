# Amazon Flex Slotter

An automated Electron desktop application for macOS that helps grab Amazon Flex delivery slots by continuously monitoring for available slots and clicking them automatically.

## 🚀 Quick Start

```bash
npm start
```

See [START.md](./START.md) for detailed launch instructions and first-time setup guide.

## Features

- **Modern Desktop UI** - Clean, intuitive Electron interface with dark theme
- **Real-time Status Display** - Visual indicators for running, stopped, success, and error states
- **Easy Configuration** - Built-in settings panel for all configuration options
- **OCR Detection** - Uses Tesseract.js to detect earnings amounts
- **Automatic Scheduling** - Automatically clicks on slots and schedule button
- **Configurable** - Customizable screen positions, search areas, and minimum earnings

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

1. **Launch the app:**
   ```bash
   npm start
   ```

2. **First-time setup:**
   - Click the **Settings** button in the bottom panel
   - Configure all the required coordinates:
     - **Refresh Button Position** - Where the refresh button is located
     - **Schedule Button Position** - Where the schedule/accept button is located
     - **Search Area** - The region where slot earnings are displayed
     - **App Window** - The Amazon Flex app window area
     - **Minimum Earnings** - The minimum dollar amount to accept
     - **Detail Page Load Time** - How long to wait for detail page to load (ms)
   - Click **Save Settings** when done

3. **Open Amazon Flex** and position the window so it's visible

4. **Start monitoring:**
   - Click the **Start** button in the app
   - The status display will show "Running" with a green indicator
   - The app will continuously monitor for slots meeting your minimum earnings

5. **The app will automatically:**
   - Click the refresh button periodically
   - Scan for slot earnings using OCR
   - Click on slots that meet your minimum earnings threshold
   - Attempt to schedule/accept the slot
   - Display success or error status

6. **Stop monitoring:**
   - Click the **Stop** button to halt the bot
   - Or press **ESC** key on your keyboard
   - The app will also auto-stop after successfully grabbing a slot

## Scripts

- `npm install` - Install dependencies and rebuild native modules
- `npm run build` - Compile TypeScript and copy static assets
- `npm start` - Build and launch the Electron app
- `npm run dev` - Build and launch in development mode
- `npm run dev:cli` - Run the CLI version (legacy)
- `npm run setup:dev` - Run position capture tool (CLI helper)
- `npm run pack` - Package the app for distribution (unpacked)
- `npm run dist` - Build distributable app (.dmg and .zip)

## Configuration

Configuration is managed through the app's built-in Settings panel. The settings are saved to `config.json` in the project root.

**Available Settings:**
- `refreshButtonX/Y` - Exact pixel coordinates of the refresh button
- `scheduleButtonX/Y` - Exact pixel coordinates of the schedule/accept button
- `searchArea` - Rectangle coordinates where slot earnings are displayed (x, y, width, height)
- `appWindow` - Amazon Flex app window coordinates (x, y, width, height)
- `minEarnings` - Minimum dollar amount to accept (e.g., 59 for $59)
- `detailPageLoadMs` - Milliseconds to wait for detail page to load (default: 600)

**Alternative Configuration:**
You can also manually edit `config.json` or use the legacy CLI setup tool:
```bash
npm run setup:dev
```

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