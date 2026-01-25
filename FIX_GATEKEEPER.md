# Fix "App is Damaged" Error on macOS

## Why This Happens

When you build an Electron app without code signing and transfer it to another Mac (or download it), macOS Gatekeeper marks it as potentially unsafe and blocks it with an "app is damaged" message.

## Quick Fix (Remove Quarantine)

Open Terminal and run:

```bash
# If app is in Applications folder
xattr -cr /Applications/Amazon\ Flex\ Slotter.app

# If app is in Downloads folder
xattr -cr ~/Downloads/Amazon\ Flex\ Slotter.app

# If app is somewhere else, replace with your path
xattr -cr /path/to/Amazon\ Flex\ Slotter.app
```

**What this does:** Removes the quarantine attribute that macOS sets on files from the internet or other computers.

## Alternative: Right-Click to Open

1. Right-click (or Control+Click) on the app icon
2. Select "Open" from the menu
3. Click "Open" when the warning appears
4. The app will now run and be remembered as safe

## For Distribution: Code Signing (Optional but Recommended)

If you want to distribute this app to others without them seeing this error:

### Option 1: Ad-hoc Signing (Free)

```bash
# After building, sign the app with ad-hoc signature
codesign --deep --force --sign - release/mac-arm64/Amazon\ Flex\ Slotter.app
```

### Option 2: Apple Developer Signing (Requires Apple Developer Account - $99/year)

1. Join the Apple Developer Program
2. Create a Developer ID Application certificate
3. Update `package.json` build configuration:

```json
"build": {
  "mac": {
    "identity": "Developer ID Application: Your Name (TEAM_ID)",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build/entitlements.mac.plist",
    "entitlementsInherit": "build/entitlements.mac.plist"
  }
}
```

4. Notarize the app with Apple

### Option 3: Self-Distribution Without Signing

If distributing to friends/colleagues without signing:

**Include these instructions:**

```
To open Amazon Flex Slotter:

1. Download and move to Applications folder
2. Open Terminal
3. Run: xattr -cr /Applications/Amazon\ Flex\ Slotter.app
4. Now you can open the app normally
```

## Why Not Just Disable Gatekeeper?

**Don't do this:** `sudo spctl --master-disable`

This disables all of macOS security checks system-wide and is dangerous. Use the xattr command instead, which only affects the specific app.

## Creating a Helper Script

You can create a simple script to fix the app after installation:

```bash
#!/bin/bash
# fix-app.sh

echo "Fixing Amazon Flex Slotter Gatekeeper issue..."
xattr -cr "/Applications/Amazon Flex Slotter.app"
echo "Done! You can now open the app."
```

Save this as `fix-app.sh`, make it executable, and distribute it with your app:

```bash
chmod +x fix-app.sh
./fix-app.sh
```

## Summary

- **Quick Fix:** `xattr -cr` command (recommended)
- **One-time Fix:** Right-click → Open
- **Proper Fix:** Get Apple Developer account and code sign
- **For Others:** Include fix instructions or use ad-hoc signing
