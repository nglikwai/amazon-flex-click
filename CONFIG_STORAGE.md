# Configuration Storage

## Overview

Amazon Flex Slotter now uses persistent configuration storage that survives app restarts, updates, and reinstallations (as long as you don't delete the app's data folder).

## Where is the config stored?

The configuration file is stored in your macOS Application Support directory:

```
~/Library/Application Support/amazon-flex-slotter/config.json
```

## First-Time Users

When you run the app for the first time, it automatically creates a default configuration file with these settings:

```json
{
  "refreshButtonX": 1300,
  "refreshButtonY": 989,
  "scheduleButtonX": 1290,
  "scheduleButtonY": 957,
  "searchArea": {
    "x": 1420,
    "y": 400,
    "width": 62,
    "height": 27
  },
  "appWindow": {
    "x": 1085,
    "y": 240,
    "width": 431,
    "height": 123
  },
  "minEarnings": 60,
  "intervalMs": 500,
  "detailPageLoadMs": 1000
}
```

## How to Use

1. **First Run**: The app automatically creates default settings
2. **Configure Settings**: Click the Settings button to customize your coordinates and preferences
3. **Save**: Click "Save Settings" to persist your changes
4. **Reset**: Click "Reset" button to restore default settings
5. **Persistent**: Your settings are saved even after quitting and reopening the app

## Manually Edit Config

If you want to manually edit the configuration file:

1. Open Finder
2. Press `Cmd + Shift + G` (Go to Folder)
3. Paste: `~/Library/Application Support/amazon-flex-slotter/`
4. Edit `config.json` with any text editor
5. Restart the app to load the new settings

## Backup Your Config

To backup your configuration:

```bash
cp ~/Library/Application\ Support/amazon-flex-slotter/config.json ~/Desktop/flex-config-backup.json
```

To restore from backup:

```bash
cp ~/Desktop/flex-config-backup.json ~/Library/Application\ Support/amazon-flex-slotter/config.json
```

## Delete Configuration

To completely remove the configuration and start fresh:

```bash
rm ~/Library/Application\ Support/amazon-flex-slotter/config.json
```

The app will recreate the default config on next launch.

## Configuration Fields

| Field | Description | Default |
|-------|-------------|---------|
| `minEarnings` | Minimum earnings ($) to accept | 60 |
| `intervalMs` | Time between refresh clicks (ms) | 500 |
| `detailPageLoadMs` | Time to wait for detail page (ms) | 1000 |
| `refreshButtonX/Y` | Coordinates of refresh button | 1300, 989 |
| `scheduleButtonX/Y` | Coordinates of schedule button | 1290, 957 |
| `searchArea` | Screen region for OCR earnings detection | See default above |
| `appWindow` | Amazon Flex app window position/size | See default above |

## Troubleshooting

**Config not persisting?**
- Make sure you click "Save Settings" button
- Check file permissions in `~/Library/Application Support/amazon-flex-slotter/`
- Check Console.app for error messages from the app

**Need to reset everything?**
- Use the "Reset" button in Settings view
- Or manually delete the config file as shown above
