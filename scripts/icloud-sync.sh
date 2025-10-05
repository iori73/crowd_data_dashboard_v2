#!/bin/bash

# =============================================================================
# iCloud Screenshot Synchronization Script for launchd
# =============================================================================
# Purpose: Sync screenshots from iCloud to project inbox and trigger GitHub Actions
# Execution: via launchd every hour (or on schedule)
# =============================================================================

set -e  # Exit on any error

# Configuration
PROJECT_DIR="/Users/i_kawano/Documents/crowd_data_dashboard_v2"
ICLOUD_PATH="/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym"
INBOX_PATH="$PROJECT_DIR/screenshots/inbox"
LOG_FILE="$PROJECT_DIR/logs/icloud-sync.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🔄 Starting iCloud sync process..."

# Check if iCloud path exists
if [ ! -d "$ICLOUD_PATH" ]; then
    log "❌ ERROR: iCloud path not found: $ICLOUD_PATH"
    exit 1
fi

# Check if project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ ERROR: Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if git repository
if [ ! -d ".git" ]; then
    log "❌ ERROR: Not a git repository: $PROJECT_DIR"
    exit 1
fi

# Ensure inbox directory exists
mkdir -p "$INBOX_PATH"

# Count files before sync
BEFORE_COUNT=$(find "$INBOX_PATH" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | wc -l)
log "📊 Files in inbox before sync: $BEFORE_COUNT"

# Sync new files from iCloud to inbox
NEW_FILES=0
SUPPORTED_FORMATS=("*.png" "*.jpg" "*.jpeg" "*.bmp" "*.tiff")

for pattern in "${SUPPORTED_FORMATS[@]}"; do
    for file in "$ICLOUD_PATH"/$pattern; do
        # Check if file exists (glob might not match anything)
        [ -f "$file" ] || continue
        
        filename=$(basename "$file")
        dest_path="$INBOX_PATH/$filename"
        
        # Skip if file already exists in inbox
        if [ -f "$dest_path" ]; then
            continue
        fi
        
        # Filter for gym-related files (FP24, date format, fit keyword)
        if [[ "$filename" =~ FP24|2025:|fit ]]; then
            log "📋 Copying new file: $filename"
            cp "$file" "$dest_path"
            NEW_FILES=$((NEW_FILES + 1))
        fi
    done
done

# Count files after sync
AFTER_COUNT=$(find "$INBOX_PATH" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" | wc -l)
log "📊 Files in inbox after sync: $AFTER_COUNT"
log "✅ New files copied: $NEW_FILES"

# Create last sync marker file for tracking
LAST_SYNC_MARKER="$PROJECT_DIR/.last_sync"

# If new files were copied, commit and push to trigger GitHub Actions
if [ "$NEW_FILES" -gt 0 ]; then
    log "🔄 Committing new screenshots to git..."
    
    # Add new files specifically by finding them since last sync
    if [ -f "$LAST_SYNC_MARKER" ]; then
        # Find files newer than last sync marker
        find "$INBOX_PATH" -name "*.png" -newer "$LAST_SYNC_MARKER" -exec git add {} \;
        find "$INBOX_PATH" -name "*.jpg" -newer "$LAST_SYNC_MARKER" -exec git add {} \;
        find "$INBOX_PATH" -name "*.jpeg" -newer "$LAST_SYNC_MARKER" -exec git add {} \;
    else
        # First run, add all current files
        git add screenshots/inbox/*.png 2>/dev/null || true
        git add screenshots/inbox/*.jpg 2>/dev/null || true
        git add screenshots/inbox/*.jpeg 2>/dev/null || true
    fi
    
    # List what will be committed
    log "📋 Files staged for commit:"
    git diff --staged --name-only | while read -r file; do
        log "   📄 $file"
    done
    
    # Check if there are changes to commit
    if git diff --staged --quiet; then
        log "⚠️ No changes staged for commit despite new files detected"
        log "🔍 Running git status for debugging:"
        git status --porcelain >> "$LOG_FILE"
    else
        # Commit with timestamp
        COMMIT_MSG="🤖 Auto-sync: $NEW_FILES new screenshots from iCloud

$(date '+%Y-%m-%d %H:%M:%S JST')

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
        
        git commit -m "$COMMIT_MSG"
        
        log "📤 Pushing to GitHub to trigger Actions..."
        git push
        
        log "🎉 Successfully pushed $NEW_FILES new files. GitHub Actions should start automatically."
        
        # Update sync marker
        touch "$LAST_SYNC_MARKER"
    fi
else
    log "📭 No new files to sync"
fi

log "✅ iCloud sync process completed successfully"

# Optional: Clean up old log files (keep last 30 days)
find "$(dirname "$LOG_FILE")" -name "*.log" -mtime +30 -delete 2>/dev/null || true

exit 0