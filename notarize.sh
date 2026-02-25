#!/bin/bash

# Notarization Script for Notlok macOS DMG
# Usage: ./notarize.sh path/to/Notlok.dmg

set -e

DMG_PATH="$1"
BUNDLE_ID="com.notlok.desktop"
APPLE_ID="${APPLE_ID:-your-apple-id@email.com}"
TEAM_ID="${APPLE_TEAM_ID:-YOUR_TEAM_ID}"
APP_SPECIFIC_PASSWORD="${APPLE_APP_PASSWORD:-your-app-specific-password}"

if [ -z "$DMG_PATH" ]; then
    echo "Usage: ./notarize.sh path/to/Notlok.dmg"
    exit 1
fi

if [ ! -f "$DMG_PATH" ]; then
    echo "Error: DMG file not found at $DMG_PATH"
    exit 1
fi

echo "🔐 Submitting DMG for notarization..."

# Submit for notarization
xcrun notarytool submit "$DMG_PATH" \
    --apple-id "$APPLE_ID" \
    --team-id "$TEAM_ID" \
    --password "$APP_SPECIFIC_PASSWORD" \
    --wait

echo "✅ Notarization complete!"

# Staple the ticket
echo "📎 Stapling notarization ticket..."
xcrun stapler staple "$DMG_PATH"

echo "✅ DMG is now notarized and stapled!"
echo "📦 Ready for distribution: $DMG_PATH"

