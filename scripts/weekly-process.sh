#!/bin/bash

# =============================================================================
# Weekly Data Processing Script for launchd
# =============================================================================
# Purpose: Comprehensive weekly data processing including OCR, CSV update,
#          report generation, and dashboard rebuild trigger
# Execution: via launchd every Sunday at 00:00 JST
# =============================================================================

set -e  # Exit on any error

# Configuration
PROJECT_DIR="/Users/i_kawano/Documents/crowd_data_dashboard_v2"
ICLOUD_PATH="/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym"
INBOX_PATH="$PROJECT_DIR/screenshots/inbox"
LOG_FILE="$PROJECT_DIR/logs/weekly-process.log"

# Ensure log directory exists
mkdir -p "$(dirname "$LOG_FILE")"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "🔄 Starting weekly data processing..."
log "=========================================="

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

# Step 1: iCloud Synchronization
log ""
log "📂 Step 1: iCloud Synchronization"
log "----------------------------------------"

if [ ! -d "$ICLOUD_PATH" ]; then
    log "⚠️ WARNING: iCloud path not found: $ICLOUD_PATH"
    log "   Skipping iCloud sync..."
else
    # Ensure inbox directory exists
    mkdir -p "$INBOX_PATH"
    
    # Count files before sync
    BEFORE_COUNT=$(find "$INBOX_PATH" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l | tr -d ' ')
    log "📊 Files in inbox before sync: $BEFORE_COUNT"
    
    # Sync new files from iCloud to inbox
    NEW_FILES=0
    SUPPORTED_FORMATS=("*.png" "*.jpg" "*.jpeg" "*.bmp" "*.tiff")
    
    for pattern in "${SUPPORTED_FORMATS[@]}"; do
        for file in "$ICLOUD_PATH"/$pattern; do
            [ -f "$file" ] || continue
            
            filename=$(basename "$file")
            dest_path="$INBOX_PATH/$filename"
            
            # Skip if file already exists in inbox
            if [ -f "$dest_path" ]; then
                continue
            fi
            
            # Filter for gym-related files
            if [[ "$filename" =~ FP24|2025:|fit ]]; then
                log "📋 Copying new file: $filename"
                cp "$file" "$dest_path"
                NEW_FILES=$((NEW_FILES + 1))
            fi
        done
    done
    
    AFTER_COUNT=$(find "$INBOX_PATH" -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" 2>/dev/null | wc -l | tr -d ' ')
    log "📊 Files in inbox after sync: $AFTER_COUNT"
    log "✅ New files copied: $NEW_FILES"
fi

# Step 2: OCR Processing
log ""
log "🤖 Step 2: OCR Processing"
log "----------------------------------------"

if [ -d "$INBOX_PATH" ] && [ "$(ls -A "$INBOX_PATH" 2>/dev/null)" ]; then
    log "📸 Processing screenshots with OCR..."
    
    if command -v python3 &> /dev/null; then
        if python3 scripts/python_ocr_processor.py >> "$LOG_FILE" 2>&1; then
            log "✅ OCR processing completed successfully"
        else
            log "❌ ERROR: OCR processing failed"
            exit 1
        fi
    else
        log "❌ ERROR: python3 not found"
        exit 1
    fi
else
    log "📭 No screenshots to process, skipping OCR"
fi

# Step 3: CSV Update
log ""
log "📊 Step 3: CSV Data Update"
log "----------------------------------------"

if [ -f "scripts/extracted-data.json" ]; then
    log "📄 Updating CSV data..."
    
    if command -v node &> /dev/null; then
        if node scripts/update-csv.js >> "$LOG_FILE" 2>&1; then
            log "✅ CSV update completed successfully"
        else
            log "❌ ERROR: CSV update failed"
            exit 1
        fi
    else
        log "❌ ERROR: node not found"
        exit 1
    fi
else
    log "📭 No extracted data found, skipping CSV update"
fi

# Step 4: Archive Processed Images
log ""
log "🗃️ Step 4: Archive Processed Images"
log "----------------------------------------"

if [ -d "$INBOX_PATH" ] && [ "$(ls -A "$INBOX_PATH" 2>/dev/null)" ]; then
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    ARCHIVE_DIR="screenshots/processed/$TIMESTAMP"
    mkdir -p "$ARCHIVE_DIR"
    
    log "📦 Archiving processed images to $ARCHIVE_DIR..."
    mv "$INBOX_PATH"/* "$ARCHIVE_DIR/" 2>/dev/null || true
    log "✅ Images archived successfully"
else
    log "📭 No images to archive"
fi

# Step 5: Generate Weekly Report
log ""
log "📈 Step 5: Generate Weekly Report"
log "----------------------------------------"

if [ -f "public/fit_place24_data.csv" ]; then
    log "📊 Generating weekly report..."
    
    if command -v node &> /dev/null; then
        if node scripts/generate-report.js >> "$LOG_FILE" 2>&1; then
            log "✅ Weekly report generated successfully"
        else
            log "⚠️ WARNING: Weekly report generation failed (non-critical)"
        fi
    else
        log "⚠️ WARNING: node not found, skipping report generation"
    fi
else
    log "📭 No CSV data found, skipping report generation"
fi

# Step 6: Performance Analysis
log ""
log "🔍 Step 6: Performance Analysis"
log "----------------------------------------"

if [ -f "public/fit_place24_data.csv" ]; then
    log "📊 Running performance analysis..."
    
    if command -v node &> /dev/null; then
        if node scripts/performance-analyzer.js >> "$LOG_FILE" 2>&1; then
            log "✅ Performance analysis completed successfully"
        else
            log "⚠️ WARNING: Performance analysis failed (non-critical)"
        fi
    else
        log "⚠️ WARNING: node not found, skipping performance analysis"
    fi
else
    log "📭 No CSV data found, skipping performance analysis"
fi

# Step 7: Git Commit and Push
log ""
log "📤 Step 7: Git Commit and Push"
log "----------------------------------------"

# Check if there are any changes to commit
if ! git diff --quiet || ! git diff --cached --quiet; then
    log "📋 Staging changes..."
    
    # Add all relevant files
    [ -f "public/fit_place24_data.csv" ] && git add public/fit_place24_data.csv
    [ -d "screenshots/" ] && git add screenshots/
    [ -f "scripts/extracted-data.json" ] && git add scripts/extracted-data.json
    [ -f "scripts/weekly-report.md" ] && git add scripts/weekly-report.md
    [ -f "public/performance-analysis.json" ] && git add public/performance-analysis.json
    
    # Check if there are staged changes
    if ! git diff --cached --quiet; then
        COMMIT_DATE=$(date '+%Y-%m-%d %H:%M')
        COMMIT_MSG="📅 Weekly data update ${COMMIT_DATE}

🤖 Automated weekly processing:
- OCR processing
- CSV data update
- Weekly report generation
- Performance analysis
- Image archiving

Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>"
        
        git commit -m "$COMMIT_MSG"
        log "✅ Changes committed"
        
        log "📤 Pushing to GitHub..."
        if git push >> "$LOG_FILE" 2>&1; then
            log "✅ Successfully pushed to GitHub"
            log "🚀 GitHub Actions should start automatically for dashboard rebuild"
        else
            log "❌ ERROR: Git push failed"
            exit 1
        fi
    else
        log "📭 No changes to commit"
    fi
else
    log "📭 No changes detected, skipping commit"
fi

# Step 8: Trigger Dashboard Rebuild (Optional - via GitHub API)
log ""
log "🌐 Step 8: Dashboard Rebuild Trigger"
log "----------------------------------------"

# Note: This step requires GITHUB_TOKEN environment variable
# If not set, the push event will trigger the workflow automatically
if [ -n "$GITHUB_TOKEN" ]; then
    log "🔧 Triggering dashboard rebuild via GitHub API..."
    
    REPO="iori73/crowd_data_dashboard_v2"
    WORKFLOW="weekly-data-collection.yml"
    
    if command -v curl &> /dev/null; then
        RESPONSE=$(curl -s -X POST \
            -H "Accept: application/vnd.github.v3+json" \
            -H "Authorization: token $GITHUB_TOKEN" \
            "https://api.github.com/repos/$REPO/actions/workflows/$WORKFLOW/dispatches" \
            -d '{"ref":"main"}' 2>&1)
        
        if echo "$RESPONSE" | grep -q "204\|201"; then
            log "✅ Dashboard rebuild triggered successfully"
        else
            log "⚠️ WARNING: Failed to trigger rebuild via API (push event will trigger it)"
            log "   Response: $RESPONSE"
        fi
    else
        log "⚠️ WARNING: curl not found, skipping API trigger"
        log "   Push event will trigger the workflow automatically"
    fi
else
    log "ℹ️ GITHUB_TOKEN not set, skipping API trigger"
    log "   Push event will trigger the workflow automatically"
fi

log ""
log "=========================================="
log "✅ Weekly data processing completed successfully"
log "📅 Completed at: $(date '+%Y-%m-%d %H:%M:%S JST')"
log "=========================================="

exit 0

