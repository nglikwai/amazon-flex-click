# How to Start the Amazon Flex Slotter Desktop App

## Quick Start

```bash
npm start
```

That's it! The Electron desktop app will launch with a modern UI.

## What Happens

1. The app will compile TypeScript
2. Copy static assets (HTML/CSS)
3. Launch the Electron window

## First-Time Setup

When you open the app for the first time:

1. Click the **Settings** button (bottom right)
2. Fill in all the configuration fields:
   - **Refresh Button X/Y**: Position of the refresh button in Amazon Flex
   - **Schedule Button X/Y**: Position of the accept/schedule button
   - **Search Area**: Rectangle where slot earnings are displayed (x, y, width, height)
   - **App Window**: Amazon Flex app window area (x, y, width, height)
   - **Minimum Earnings**: Minimum dollar amount to accept (e.g., 59 for $59)
   - **Detail Page Load (ms)**: Wait time for detail page (default: 600)
3. Click **Save Settings**

## Using the App

### Main Interface

The app has three sections:

1. **Top Panel**: Shows app name and logo
2. **Main Display**:
   - Status view (default) - Shows current status with animated icon
   - Settings view (when Settings button is clicked)
3. **Button Panel** (bottom):
   - **Start** (green) - Begin monitoring for slots
   - **Stop** (red) - Stop the bot
   - **Settings** (gray) - Configure the app

### Status Indicators

- **Gray Circle**: Stopped - Ready to start
- **Green Pulsing Circle**: Running - Actively monitoring
- **Green Checkmark**: Success - Slot grabbed!
- **Red Warning**: Error - Something went wrong

### Starting the Bot

1. Make sure Amazon Flex is open and visible
2. Click the **Start** button
3. The bot will:
   - Continuously refresh the page
   - Scan for slots using OCR
   - Click on slots that meet your minimum earnings
   - Attempt to schedule the slot
   - Stop after successful grab

### Stopping the Bot

You can stop the bot in two ways:
1. Click the **Stop** button at any time
2. Press the **ESC** key on your keyboard (works when bot is running)

## Development Mode

For development with auto-reload:

```bash
npm run dev
```

## Legacy CLI Mode

If you prefer the old command-line interface:

```bash
npm run dev:cli
```

## Troubleshooting

### "Cannot find module" errors
Run:
```bash
npm install
npm run rebuild
```

### App won't start
1. Make sure you have macOS (required for automation)
2. Grant accessibility permissions to your Terminal/Electron app
3. Check that all dependencies installed correctly

### Settings won't save
Check that the app has write permissions in the project directory.

## Permissions Required

The app needs **Accessibility permissions** on macOS to:
- Control the mouse cursor
- Click buttons automatically
- Take screenshots for OCR

Grant permissions: System Preferences → Security & Privacy → Privacy → Accessibility

## Building Distributable App

To create a standalone .dmg file:

```bash
npm run dist
```

The app will be in the `release/` folder.
