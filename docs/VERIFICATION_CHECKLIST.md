# 🧪 Hybrid System Verification Checklist

## Overview
This document provides a comprehensive verification plan to ensure the launchd + GitHub Actions hybrid system is properly implemented and functional.

---

## Phase 1: Pre-Setup Verification

### ✅ File Existence Check
```bash
# Required files should exist
ls -la scripts/icloud-sync.sh
ls -la scripts/com.mygym.icloud-sync.plist  
ls -la scripts/setup-hybrid-automation.sh
ls -la .github/workflows/weekly-data-collection.yml
```

**Expected**: All files exist and are readable

### ✅ Script Permissions
```bash
# Scripts should be executable
ls -la scripts/*.sh
```

**Expected**: Execute permissions (x) on .sh files

### ✅ Path Verification
```bash
# Verify critical paths exist
ls -la "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym"
ls -la "/Users/i_kawano/Documents/crowd_data_dashboard_v2/screenshots/inbox"
```

**Expected**: Both directories exist and are accessible

---

## Phase 2: Setup Process Verification

### ✅ Run Setup Script
```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
./scripts/setup-hybrid-automation.sh
```

**Expected Output**:
- ✅ Created logs directory
- ✅ Copied plist to LaunchAgents
- ✅ launchd job loaded successfully
- ✅ Job is running: com.mygym.icloud-sync
- ✅ Sync script is executable
- ✅ Test sync completed
- 🎉 Setup completed successfully!

### ✅ LaunchAgent Installation
```bash
# Check if plist is installed
ls -la ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Check if job is loaded
launchctl list | grep com.mygym.icloud-sync
```

**Expected**: 
- Plist file exists in LaunchAgents
- Job appears in launchctl list with PID or status

---

## Phase 3: Component Testing

### ✅ Manual Sync Test
```bash
# Run sync script manually
./scripts/icloud-sync.sh
```

**Expected Behaviors**:
- ✅ Logs appear in `logs/icloud-sync.log`
- ✅ If new files exist: copied from iCloud to inbox
- ✅ If new files exist: git commit and push executed
- ✅ No errors in output

### ✅ Log File Generation
```bash
# Check if logs are created
ls -la logs/
cat logs/icloud-sync.log | tail -10
```

**Expected**: 
- Log files exist
- Recent timestamps
- No error messages

### ✅ Git Integration Test
```bash
# Check git status after manual sync
git status
git log --oneline -3
```

**Expected**: 
- If new files: recent commit with auto-sync message
- Working directory clean
- No uncommitted changes

---

## Phase 4: GitHub Actions Integration

### ✅ Workflow Trigger Test
```bash
# Manually trigger GitHub Actions
gh workflow run "Gym Data Processing (Hybrid Mode)"

# Check recent runs
gh run list --limit=3
```

**Expected**: 
- Workflow starts successfully
- Shows "queued" or "in_progress" status
- No immediate failures

### ✅ Push Trigger Test
```bash
# Create test file and push
echo "test" > screenshots/inbox/test_$(date +%s).txt
git add screenshots/inbox/
git commit -m "Test push trigger"
git push

# Check if GitHub Actions was triggered
gh run list --limit=1
```

**Expected**:
- Push completes successfully
- GitHub Actions triggered automatically
- Workflow shows recent execution

### ✅ Workflow Configuration Check
```bash
# Verify workflow is updated for hybrid mode
grep -A 5 "on:" .github/workflows/weekly-data-collection.yml
grep "GITHUB_ACTIONS" scripts/python_ocr_processor.py
```

**Expected**:
- Workflow triggers on push to screenshots/inbox/**
- Python script has GitHub Actions detection

---

## Phase 5: End-to-End Verification

### ✅ Complete Workflow Test

**Step 1**: Simulate new screenshot
```bash
# Copy a recent screenshot with new name to trigger processing
cp "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym/2025:10:02, 8:54.png" \
   "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym/2025:10:04, $(date +%H:%M).png"
```

**Step 2**: Run manual sync
```bash
./scripts/icloud-sync.sh
```

**Step 3**: Monitor GitHub Actions
```bash
gh run watch
```

**Expected Full Flow**:
1. ✅ New file detected in iCloud
2. ✅ File copied to inbox
3. ✅ Git commit created
4. ✅ Push to GitHub successful  
5. ✅ GitHub Actions triggered
6. ✅ OCR processing completes
7. ✅ CSV file updated
8. ✅ Reports generated

---

## Phase 6: Monitoring & Health Checks

### ✅ Schedule Verification
```bash
# Check next scheduled run
launchctl list com.mygym.icloud-sync
```

**Expected**: Job shows next run time

### ✅ Log Monitoring Setup
```bash
# Monitor logs in real-time
tail -f logs/icloud-sync.log
```

**Expected**: Clean, readable log output during execution

### ✅ Error Scenarios Test
```bash
# Test error handling (temporarily rename iCloud directory)
sudo mv "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym" \
        "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym_BACKUP"

# Run sync to test error handling
./scripts/icloud-sync.sh

# Restore directory
sudo mv "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym_BACKUP" \
        "/Users/i_kawano/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym"
```

**Expected**: Graceful error handling, clear error messages

---

## Phase 7: Performance & Reliability

### ✅ Resource Usage Check
```bash
# Check if launchd job is resource-efficient
ps aux | grep icloud-sync
```

**Expected**: Minimal resource usage when idle

### ✅ Data Integrity Verification
```bash
# Verify CSV data is being updated correctly
tail -5 public/fit_place24_data.csv
```

**Expected**: Recent data entries with correct format

---

## Verification Checklist Summary

- [ ] **Pre-Setup**: All files exist with correct permissions
- [ ] **Setup Process**: Installation completes successfully
- [ ] **LaunchAgent**: Service is loaded and running
- [ ] **Manual Sync**: Script executes without errors
- [ ] **Git Integration**: Commits and pushes work correctly
- [ ] **GitHub Actions**: Workflows trigger and execute
- [ ] **End-to-End**: Complete flow from iCloud to CSV works
- [ ] **Monitoring**: Logs are generated and accessible
- [ ] **Error Handling**: System handles failures gracefully
- [ ] **Performance**: Resource usage is acceptable

---

## Troubleshooting Commands

### Check LaunchAgent Status
```bash
launchctl list | grep com.mygym
launchctl print gui/$(id -u)/com.mygym.icloud-sync
```

### Restart LaunchAgent
```bash
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
```

### View Detailed Logs
```bash
tail -f logs/icloud-sync.log
tail -f logs/launchd-stdout.log
tail -f logs/launchd-stderr.log
```

### GitHub Actions Debug
```bash
gh run list --limit=5
gh run view <run-id> --log
```

---

**Status**: Ready for verification  
**Next Step**: Execute verification phases in order