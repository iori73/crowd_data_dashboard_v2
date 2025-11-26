# Troubleshooting Guide

**Last Updated**: 2025-01-XX  
**Purpose**: Practical debugging guide with symptom → diagnosis → solution format

---

## How to Use This Guide

1. **Find your symptom** in the table of contents
2. **Read the diagnosis** to understand the problem
3. **Follow the solution** step-by-step
4. **Verify the fix** using the provided commands

---

## Table of Contents

- [OCR Processing Issues](#ocr-processing-issues)
- [CSV Update Problems](#csv-update-problems)
- [Dashboard Display Issues](#dashboard-display-issues)
- [Automation Failures](#automation-failures)
- [Git/GitHub Issues](#gitgithub-issues)
- [Permission Problems](#permission-problems)
- [Performance Issues](#performance-issues)

---

## OCR Processing Issues

### Symptom: "📭 処理対象の画像ファイルがありません" (No image files to process)

**Diagnosis**: No images found in `screenshots/inbox/` directory

**Solution**:

```bash
# Step 1: Check if inbox directory exists
ls -la screenshots/inbox/

# Step 2: Check iCloud folder
ls ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym

# Step 3: If iCloud has files but inbox doesn't, run sync manually
./scripts/icloud-sync.sh

# Step 4: Verify files were copied
ls -la screenshots/inbox/
```

**Prevention**: Ensure iPhone Shortcuts app is configured correctly and iCloud sync is working

---

### Symptom: OCR fails to extract data from images

**Diagnosis**: OCR text extraction is failing or returning incorrect results

**Solution**:

```bash
# Step 1: Test Tesseract directly
tesseract screenshots/inbox/FP24_*.png stdout -l jpn+eng

# Step 2: Check image quality
open screenshots/inbox/FP24_*.png
# Verify text is readable

# Step 3: Check OCR script logs
python3 scripts/python_ocr_processor.py
# Look for error messages

# Step 4: Verify Tesseract Japanese language pack
tesseract --list-langs
# Should include: jpn

# Step 5: If jpn not listed, install it
brew install tesseract-lang
```

**If Still Failing**:
- Check image preprocessing (add debug output)
- Verify regex patterns match OCR output
- Check fallback system is working

---

### Symptom: "❌ 出力ファイル作成失敗" (Output file creation failed)

**Diagnosis**: Cannot write to `scripts/extracted-data.json`

**Solution**:

```bash
# Step 1: Check file permissions
ls -la scripts/extracted-data.json

# Step 2: Check directory permissions
ls -la scripts/

# Step 3: Check disk space
df -h .

# Step 4: Try creating file manually
touch scripts/extracted-data.json
chmod 644 scripts/extracted-data.json

# Step 5: Run OCR again
python3 scripts/python_ocr_processor.py
```

**If Still Failing**:
- Check if file is locked by another process
- Verify write permissions on scripts directory
- Check for disk space issues

---

## CSV Update Problems

### Symptom: "📭 抽出データファイルが見つかりません" (Extracted data file not found)

**Diagnosis**: `scripts/extracted-data.json` doesn't exist

**Solution**:

```bash
# Step 1: Check if file exists
ls -la scripts/extracted-data.json

# Step 2: If missing, run OCR first
python3 scripts/python_ocr_processor.py

# Step 3: Verify file was created
ls -la scripts/extracted-data.json
cat scripts/extracted-data.json | jq '.totalCount'

# Step 4: Run CSV update
node scripts/update-csv.js
```

**Prevention**: Always run OCR processing before CSV update

---

### Symptom: CSV has duplicate records

**Diagnosis**: Deduplication logic isn't working correctly

**Solution**:

```bash
# Step 1: Check for duplicates
cut -d',' -f1,6 public/fit_place24_data.csv | sort | uniq -d

# Step 2: If duplicates found, check deduplication key
# Key should be: datetime_count
# Example: "2025-01-15 14:30:00_22"

# Step 3: Manually remove duplicates (backup first!)
cp public/fit_place24_data.csv public/fit_place24_data.csv.backup

# Step 4: Re-run CSV update (should deduplicate)
node scripts/update-csv.js

# Step 5: Verify duplicates removed
cut -d',' -f1,6 public/fit_place24_data.csv | sort | uniq -d
# Should return empty
```

**If Still Duplicates**:
- Check deduplication key logic in `update-csv.js`
- Verify datetime format is consistent
- Check for timezone issues

---

### Symptom: CSV data is corrupted or invalid

**Diagnosis**: CSV file has formatting issues or invalid data

**Solution**:

```bash
# Step 1: Check CSV format
head -5 public/fit_place24_data.csv
# Should show proper CSV with headers

# Step 2: Validate data types
awk -F',' 'NR>1 {print $6}' public/fit_place24_data.csv | sort -n
# Should show numeric values (0-60)

# Step 3: Check for invalid dates
awk -F',' 'NR>1 {print $2}' public/fit_place24_data.csv | sort | uniq
# Should show valid YYYY-MM-DD dates

# Step 4: If corrupted, restore from backup
cp public/fit_place24_data.csv.backup public/fit_place24_data.csv

# Step 5: Re-run CSV update
node scripts/update-csv.js
```

**Prevention**: Always backup CSV before major changes

---

## Dashboard Display Issues

### Symptom: Dashboard shows "No data found"

**Diagnosis**: CSV file is missing, empty, or can't be loaded

**Solution**:

```bash
# Step 1: Check if CSV file exists
ls -la public/fit_place24_data.csv

# Step 2: Check CSV has data
wc -l public/fit_place24_data.csv
# Should be > 1 (header + data)

# Step 3: Check CSV format
head -3 public/fit_place24_data.csv
# Should show headers and data rows

# Step 4: Check browser console (F12 → Console)
# Look for error messages

# Step 5: Test CSV loading manually
curl http://localhost:3000/fit_place24_data.csv
# Should return CSV content
```

**If Still Failing**:
- Check Next.js build output
- Verify CSV is in `public/` directory
- Check browser network tab for 404 errors

---

### Symptom: Charts not rendering

**Diagnosis**: Chart.js or data processing issue

**Solution**:

```bash
# Step 1: Check browser console for errors
# F12 → Console → Look for JavaScript errors

# Step 2: Verify data is loaded
# F12 → Network → Check CSV request succeeded

# Step 3: Check data format
# F12 → Console → Type: window.data (if exposed)
# Or check DataLoader logs in console

# Step 4: Verify Chart.js is loaded
# F12 → Console → Type: Chart
# Should show Chart.js object

# Step 5: Rebuild dashboard
npm run build
npm run dev
```

**If Still Failing**:
- Check Chart.js version compatibility
- Verify data structure matches component expectations
- Check for React rendering errors

---

### Symptom: Dark mode not working

**Diagnosis**: Theme switching or CSS issue

**Solution**:

```bash
# Step 1: Check if dark class is applied
# F12 → Elements → Check <html> element
# Should have "dark" class when dark mode is on

# Step 2: Check theme provider
# Verify next-themes is installed
npm list next-themes

# Step 3: Check Tailwind config
cat tailwind.config.ts
# Should have: darkMode: 'class'

# Step 4: Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Step 5: Restart dev server
npm run dev
```

**If Still Failing**:
- Check theme provider setup in `layout.tsx`
- Verify dark mode styles in components
- Check for CSS conflicts

---

## Automation Failures

### Symptom: launchd job not running

**Diagnosis**: Job not loaded, misconfigured, or path issues

**Solution**:

```bash
# Step 1: Check if job is loaded
launchctl list | grep mygym
# Should show job name

# Step 2: If not loaded, check plist file
cat ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
# Verify paths are correct

# Step 3: Reload job
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Step 4: Check logs for errors
tail -50 logs/launchd-stderr.log

# Step 5: Test script manually
./scripts/icloud-sync.sh
```

**If Still Failing**:
- Verify script has execute permission: `chmod +x scripts/icloud-sync.sh`
- Check paths in plist match actual project location
- Verify log directory exists and is writable

---

### Symptom: GitHub Actions not running

**Diagnosis**: Workflow not triggered or misconfigured

**Solution**:

```bash
# Step 1: Check workflow file exists
cat .github/workflows/weekly-data-collection.yml

# Step 2: Check GitHub Actions page
# Go to: https://github.com/iori73/crowd_data_dashboard_v2/actions
# Look for recent runs

# Step 3: Check workflow triggers
# Verify push paths match:
# - screenshots/inbox/**
# - public/fit_place24_data.csv

# Step 4: Test by making a change
touch screenshots/inbox/test.txt
git add screenshots/inbox/test.txt
git commit -m "Test: Trigger Actions"
git push

# Step 5: Check Actions page again
# Should see workflow running
```

**If Still Failing**:
- Verify repository has Actions enabled
- Check for workflow syntax errors
- Verify branch name matches workflow trigger

---

### Symptom: Automation runs but produces no results

**Diagnosis**: Scripts run but don't process data correctly

**Solution**:

```bash
# Step 1: Check logs
tail -50 logs/icloud-sync.log
tail -50 logs/launchd-stdout.log
tail -50 logs/launchd-stderr.log

# Step 2: Check for errors in logs
grep -i error logs/*.log

# Step 3: Verify scripts have correct permissions
ls -la scripts/*.sh
# Should show: -rwxr-xr-x (executable)

# Step 4: Test scripts manually
./scripts/icloud-sync.sh
python3 scripts/python_ocr_processor.py
node scripts/update-csv.js

# Step 5: Check output files
ls -la scripts/extracted-data.json
ls -la public/fit_place24_data.csv
```

**If Still Failing**:
- Check environment variables
- Verify dependencies are installed
- Check for path issues in scripts

---

## Git/GitHub Issues

### Symptom: "Permission denied (publickey)" when pushing

**Diagnosis**: SSH authentication not configured

**Solution**:

```bash
# Step 1: Check SSH key exists
ls -la ~/.ssh/id_ed25519.pub

# Step 2: If not, generate one
ssh-keygen -t ed25519 -C "your_email@example.com"

# Step 3: Add to GitHub
pbcopy < ~/.ssh/id_ed25519.pub
# Then paste at: https://github.com/settings/keys

# Step 4: Test connection
ssh -T git@github.com
# Should say: "Hi iori73! You've successfully authenticated..."

# Step 5: Check remote URL
git remote -v
# Should use: git@github.com:... (not https://)

# Step 6: If using HTTPS, change to SSH
git remote set-url origin git@github.com:iori73/crowd_data_dashboard_v2.git
```

---

### Symptom: Git push fails from launchd

**Diagnosis**: launchd environment doesn't have SSH access

**Solution**:

```bash
# Step 1: Verify SSH works in terminal
ssh -T git@github.com

# Step 2: Check SSH agent
ssh-add -l
# Should list your key

# Step 3: Add key to agent (if not listed)
ssh-add ~/.ssh/id_ed25519

# Step 4: For launchd, may need to use SSH config
cat ~/.ssh/config
# Should have:
# Host github.com
#   AddKeysToAgent yes
#   UseKeychain yes
#   IdentityFile ~/.ssh/id_ed25519

# Step 5: Test git push manually
git push
```

**If Still Failing**:
- Check launchd environment variables
- Verify SSH key is in keychain: `ssh-add --apple-use-keychain ~/.ssh/id_ed25519`
- Consider using deploy keys instead

---

## Permission Problems

### Symptom: "Permission denied" accessing iCloud folder

**Diagnosis**: Full Disk Access not granted

**Solution**:

```bash
# Step 1: Check if path is accessible
ls ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym

# Step 2: If permission denied:
# - Open System Settings → Privacy & Security → Full Disk Access
# - Add Terminal (or script runner) to allowed apps
# - **Restart Terminal** (important!)

# Step 3: Verify access
ls ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym
# Should now work

# Step 4: Test sync script
./scripts/icloud-sync.sh
```

**If Still Failing**:
- Check iCloud Drive is enabled
- Verify folder exists in iCloud
- Check iCloud sync status

---

### Symptom: Scripts can't write to logs directory

**Diagnosis**: Log directory permissions issue

**Solution**:

```bash
# Step 1: Check log directory exists
ls -la logs/

# Step 2: Check permissions
ls -ld logs/
# Should show: drwxr-xr-x

# Step 3: Fix permissions if needed
chmod 755 logs/

# Step 4: Test writing
echo "test" > logs/test.log
cat logs/test.log
rm logs/test.log

# Step 5: Verify scripts can write
./scripts/icloud-sync.sh
tail logs/icloud-sync.log
```

---

## Performance Issues

### Symptom: Dashboard loads slowly

**Diagnosis**: Large CSV file or network issues

**Solution**:

```bash
# Step 1: Check CSV file size
ls -lh public/fit_place24_data.csv
# If > 1MB, consider archiving old data

# Step 2: Check record count
wc -l public/fit_place24_data.csv
# If > 1000, consider database migration

# Step 3: Check browser network tab
# F12 → Network → Check CSV load time

# Step 4: Enable caching
# Verify DataLoader cache is working (5-minute cache)

# Step 5: Consider code splitting
# Lazy load charts to improve initial load
```

**Optimization**:
- Archive old data (>60 days) to separate CSV
- Implement pagination or virtual scrolling
- Add loading states for better UX

---

### Symptom: OCR processing is slow

**Diagnosis**: Processing images sequentially or large images

**Solution**:

```bash
# Step 1: Check number of images
ls screenshots/inbox/ | wc -l

# Step 2: Check image sizes
ls -lh screenshots/inbox/
# Large images (>5MB) take longer

# Step 3: Test processing time
time python3 scripts/python_ocr_processor.py

# Step 4: Consider parallel processing
# Modify script to use multiprocessing

# Step 5: Optimize image preprocessing
# Reduce image size before OCR if possible
```

**Optimization**:
- Process images in parallel (multiprocessing)
- Resize large images before OCR
- Cache preprocessed images

---

## Health Check Commands

Run these commands to verify system health:

```bash
# Check all components
echo "=== System Health Check ==="

echo "1. Dependencies:"
node --version
python3 --version
tesseract --version

echo "2. Git:"
git --version
ssh -T git@github.com

echo "3. launchd Jobs:"
launchctl list | grep mygym

echo "4. Files:"
ls -la screenshots/inbox/ | wc -l
ls -la public/fit_place24_data.csv
ls -la scripts/extracted-data.json

echo "5. Logs:"
tail -5 logs/icloud-sync.log
tail -5 logs/launchd-stderr.log

echo "6. Dashboard:"
curl -s http://localhost:3000 | head -20
```

---

## Emergency Recovery Procedures

### Complete System Reset

If everything is broken:

```bash
# Step 1: Backup current state
cp -r . ../crowd_data_dashboard_v2_backup_$(date +%Y%m%d)

# Step 2: Restore from Git
git fetch origin
git reset --hard origin/main

# Step 3: Reinstall dependencies
rm -rf node_modules
npm install
pip3 install -r requirements.txt

# Step 4: Reload launchd jobs
launchctl unload ~/Library/LaunchAgents/com.mygym.*.plist
launchctl load ~/Library/LaunchAgents/com.mygym.*.plist

# Step 5: Test everything
./scripts/icloud-sync.sh
python3 scripts/python_ocr_processor.py
node scripts/update-csv.js
npm run dev
```

### CSV Data Recovery

If CSV is corrupted:

```bash
# Step 1: Backup current CSV
cp public/fit_place24_data.csv public/fit_place24_data.csv.corrupted

# Step 2: Restore from Git history
git log --oneline -- public/fit_place24_data.csv
# Find last good commit
git checkout <commit-hash> -- public/fit_place24_data.csv

# Step 3: Or restore from backup
cp public/fit_place24_data.csv.backup public/fit_place24_data.csv

# Step 4: Verify data
head -10 public/fit_place24_data.csv
wc -l public/fit_place24_data.csv

# Step 5: Re-run CSV update to add any missing data
node scripts/update-csv.js
```

---

## Getting More Help

If issues persist:

1. **Check Documentation**:
   - [Project Overview](./project_overview.md)
   - [Architecture](./architecture.md)
   - [Implementation Notes](./implementation_notes.md)

2. **Check Logs**:
   ```bash
   tail -100 logs/*.log
   ```

3. **Check GitHub Issues**:
   - https://github.com/iori73/crowd_data_dashboard_v2/issues

4. **Ask AI Assistant**:
   - Provide error messages
   - Describe what you were doing
   - Include relevant log output

---

## Related Documentation

- **[Quick Start](./QUICK_START.md)**: Setup instructions
- **[Project Overview](./project_overview.md)**: What this project does
- **[Architecture](./architecture.md)**: System design
- **[Implementation Notes](./implementation_notes.md)**: Technical decisions

---

**This guide covers common issues. For specific problems not listed here, check logs and documentation, or ask for help with detailed error messages.**
