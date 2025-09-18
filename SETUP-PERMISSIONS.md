# macOS Accessibility Permissions Setup

To run the Amazon Flex slot grabber, you need to grant accessibility permissions to your terminal application. This allows the app to control your mouse and keyboard.

## Step-by-Step Instructions

### Method 1: System Preferences (macOS Monterey and earlier)

1. **Open System Preferences**
   - Click the Apple menu → System Preferences

2. **Navigate to Security & Privacy**
   - Click on "Security & Privacy"

3. **Go to Privacy Tab**
   - Click the "Privacy" tab at the top

4. **Select Accessibility**
   - In the left sidebar, scroll down and click "Accessibility"

5. **Unlock Settings**
   - Click the lock icon in the bottom left
   - Enter your admin password

6. **Add Your Terminal**
   - Click the "+" button below the app list
   - Navigate to and select your terminal app:
     - **Terminal**: `/Applications/Utilities/Terminal.app`
     - **iTerm2**: `/Applications/iTerm.app`
     - **VS Code**: `/Applications/Visual Studio Code.app` (if running from VS Code terminal)

7. **Enable the App**
   - Make sure the checkbox next to your terminal app is checked ✅

### Method 2: System Settings (macOS Ventura and later)

1. **Open System Settings**
   - Click the Apple menu → System Settings

2. **Navigate to Privacy & Security**
   - Click on "Privacy & Security" in the left sidebar

3. **Click Accessibility**
   - Scroll down and click "Accessibility"

4. **Add Your Terminal**
   - Click the "+" button
   - Navigate to and select your terminal app (see paths above)

5. **Toggle On**
   - Make sure the toggle switch next to your terminal app is ON 🟢

## Alternative: Grant Permission When Prompted

When you first run the app, macOS may show a dialog asking for permission:

1. **Click "Open System Preferences"** in the dialog
2. **Follow steps 4-7** from Method 1 above
3. **Return to terminal** and run the app again

## Verify Permissions

To test if permissions are working:

```bash
npm run setup
```

If you can move your mouse and the app detects the position, permissions are working correctly.

## Troubleshooting

### Permission Denied Error
```
Error: Permission denied
```
- Make sure you added the correct terminal app
- Restart your terminal after granting permissions
- Try running with `sudo` (not recommended for security)

### App Not Clicking
- Verify the terminal app is listed in Accessibility settings
- Make sure the checkbox/toggle is enabled
- Close and reopen your terminal
- Try running the setup tool to test mouse control

### Can't Find Terminal App
Common terminal application paths:
- **Terminal**: `/Applications/Utilities/Terminal.app`
- **iTerm2**: `/Applications/iTerm.app`
- **Hyper**: `/Applications/Hyper.app`
- **Alacritty**: `/Applications/Alacritty.app`
- **VS Code**: `/Applications/Visual Studio Code.app`

### Still Having Issues?

1. **Restart your computer** after granting permissions
2. **Check Console.app** for error messages
3. **Try a different terminal** application
4. **Run as administrator** (security risk - not recommended)

## Security Note

⚠️ Granting accessibility permissions allows applications to control your computer. Only grant these permissions to trusted applications and remove them when no longer needed.

To remove permissions later:
1. Go back to Accessibility settings
2. Select the app and click the "-" button
3. Or uncheck/toggle off the app