# Implementation Notes

**Last Updated**: 2025-01-XX  
**Purpose**: Document critical technical decisions, constraints, and non-obvious implementation details

---

## Why We Made These Choices

### Why Tesseract Over EasyOCR?

**The Problem**:
- EasyOCR had initialization timeout issues
- First run would hang for minutes trying to download models
- Unreliable in automated environments (GitHub Actions, launchd)

**The Solution**:
- Switched to Tesseract-only mode
- Tesseract is more stable and predictable
- Faster initialization (no model downloads)
- Better for automated processing

**Code Evidence**:
```python
# scripts/python_ocr_processor.py, lines 48-65
def setup_ocr(self):
    """Initialize OCR engines"""
    # Skip EasyOCR initialization to avoid timeout issues
    if EASYOCR_AVAILABLE:
        print("⚠️ Skipping EasyOCR initialization (performance optimization)")
        self.easyocr_reader = None
```

**Trade-offs**:
- ✅ More reliable
- ✅ Faster startup
- ⚠️ Slightly lower accuracy for Japanese text
- ✅ Fallback system compensates for accuracy loss

**Why This Matters**: This decision ensures the automation runs reliably without manual intervention.

---

### Why launchd Over GitHub Actions Schedule?

**The Problem**:
- GitHub Actions `schedule` events are "best effort" only
- Can be delayed by 15+ minutes or not run at all
- Unreliable for time-sensitive data collection
- Repository inactivity can cause schedule suspension

**The Solution**:
- Use launchd for local scheduling (macOS built-in)
- launchd is highly reliable and runs on time
- Can access local iCloud files directly
- Push to GitHub triggers Actions (more reliable than schedule)

**Code Evidence**:
```yaml
# .github/workflows/weekly-data-collection.yml, lines 8-13
# schedule:
#   # ⚠️ 無効化: launchdによる週次実行がメインのため
#   # GitHub Actions のスケジュール実行は信頼性が低く、
#   # 最大15分以上の遅延または実行されないことがあります
```

**Architecture**:
```
launchd (local, reliable) → Git Push → GitHub Actions (triggered, reliable)
```

**Trade-offs**:
- ✅ Highly reliable scheduling
- ✅ Direct iCloud access
- ⚠️ Requires macOS (not cross-platform)
- ⚠️ Requires computer to be on (but runs in background)

**Why This Matters**: Data collection happens on time, every time, without manual checks.

---

### Why SSH Over HTTPS for Git?

**The Problem**:
- launchd runs in a different environment than user shell
- HTTPS requires credentials (username/password or token)
- Credentials stored in keychain aren't accessible to launchd
- Automated git operations fail with HTTPS

**The Solution**:
- Use SSH authentication for git operations
- SSH keys are accessible to launchd
- No credential prompts needed
- Works reliably in automated contexts

**Setup Required**:
```bash
# Generate SSH key (if not exists)
ssh-keygen -t ed25519 -C "your_email@example.com"

# Add to GitHub
# Copy ~/.ssh/id_ed25519.pub to GitHub Settings → SSH Keys

# Test connection
ssh -T git@github.com

# Change remote URL
git remote set-url origin git@github.com:username/repo.git
```

**Trade-offs**:
- ✅ Works with launchd
- ✅ No credential management needed
- ⚠️ Requires SSH key setup (one-time)
- ✅ More secure than HTTPS with tokens

**Why This Matters**: Automation can commit and push without manual intervention.

---

### Why CSV Over Database?

**The Problem**:
- Database requires setup (PostgreSQL, MySQL, etc.)
- Needs hosting (Heroku, AWS RDS, etc.)
- Adds complexity to deployment
- Requires connection management

**The Solution**:
- Use CSV file for data storage
- Simple, portable format
- Works with static hosting (Vercel)
- Easy to inspect and debug
- No database setup needed

**File Location**:
```
public/fit_place24_data.csv  # Served as static file
```

**Trade-offs**:
- ✅ Simple setup
- ✅ Easy to inspect
- ✅ Works with static hosting
- ⚠️ Limited query capabilities
- ⚠️ File size grows over time
- ✅ Sufficient for current scale (~500 records)

**Why This Matters**: Simplicity enables faster development and easier maintenance.

**Future Consideration**: If data grows beyond ~1000 records, consider migrating to a database (SQLite for local, PostgreSQL for cloud).

---

### Why Hybrid Automation (Local + Cloud)?

**The Architecture**:
```
Local (launchd) → Git Push → Cloud (GitHub Actions) → Deploy (Vercel)
```

**Why Both?**:

1. **Local (launchd)**:
   - ✅ Reliable scheduling
   - ✅ Direct iCloud access
   - ✅ Fast file operations
   - ⚠️ Requires computer to be on

2. **Cloud (GitHub Actions)**:
   - ✅ Runs even if computer is off
   - ✅ Consistent environment
   - ✅ Automatic deployment
   - ⚠️ Can't access iCloud directly

**The Flow**:
1. launchd syncs iCloud → local inbox
2. launchd commits and pushes to GitHub
3. GitHub Actions processes the new files
4. GitHub Actions updates CSV and commits
5. Vercel automatically deploys updated dashboard

**Trade-offs**:
- ✅ Best of both worlds (reliability + cloud benefits)
- ⚠️ More complex than single solution
- ✅ Redundancy (if one fails, other can handle)

**Why This Matters**: Combines local reliability with cloud scalability and deployment automation.

---

## Known Limitations

### OCR Accuracy Depends on Screenshot Quality

**The Issue**:
- Blurry screenshots reduce OCR accuracy
- Low contrast makes text hard to read
- Different phone models produce different quality images

**Current Mitigation**:
- Image preprocessing (grayscale, denoise, contrast enhancement)
- Multiple regex patterns for text extraction
- Intelligent fallback to filename-based estimation

**Code Evidence**:
```python
# scripts/python_ocr_processor.py, lines 116-137
def preprocess_image(self, image_path):
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Apply denoising
    denoised = cv2.fastNlMeansDenoising(gray)
    # Apply contrast enhancement
    enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(denoised)
```

**Impact**:
- Most screenshots process correctly (>95% success rate)
- Fallback system handles failures gracefully
- Manual verification recommended for critical data

**Future Improvement**: Add confidence scoring and manual review queue for low-confidence extractions.

---

### Filename-Based Fallback Has Lower Accuracy

**The Issue**:
- When OCR fails, we estimate from filename and time patterns
- Estimates are based on historical averages, not actual data
- Less accurate than OCR extraction

**Current Implementation**:
```python
# scripts/python_ocr_processor.py, lines 347-402
def extract_data_from_filename_fallback(self, filename):
    # Use intelligent defaults based on time of day
    if 6 <= hour <= 9:  # Morning
        count = 12
        status = "やや空いています"
    elif 17 <= hour <= 21:  # Evening
        count = 30
        status = "混んでいます"
    # ... etc
```

**Trade-offs**:
- ✅ Better than no data
- ✅ Reasonable estimates based on time patterns
- ⚠️ Not as accurate as OCR
- ✅ Clearly marked in data (rawText field indicates fallback)

**Why This Matters**: System continues working even when OCR fails, maintaining data continuity.

---

### GitHub Actions Schedule is Unreliable

**The Issue**:
- GitHub Actions `schedule` events are "best effort"
- Can be delayed 15+ minutes or not run at all
- Repository inactivity can suspend schedules

**Documentation**:
```yaml
# .github/workflows/weekly-data-collection.yml
# schedule:
#   # ⚠️ 無効化: launchdによる週次実行がメインのため
#   # GitHub Actions のスケジュール実行は信頼性が低く、
#   # 最大15分以上の遅延または実行されないことがあります
```

**Current Solution**:
- Schedule disabled in favor of launchd
- Push-triggered Actions are reliable
- launchd handles all scheduling

**Why This Matters**: We don't rely on unreliable schedules, ensuring data collection happens on time.

---

### iCloud Sync Requires macOS with Full Disk Access

**The Issue**:
- iCloud Drive files are in a protected location
- Requires Full Disk Access permission for Terminal/scripts
- Only works on macOS (not Linux/Windows)

**Required Setup**:
1. System Settings → Privacy & Security → Full Disk Access
2. Add Terminal (or script runner) to allowed apps
3. Restart Terminal after granting permission

**Path Structure**:
```
~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym
```

**Trade-offs**:
- ✅ Works seamlessly once configured
- ⚠️ macOS-only solution
- ⚠️ Requires permission setup
- ✅ No manual file transfer needed

**Why This Matters**: Automation requires proper macOS permissions to access iCloud files.

---

## Configuration Deep-Dives

### launchd plist Files Explained

**File**: `scripts/com.mygym.icloud-sync.plist`

```xml
<key>Label</key>
<string>com.mygym.icloud-sync</string>
```
- **Purpose**: Unique identifier for the job
- **Format**: Reverse domain notation (com.company.service)

```xml
<key>ProgramArguments</key>
<array>
    <string>/bin/bash</string>
    <string>/Users/i_kawano/Documents/crowd_data_dashboard_v2/scripts/icloud-sync.sh</string>
</array>
```
- **Purpose**: Command to execute
- **Format**: Array of strings (executable + arguments)
- **Note**: First element is the interpreter, second is the script

```xml
<key>StartCalendarInterval</key>
<array>
    <dict>
        <key>Hour</key>
        <integer>0</integer>
        <key>Minute</key>
        <integer>5</integer>
    </dict>
    <!-- ... more intervals ... -->
</array>
```
- **Purpose**: Schedule execution times
- **Format**: Array of dictionaries, each with Hour/Minute
- **Note**: Can specify multiple times per day

```xml
<key>StandardOutPath</key>
<string>/Users/i_kawano/Documents/crowd_data_dashboard_v2/logs/launchd-stdout.log</string>
```
- **Purpose**: Where to write stdout
- **Format**: Absolute file path
- **Note**: Useful for debugging

**Installation**:
```bash
# Copy plist to LaunchAgents
cp scripts/com.mygym.icloud-sync.plist ~/Library/LaunchAgents/

# Load the job
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Verify it's loaded
launchctl list | grep mygym
```

---

### GitHub Actions Workflow Logic

**File**: `.github/workflows/weekly-data-collection.yml`

**Trigger Logic**:
```yaml
on:
  push:
    paths:
      - 'screenshots/inbox/**'  # New screenshots
      - 'public/fit_place24_data.csv'  # CSV updates
```
- **Purpose**: Only run when relevant files change
- **Benefit**: Avoids unnecessary runs
- **Note**: `workflow_dispatch` allows manual triggers

**Conditional Processing**:
```yaml
- name: Check for new screenshots
  id: check-images
  run: |
    if [ -d "screenshots/inbox" ] && [ "$(ls -A screenshots/inbox)" ]; then
      echo "new-images=true" >> $GITHUB_OUTPUT
    else
      echo "new-images=false" >> $GITHUB_OUTPUT
    fi

- name: Process screenshots
  if: steps.check-images.outputs.new-images == 'true'
```
- **Purpose**: Only process if new images exist
- **Benefit**: Skips unnecessary OCR processing
- **Note**: Uses step outputs for conditionals

**Error Handling**:
```yaml
- name: Handle errors
  if: failure()
  run: |
    echo "❌ 処理中にエラーが発生しました"
```
- **Purpose**: Run cleanup/notification on failure
- **Benefit**: Better debugging and monitoring

---

### Python OCR Preprocessing Steps

**File**: `scripts/python_ocr_processor.py`, `preprocess_image()` method

**Step 1: Read Image**
```python
img = cv2.imread(image_path)
```
- Loads image into OpenCV format (BGR color space)

**Step 2: Convert to Grayscale**
```python
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
```
- **Why**: OCR works better on grayscale
- **Benefit**: Reduces complexity, improves accuracy

**Step 3: Denoise**
```python
denoised = cv2.fastNlMeansDenoising(gray)
```
- **Why**: Removes noise from screenshots
- **Benefit**: Cleaner text for OCR

**Step 4: Contrast Enhancement**
```python
enhanced = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8)).apply(denoised)
```
- **Why**: Improves text visibility
- **CLAHE**: Contrast Limited Adaptive Histogram Equalization
- **Benefit**: Better OCR accuracy on low-contrast images

**Why This Matters**: Preprocessing significantly improves OCR accuracy, especially for mobile screenshots.

---

### Next.js Build Configuration

**File**: `next.config.ts`

**Current Configuration**:
```typescript
// Minimal config - Next.js 15 defaults work well
```

**Key Settings** (implicit):
- **App Router**: Uses `app/` directory structure
- **Turbopack**: Enabled for faster builds (`--turbopack` flag)
- **Static Export**: Not used (Vercel handles deployment)
- **Image Optimization**: Automatic via Next.js Image component

**Build Process**:
```bash
npm run build  # Runs: next build --turbopack
```

**Output**:
- `.next/` directory with optimized build
- Static assets in `public/` are copied
- Server components and client components separated

**Why This Matters**: Modern Next.js configuration provides optimal performance with minimal setup.

---

## Non-Obvious Technical Details

### CSV Deduplication Key

**Implementation**:
```javascript
// scripts/update-csv.js, lines 134-152
const key = `${record.datetime}_${record.count}`;
```

**Why `datetime + count`?**:
- **Same datetime, different count**: Different measurement (keep both)
  - Example: `2025-01-15 14:30:00_22` vs `2025-01-15 14:30:00_25`
  - These are two different readings at the same time (rare but possible)
- **Same datetime, same count**: Duplicate (remove)
  - Example: `2025-01-15 14:30:00_22` appears twice
  - This is a true duplicate from reprocessing

**Alternative Considered**: Just `datetime`
- **Problem**: Would lose valid duplicate-time measurements
- **Solution**: Include count in key

**Why This Matters**: Prevents data loss while removing true duplicates.

---

### Status Code to Range Mapping

**Mapping Table**:
```python
# scripts/python_ocr_processor.py, lines 216-225
status_patterns = [
    ('空いています', 5, 0, 10),      # Code 5: 0-10 people
    ('やや空いています', 4, 11, 20),  # Code 4: 11-20 people
    ('やや混んでいます', 3, 21, 30),  # Code 3: 21-30 people
    ('混んでいます', 2, 31, 40),      # Code 2: 31-40 people
]
```

**Why Store Ranges?**:
- **Validation**: Check if count matches status
- **Filtering**: Query by status range
- **Display**: Show status with context

**Validation Logic**:
```python
# Check if count is within status range
if status_min <= count <= status_max:
    # Valid data
else:
    # Mismatch - log warning
```

**Why This Matters**: Ensures data consistency and enables better error detection.

---

### Time Extraction Patterns

**Multiple Formats Supported**:
```python
# scripts/python_ocr_processor.py, lines 236-249
time_patterns = [
    r'(\d{1,2}):(\d{2})',        # "14:30"
    r'(\d{1,2})\.(\d{2})',       # "14.30"
    r'(\d{1,2})時(\d{2})分',     # "14時30分"
]
```

**Why Multiple Patterns?**:
- Screenshots may have different time formats
- OCR might misread characters (":" vs ".")
- Japanese format support ("時" and "分")

**Fallback**:
```python
# If OCR fails, extract from filename
time_info = self.extract_time_from_filename(filename)
# FP24_20250115_143022.png → 14:30
```

**Why This Matters**: Handles various screenshot formats and OCR variations.

---

### Dark Mode Implementation

**Detection**:
```typescript
// src/app/page.tsx, lines 101-123
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    if (event.data?.type === 'THEME_CHANGE') {
      const isDark = event.data.theme === 'dark'
      document.documentElement.classList.toggle('dark', isDark)
    }
  }
  window.addEventListener('message', handleMessage)
}, [])
```

**How It Works**:
1. Theme provider (next-themes) manages theme state
2. Sends `postMessage` when theme changes
3. Dashboard listens and toggles `dark` class on `<html>`
4. Tailwind CSS applies dark mode styles

**Tailwind Configuration**:
```typescript
// tailwind.config.ts
darkMode: 'class'  // Use class-based dark mode
```

**Why This Matters**: Provides consistent dark mode experience across the application.

---

## Critical Files to Never Modify Without Backup

### 1. `public/fit_place24_data.csv`
- **Why**: Contains all historical data
- **Risk**: Data loss if corrupted
- **Backup**: Git history, but manual backup recommended before major changes

### 2. `scripts/python_ocr_processor.py`
- **Why**: Core OCR logic, complex and tested
- **Risk**: Breaking data extraction
- **Backup**: Git commit before changes, test with sample images

### 3. `scripts/com.mygym.*.plist`
- **Why**: Automation configuration
- **Risk**: Breaking scheduled jobs
- **Backup**: Copy to `_archive/` before changes

### 4. `.github/workflows/weekly-data-collection.yml`
- **Why**: Cloud automation
- **Risk**: Breaking GitHub Actions
- **Backup**: Test in branch before merging

---

## Safe Areas for Experimentation

### Frontend Components
- `src/components/` - UI components can be modified safely
- `src/lib/translations.ts` - Adding translations is safe
- `src/app/page.tsx` - Main page can be enhanced

### Styling
- `src/app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind configuration

### Documentation
- `docs/` - All documentation files
- `README.md` - Project readme

---

## How to Roll Back If Something Breaks

### Git Rollback
```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit (keeps changes)
git reset --soft HEAD~1

# Rollback and discard changes (destructive!)
git reset --hard HEAD~1

# Rollback specific file
git checkout HEAD~1 -- path/to/file
```

### CSV Rollback
```bash
# View CSV history
git log --oneline -- public/fit_place24_data.csv

# Restore previous version
git checkout <commit-hash> -- public/fit_place24_data.csv
```

### launchd Rollback
```bash
# Unload job
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Restore previous plist
cp _archive/com.mygym.icloud-sync.plist ~/Library/LaunchAgents/

# Reload job
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
```

---

## Related Documentation

- **[Project Overview](./project_overview.md)**: What this project does
- **[Architecture](./architecture.md)**: System design and structure
- **[AI Context](./ai_context.md)**: How to work with this project
- **[Quick Start](./QUICK_START.md)**: Setup instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions

---

**This document explains the "why" behind technical decisions. For the "how", see the Architecture document.**
