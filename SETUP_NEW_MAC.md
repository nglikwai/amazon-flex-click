# Setup Guide for New Mac (M4 Chip)

## Complete Setup Steps

When transferring or installing Amazon Flex Slotter on a new Mac, follow these steps in order:

---

## Step 1: Fix "App is Damaged" Error

After copying the app to your new M4 Mac, you'll see an error saying the app is damaged. This is normal for unsigned apps.

**Fix:**

1. Open **Terminal** (Applications → Utilities → Terminal)
2. Run this command:

```bash
xattr -cr /Applications/Amazon\ Flex\ Slotter.app
```

3. Press Enter
4. Done! The quarantine flag is removed.

---

## Step 2: Grant Accessibility Permissions

The app needs Accessibility permissions to control mouse clicks and Screen Recording to detect slots.

### Automatic Setup (Recommended)

1. Open the app (it should open now after Step 1)
2. The app will show a warning about missing permissions
3. Click the button to open System Preferences
4. Follow the on-screen instructions

### Manual Setup

1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security**
3. Click **Accessibility** in the left sidebar
4. Click the **🔒 Lock icon** at the bottom and enter your password
5. Click the **➕ Plus button**
6. Navigate to Applications and select **Amazon Flex Slotter**
7. Make sure the checkbox next to Amazon Flex Slotter is **✅ checked**
8. Also add it to **Screen Recording** permissions

### How to Find Privacy & Security:

**macOS Ventura and newer:**
- Apple menu () → System Settings → Privacy & Security → Accessibility

**macOS Monterey and older:**
- Apple menu () → System Preferences → Security & Privacy → Privacy tab → Accessibility

---

## Step 3: Verify Permissions

1. **Restart the Amazon Flex Slotter app** (important!)
2. Open the app
3. If you still see permission warnings, repeat Step 2
4. The app should now work normally

---

## Step 4: Configure Settings

1. Click the **Settings** button (gear icon)
2. Adjust coordinates for your screen setup
3. Set minimum earnings threshold
4. Click **Save Settings**

---

## Quick Command Reference

### Remove Quarantine (Step 1)
```bash
xattr -cr /Applications/Amazon\ Flex\ Slotter.app
```

### Check if quarantine flag exists
```bash
xattr -l /Applications/Amazon\ Flex\ Slotter.app
```

### Alternative: Right-Click Method
Instead of Terminal, you can:
1. Right-click (or Control+Click) on the app
2. Select **Open**
3. Click **Open** in the warning dialog
4. This permanently allows the app to run

---

## Troubleshooting

### Problem: "App is damaged" error persists
**Solution:** 
- Make sure you ran the `xattr -cr` command with the correct path
- Try the right-click method instead
- Make sure you're logged in as an admin user

### Problem: App opens but cannot click
**Solution:**
- The app needs Accessibility permissions (see Step 2)
- Make sure to **restart the app** after granting permissions
- Check System Settings → Privacy & Security → Accessibility
- Amazon Flex Slotter should be in the list with a ✅ checkmark

### Problem: Cannot take screenshots or detect slots
**Solution:**
- Grant **Screen Recording** permission
- System Settings → Privacy & Security → Screen Recording
- Add Amazon Flex Slotter and enable it
- Restart the app

### Problem: Permission settings are grayed out
**Solution:**
- Click the 🔒 Lock icon at the bottom of the Privacy settings
- Enter your Mac password
- Now you can add apps and toggle permissions

### Problem: App not in the Accessibility list
**Solution:**
1. Click the ➕ Plus button in Accessibility settings
2. Navigate to /Applications/
3. Select Amazon Flex Slotter
4. It should now appear in the list

---

## Why These Steps Are Needed

1. **Quarantine Flag**: macOS marks any app downloaded or transferred from another computer as potentially unsafe. The `xattr` command removes this flag.

2. **Accessibility Permission**: Required for the app to control mouse movements and clicks to automate the slot grabbing process.

3. **Screen Recording**: Required to take screenshots of the Amazon Flex app to detect available slots and earnings amounts.

---

## One-Time Setup Script

Create a file called `setup-flex-app.sh`:

```bash
#!/bin/bash

echo "🔧 Setting up Amazon Flex Slotter..."
echo ""

# Step 1: Remove quarantine
echo "Step 1: Removing quarantine flag..."
xattr -cr "/Applications/Amazon Flex Slotter.app"
echo "✅ Quarantine removed"
echo ""

# Step 2: Instructions for permissions
echo "Step 2: Grant permissions"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Opening System Settings..."
echo ""
echo "Please do the following:"
echo "1. Go to Privacy & Security → Accessibility"
echo "2. Click the lock icon and enter your password"
echo "3. Click + and add 'Amazon Flex Slotter'"
echo "4. Also add it to Screen Recording"
echo ""
echo "Press Enter when done..."

open "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"

read -p ""

echo ""
echo "✅ Setup complete!"
echo "You can now open Amazon Flex Slotter"
```

Make it executable and run:
```bash
chmod +x setup-flex-app.sh
./setup-flex-app.sh
```

---

## For Future Reference

If you transfer the app to another Mac, just repeat these steps. The app's configuration is stored separately in:

```
~/Library/Application Support/amazon-flex-slotter/config.json
```

Your settings will need to be reconfigured on the new machine as screen coordinates may differ.
