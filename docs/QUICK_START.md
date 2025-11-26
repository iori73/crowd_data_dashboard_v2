# Quick Start Guide

**Last Updated**: 2025-01-XX  
**Purpose**: Immediate setup instructions after factory reset or fresh installation

---

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] macOS (required for iCloud access and launchd)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Python 3.8+ installed (`python3 --version`)
- [ ] Git installed (`git --version`)
- [ ] GitHub account with repository access
- [ ] Terminal with Full Disk Access permission

---

## Step 1: Clone Repository

```bash
# Navigate to your projects directory
cd ~/Documents

# Clone the repository
git clone git@github.com:iori73/crowd_data_dashboard_v2.git

# Navigate into project
cd crowd_data_dashboard_v2
```

**Verify**: You should see project files
```bash
ls -la
# Should show: package.json, scripts/, src/, etc.
```

---

## Step 2: Install Dependencies

### Node.js Dependencies

```bash
# Install npm packages
npm install
```

**Verify**: Check for `node_modules/` directory
```bash
ls node_modules/ | head -5
```

### Python Dependencies

```bash
# Install Python packages
pip3 install -r requirements.txt
```

**Verify**: Check Tesseract is available
```bash
tesseract --version
# Should show version info

# If not installed, install via Homebrew:
brew install tesseract tesseract-lang
```

---

## Step 3: Configure Git

### Set Up SSH Authentication

```bash
# Check if SSH key exists
ls -la ~/.ssh/id_ed25519.pub

# If not, generate one
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter to accept default location
# Optionally set a passphrase

# Copy public key to clipboard
pbcopy < ~/.ssh/id_ed25519.pub

# Add to GitHub:
# 1. Go to https://github.com/settings/keys
# 2. Click "New SSH key"
# 3. Paste key and save

# Test connection
ssh -T git@github.com
# Should say: "Hi iori73! You've successfully authenticated..."
```

### Configure Git User

```bash
# Set user name and email
git config user.name "Your Name"
git config user.email "your_email@example.com"

# Verify
git config user.name
git config user.email
```

---

## Step 4: Set Up macOS Permissions

### Full Disk Access

**Why**: Required to access iCloud Drive files

**Steps**:
1. Open **System Settings** (or System Preferences on older macOS)
2. Go to **Privacy & Security** → **Full Disk Access**
3. Click the **+** button
4. Navigate to `/Applications/Utilities/Terminal.app`
5. Add Terminal to the list
6. **Restart Terminal** (important!)

**Verify**: Check iCloud path is accessible
```bash
ls ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym
# Should list files or show "No such file or directory" (OK if no files yet)
```

---

## Step 5: Set Up iPhone Shortcuts

**Note**: This step requires access to the iPhone that captures screenshots

1. Open **Shortcuts** app on iPhone
2. Create new shortcut for My Gym screenshot
3. Configure to save screenshots to:
   ```
   iCloud Drive/Shortcuts/My_Gym/
   ```
4. Set up automation to run at desired times
5. Test by running shortcut manually

**Verify**: Check iCloud folder on Mac
```bash
# Wait a few minutes for iCloud sync
ls ~/Library/Mobile\ Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym
# Should show screenshot files if shortcut ran
```

---

## Step 6: Configure launchd Jobs

### Install iCloud Sync Job

```bash
# Copy plist to LaunchAgents
cp scripts/com.mygym.icloud-sync.plist ~/Library/LaunchAgents/

# Update path in plist if needed (check your actual project path)
# Edit: ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
# Update: /Users/i_kawano/Documents/crowd_data_dashboard_v2
# To: /Users/YOUR_USERNAME/Documents/crowd_data_dashboard_v2

# Load the job
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Verify it's loaded
launchctl list | grep mygym
# Should show: com.mygym.icloud-sync
```

### Install Weekly Process Job

```bash
# Copy plist to LaunchAgents
cp scripts/com.mygym.weekly-process.plist ~/Library/LaunchAgents/

# Update path in plist if needed
# Edit: ~/Library/LaunchAgents/com.mygym.weekly-process.plist

# Load the job
launchctl load ~/Library/LaunchAgents/com.mygym.weekly-process.plist

# Verify
launchctl list | grep mygym
# Should show both jobs
```

---

## Step 7: Test the System

### Test OCR Processing

```bash
# Create test directory if needed
mkdir -p screenshots/inbox

# Copy a test screenshot (if you have one)
# Or wait for automatic collection

# Run OCR processing manually
python3 scripts/python_ocr_processor.py

# Check output
cat scripts/extracted-data.json | jq '.totalCount'
# Should show number of processed images
```

### Test CSV Update

```bash
# Update CSV with extracted data
node scripts/update-csv.js

# Check CSV file
head -5 public/fit_place24_data.csv
# Should show CSV headers and data
```

### Test Dashboard

```bash
# Start development server
npm run dev

# Open browser to http://localhost:3000
# Should see dashboard with data
```

---

## Step 8: Verify Automation

### Check launchd Jobs

```bash
# List all mygym jobs
launchctl list | grep mygym

# Check next run time (approximate)
# Jobs run at: 00:05, 12:05, 18:05 daily
```

### Check Logs

```bash
# View recent sync logs
tail -20 logs/icloud-sync.log

# View launchd output
tail -20 logs/launchd-stdout.log
tail -20 logs/launchd-stderr.log
```

### Test Manual Sync

```bash
# Run sync script manually
./scripts/icloud-sync.sh

# Check if it worked
tail -20 logs/icloud-sync.log
git status
# Should show new files if any were synced
```

---

## Step 9: Verify GitHub Actions

### Check Workflow File

```bash
# Verify workflow exists
cat .github/workflows/weekly-data-collection.yml
# Should show workflow configuration
```

### Test Workflow

```bash
# Make a test change
touch screenshots/inbox/test.txt

# Commit and push
git add screenshots/inbox/test.txt
git commit -m "Test: Trigger GitHub Actions"
git push

# Check GitHub Actions
# Go to: https://github.com/iori73/crowd_data_dashboard_v2/actions
# Should see workflow running
```

---

## Step 10: Verify Deployment

### Check Vercel Deployment

1. Go to: https://crowd-data-dashboard-v2.vercel.app
2. Verify dashboard loads
3. Check data displays correctly
4. Test filters and interactions

### Verify Vercel Integration

```bash
# Check if Vercel CLI is installed (optional)
vercel --version

# Or check via GitHub:
# Repository → Settings → Integrations → Vercel
# Should show connected
```

---

## Common Pitfalls and Solutions

### Issue: "Permission denied" when accessing iCloud

**Solution**:
- Grant Full Disk Access to Terminal (Step 4)
- **Restart Terminal** after granting permission
- Check path is correct

### Issue: "Tesseract not found"

**Solution**:
```bash
# Install via Homebrew
brew install tesseract tesseract-lang

# Verify installation
tesseract --version
```

### Issue: "Git push fails with authentication error"

**Solution**:
- Verify SSH key is added to GitHub (Step 3)
- Test SSH connection: `ssh -T git@github.com`
- Check remote URL: `git remote -v` (should use `git@github.com`, not `https://`)

### Issue: "launchd job not running"

**Solution**:
```bash
# Check if job is loaded
launchctl list | grep mygym

# If not, reload
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Check logs for errors
tail -50 logs/launchd-stderr.log
```

### Issue: "Dashboard shows no data"

**Solution**:
- Check CSV file exists: `ls -la public/fit_place24_data.csv`
- Check CSV has data: `wc -l public/fit_place24_data.csv` (should be > 1)
- Check browser console for errors (F12 → Console)
- Verify CSV format: `head -3 public/fit_place24_data.csv`

---

## Verification Checklist

After setup, verify everything works:

- [ ] Repository cloned successfully
- [ ] Node.js dependencies installed (`npm install` completed)
- [ ] Python dependencies installed (`pip install` completed)
- [ ] Tesseract installed and working
- [ ] Git SSH authentication working
- [ ] Full Disk Access granted to Terminal
- [ ] launchd jobs loaded and listed
- [ ] OCR processing works (tested manually)
- [ ] CSV update works (tested manually)
- [ ] Dashboard runs locally (`npm run dev`)
- [ ] Dashboard displays data correctly
- [ ] GitHub Actions workflow exists
- [ ] Vercel deployment accessible
- [ ] Logs directory exists and writable

---

## Next Steps

After completing setup:

1. **Read Documentation**:
   - [Project Overview](./project_overview.md) - Understand what the project does
   - [Architecture](./architecture.md) - Understand how it works
   - [Implementation Notes](./implementation_notes.md) - Understand why decisions were made

2. **Test Automation**:
   - Wait for next scheduled run (00:05, 12:05, or 18:05)
   - Check logs to verify it ran
   - Verify data was processed

3. **Explore the Code**:
   - Start with `src/app/page.tsx` (main dashboard)
   - Look at `scripts/python_ocr_processor.py` (OCR logic)
   - Check `scripts/update-csv.js` (CSV processing)

4. **Make Your First Change**:
   - Try updating a translation in `src/lib/translations.ts`
   - Or modify a component style
   - Test locally before committing

---

## Getting Help

If you encounter issues:

1. **Check Logs**:
   ```bash
   tail -50 logs/icloud-sync.log
   tail -50 logs/launchd-stderr.log
   ```

2. **Check Documentation**:
   - [Troubleshooting Guide](./TROUBLESHOOTING.md)
   - [Implementation Notes](./implementation_notes.md)

3. **Check GitHub Issues**:
   - https://github.com/iori73/crowd_data_dashboard_v2/issues

4. **Ask AI Assistant**:
   - Reference this guide and error messages
   - Provide context about what you're trying to do

---

## Related Documentation

- **[Project Overview](./project_overview.md)**: What this project does
- **[Architecture](./architecture.md)**: System design
- **[Implementation Notes](./implementation_notes.md)**: Technical decisions
- **[AI Context](./ai_context.md)**: How to work with AI assistants
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions

---

**This guide gets you up and running quickly. For deeper understanding, see the other documentation files.**
