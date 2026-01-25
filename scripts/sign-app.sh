#!/bin/bash

# Sign the built app with ad-hoc signature to prevent "damaged app" errors
# This doesn't require an Apple Developer account

echo "🔐 Signing Amazon Flex Slotter with ad-hoc signature..."

# Sign ARM64 version
if [ -d "release/mac-arm64/Amazon Flex Slotter.app" ]; then
  echo "Signing ARM64 version..."
  codesign --deep --force --sign - "release/mac-arm64/Amazon Flex Slotter.app"
  echo "✅ ARM64 version signed"
fi

# Sign x64 version
if [ -d "release/mac/Amazon Flex Slotter.app" ]; then
  echo "Signing x64 version..."
  codesign --deep --force --sign - "release/mac/Amazon Flex Slotter.app"
  echo "✅ x64 version signed"
fi

echo "🎉 Code signing complete!"
echo ""
echo "Note: This is ad-hoc signing. For distribution to others,"
echo "you may want to use a Developer ID certificate."
