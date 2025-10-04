#!/bin/bash

# =============================================================================
# Hybrid Automation Setup Script
# =============================================================================
# Sets up launchd + GitHub Actions hybrid automation system
# =============================================================================

set -e

PROJECT_DIR="/Users/i_kawano/Documents/crowd_data_dashboard_v2"
PLIST_FILE="$PROJECT_DIR/scripts/com.mygym.icloud-sync.plist"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
INSTALLED_PLIST="$LAUNCH_AGENTS_DIR/com.mygym.icloud-sync.plist"

echo "🚀 Setting up Hybrid Automation System..."
echo "📍 Project Directory: $PROJECT_DIR"

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ ERROR: Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"
echo "✅ Created logs directory"

# Copy plist to LaunchAgents
echo "📋 Installing launchd configuration..."
cp "$PLIST_FILE" "$INSTALLED_PLIST"
echo "✅ Copied plist to: $INSTALLED_PLIST"

# Load the launchd job
echo "🔄 Loading launchd job..."
launchctl load "$INSTALLED_PLIST"
echo "✅ launchd job loaded successfully"

# Check if job is loaded
if launchctl list | grep -q "com.mygym.icloud-sync"; then
    echo "✅ Job is running: com.mygym.icloud-sync"
else
    echo "⚠️ WARNING: Job may not be loaded properly"
fi

# Test the sync script
echo "🧪 Testing sync script..."
if [ -x "$PROJECT_DIR/scripts/icloud-sync.sh" ]; then
    echo "✅ Sync script is executable"
    echo "🔍 Running test sync..."
    "$PROJECT_DIR/scripts/icloud-sync.sh"
    echo "✅ Test sync completed"
else
    echo "❌ ERROR: Sync script is not executable"
    exit 1
fi

echo ""
echo "🎉 Hybrid Automation Setup Complete!"
echo ""
echo "📋 System Overview:"
echo "  • launchd: Syncs iCloud → inbox (3x daily: 00:05, 12:05, 18:05)"
echo "  • GitHub Actions: Processes screenshots → CSV (triggered by push)"
echo ""
echo "📊 Monitoring:"
echo "  • Sync logs: $PROJECT_DIR/logs/icloud-sync.log"
echo "  • launchd stdout: $PROJECT_DIR/logs/launchd-stdout.log"
echo "  • launchd stderr: $PROJECT_DIR/logs/launchd-stderr.log"
echo "  • GitHub Actions: https://github.com/iori73/crowd_data_dashboard_v2/actions"
echo ""
echo "🔧 Management Commands:"
echo "  • Check status: launchctl list | grep com.mygym.icloud-sync"
echo "  • Unload job: launchctl unload $INSTALLED_PLIST"
echo "  • Reload job: launchctl unload $INSTALLED_PLIST && launchctl load $INSTALLED_PLIST"
echo "  • Manual sync: $PROJECT_DIR/scripts/icloud-sync.sh"
echo ""
echo "✅ Setup completed successfully!"