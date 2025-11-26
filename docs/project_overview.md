# Project Overview

**Last Updated**: 2025-01-XX  
**Project Status**: ✅ Production Ready  
**Deployment**: [Vercel](https://crowd-data-dashboard-v2.vercel.app)  
**Repository**: [GitHub](https://github.com/iori73/crowd_data_dashboard_v2)

---

## What Problem This Solves

### The Core Problem

Gym-goers want to know **when the gym is least crowded** so they can:
- Avoid waiting for equipment
- Have a more comfortable workout experience
- Plan their schedule around optimal gym times

The **My Gym (FIT PLACE24)** app shows real-time crowd status, but:
- ❌ No historical data tracking
- ❌ No pattern analysis (which days/times are typically less crowded)
- ❌ No visualizations to understand trends
- ❌ Manual checking required each time

### Our Solution

This project automatically:
1. **Captures** gym crowd data from iPhone screenshots (3x daily)
2. **Extracts** crowd numbers and status using OCR (Optical Character Recognition)
3. **Stores** historical data in CSV format
4. **Visualizes** patterns in a beautiful web dashboard
5. **Analyzes** trends to identify optimal workout times

**Result**: Gym-goers can see at a glance when the gym is typically empty, helping them plan better workouts.

---

## User Story

### As a Gym-Goer

**Scenario**: "I want to go to the gym tomorrow evening, but I don't want it to be crowded."

**Before this project**:
1. Open My Gym app
2. Check current crowd status
3. Guess based on current status (not reliable)
4. Hope for the best

**With this project**:
1. Open dashboard: `https://crowd-data-dashboard-v2.vercel.app`
2. See historical data: "Tuesday evenings average 15 people"
3. Compare with other days: "Monday evenings average 30 people"
4. Make informed decision: "I'll go Tuesday evening"

### The Complete User Journey

```
📱 iPhone User
   ↓
   Sets up Shortcuts app to auto-capture gym screenshots
   ↓
   Goes about daily life (system works automatically)
   ↓
   Opens dashboard when planning workout
   ↓
   Sees beautiful charts showing:
   - Average crowd by day of week
   - Peak times (when it's busiest)
   - Quiet times (when it's emptiest)
   - Historical trends
   ↓
   Makes informed decision about when to visit gym
```

---

## Domain Concepts

### My Gym / FIT PLACE24 App

**What it is**: A Japanese gym chain app that shows real-time crowd status.

**Key Information Displayed**:
- **利用者数 (Number of Users)**: Current number of people in the gym (e.g., "22人")
- **混雑状況 (Crowd Status)**: Text description of how crowded it is
- **時刻 (Time)**: When the status was last updated

**Screenshot Format**:
- Filename: `FP24_YYYYMMDD_HHMMSS.png` (e.g., `FP24_20250115_143022.png`)
- Contains: Number of people, status text, timestamp

### Japanese Crowding Terminology

The app uses specific Japanese terms that we extract and translate:

| Japanese | English | Status Code | Count Range | Meaning |
|----------|---------|-------------|-------------|---------|
| 空いています | Empty/Not Crowded | 5 | 0-10 people | Very quiet, lots of space |
| やや空いています | Slightly Empty | 4 | 11-20 people | Comfortable, some equipment available |
| やや混んでいます | Slightly Crowded | 3 | 21-30 people | Getting busy, may wait for popular equipment |
| 混んでいます | Crowded | 2 | 31-40 people | Very busy, expect waits |
| 非常に混んでいます | Extremely Crowded | 1 | 41+ people | Extremely busy, avoid if possible |

**Why This Matters**: The OCR system must recognize these Japanese characters correctly to extract meaningful data.

### Status Codes Explained

We use numeric codes (1-5) instead of text for:
- **Easier data processing**: Numbers are easier to sort, filter, and analyze
- **Consistency**: Text can vary, numbers don't
- **Database efficiency**: Smaller storage, faster queries

**Status Code Mapping**:
```javascript
// From python_ocr_processor.py
status_patterns = [
    ('空いています', 5, 0, 10),      // Empty
    ('やや空いています', 4, 11, 20),  // Slightly empty
    ('やや混んでいます', 3, 21, 30),  // Slightly crowded
    ('混んでいます', 2, 31, 40),      // Crowded
]
```

**Lower number = More crowded** (counterintuitive, but that's how the app works)

---

## Data Flow Narrative

### The Complete Journey of a Data Point

Let's follow a single screenshot from capture to visualization:

#### Step 1: iPhone Capture (Automatic)
```
📱 iPhone User
   ↓
   Shortcuts app runs automatically (scheduled)
   ↓
   Opens My Gym app
   ↓
   Takes screenshot of crowd status screen
   ↓
   Saves to iCloud Drive: 
   ~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym/
   ↓
   Filename: FP24_20250115_143022.png
```

**Why iCloud?**: 
- Automatic sync across devices
- Accessible from Mac for processing
- No manual file transfer needed

#### Step 2: Local Collection (launchd Automation)
```
⏰ launchd scheduler (runs 3x daily: 00:05, 12:05, 18:05)
   ↓
   Executes: scripts/icloud-sync.sh
   ↓
   Scans iCloud folder for new screenshots
   ↓
   Copies new files to: screenshots/inbox/
   ↓
   Commits to Git
   ↓
   Pushes to GitHub
```

**Why launchd?**: 
- macOS built-in scheduler (reliable)
- Runs even when user is logged out
- Better than cron for macOS

#### Step 3: OCR Processing (Python)
```
🤖 Python OCR Script (python_ocr_processor.py)
   ↓
   Reads images from screenshots/inbox/
   ↓
   Preprocesses image (noise removal, contrast enhancement)
   ↓
   Runs Tesseract OCR (Japanese + English)
   ↓
   Extracts text: "22人 やや混んでいます 14:30"
   ↓
   Parses with regex patterns:
   - Count: 22
   - Status: "やや混んでいます" → Code 3, Range 21-30
   - Time: 14:30
   - Date: From filename (2025-01-15)
   ↓
   If OCR fails → Intelligent fallback (filename-based estimation)
   ↓
   Saves to: scripts/extracted-data.json
```

**Why Tesseract?**: 
- EasyOCR had timeout issues
- Tesseract is more reliable
- Good Japanese language support

#### Step 4: CSV Update (Node.js)
```
📊 CSV Updater (update-csv.js)
   ↓
   Reads: scripts/extracted-data.json
   ↓
   Reads existing: public/fit_place24_data.csv
   ↓
   Converts JSON to CSV format
   ↓
   Removes duplicates (using datetime + count as key)
   ↓
   Sorts by datetime
   ↓
   Writes updated: public/fit_place24_data.csv
```

**Why CSV?**: 
- Simple, portable format
- Easy to inspect manually
- No database setup required
- Works well with Next.js static hosting

#### Step 5: Dashboard Visualization (Next.js)
```
🌐 Next.js Dashboard (Vercel)
   ↓
   User opens: https://crowd-data-dashboard-v2.vercel.app
   ↓
   Fetches: /fit_place24_data.csv
   ↓
   Parses CSV with PapaParse
   ↓
   Processes data:
   - Groups by weekday
   - Calculates hourly averages
   - Finds peak/quiet times
   ↓
   Renders:
   - Statistics cards (total records, averages, peaks)
   - Weekly charts (one per weekday)
   - Interactive filters (date range, chart type)
   ↓
   User sees beautiful visualizations
```

**Why Next.js?**: 
- Modern React framework
- Great performance
- Easy deployment to Vercel
- Server-side rendering for SEO

---

## Success Metrics

### What "Working Correctly" Looks Like

#### Data Collection
- ✅ Screenshots captured 3x daily (00:05, 12:05, 18:05)
- ✅ OCR processing succeeds >95% of the time
- ✅ CSV updated with new data within 10 minutes of capture
- ✅ No duplicate records in CSV

#### Data Quality
- ✅ Count values are reasonable (0-60 people)
- ✅ Status codes match count ranges (e.g., count 22 → status code 3)
- ✅ Dates and times are valid
- ✅ Weekday calculations are correct

#### Dashboard
- ✅ Loads in <3 seconds
- ✅ Charts render correctly for all weekdays
- ✅ Filters work (date range, chart type)
- ✅ Responsive on mobile devices
- ✅ Dark mode works correctly
- ✅ Bilingual support (Japanese/English)

#### Automation
- ✅ launchd jobs run on schedule
- ✅ GitHub Actions trigger on push
- ✅ No manual intervention required
- ✅ Errors are logged for debugging

### Current Status

**As of Latest Check**:
- 📊 **Total Records**: 263+ data points
- 📅 **Date Range**: June 2025 - Present
- ✅ **OCR Success Rate**: ~95% (with fallback)
- ✅ **Automation**: Fully operational
- ✅ **Dashboard**: Deployed and accessible

---

## Beginner-Friendly Explanations

### What is OCR?

**OCR (Optical Character Recognition)** is technology that reads text from images.

**Analogy**: Like a scanner that can "read" a photo of text and convert it to actual text you can copy/paste.

**In this project**:
- Input: Screenshot image of gym app showing "22人 やや混んでいます"
- OCR Process: Analyzes image, finds text regions, recognizes characters
- Output: Text string "22人 やや混んでいます"
- Our Code: Extracts numbers and status from this text

**Why it's hard**: 
- Images can be blurry
- Text can be at angles
- Background colors can interfere
- Japanese characters are complex

**Our solution**: 
- Image preprocessing (clean up the image first)
- Multiple OCR engines (Tesseract primary, fallback if needed)
- Intelligent parsing (regex patterns to extract what we need)
- Fallback system (if OCR fails, estimate from filename)

### What is launchd?

**launchd** is macOS's built-in task scheduler (like cron on Linux, but better for macOS).

**Analogy**: Like setting an alarm clock, but for running computer programs automatically.

**In this project**:
- We tell macOS: "Run this script 3 times per day at specific times"
- macOS handles the scheduling automatically
- Script runs even if you're not logged in
- Logs are saved for debugging

**Why we use it**:
- More reliable than GitHub Actions schedule
- Runs locally (can access iCloud files)
- Built into macOS (no extra software needed)
- Better error handling than cron

**Our setup**:
- File: `scripts/com.mygym.icloud-sync.plist`
- Schedule: 00:05, 12:05, 18:05 daily
- Script: `scripts/icloud-sync.sh`

### What is GitHub Actions?

**GitHub Actions** is a cloud-based automation service that runs code when certain events happen.

**Analogy**: Like a robot assistant that watches your code repository and automatically does tasks when you push code.

**In this project**:
- Event: When code is pushed to GitHub
- Action: Run OCR processing, update CSV, rebuild dashboard
- Result: Everything stays up-to-date automatically

**Why we use it**:
- Runs in the cloud (no need for your computer to be on)
- Free for public repositories
- Integrates with GitHub (easy to see what happened)
- Can run complex workflows (Python, Node.js, etc.)

**Our workflow**:
- Trigger: Push to `screenshots/inbox/` or `public/fit_place24_data.csv`
- Steps: Setup → OCR → CSV Update → Commit → Deploy
- Result: Dashboard automatically updates

### What is Vercel?

**Vercel** is a hosting service for web applications (like Next.js apps).

**Analogy**: Like a parking lot for your website - you build it, park it there, and people can visit it.

**In this project**:
- We build the Next.js dashboard
- Push code to GitHub
- Vercel automatically deploys it
- Users can access: `https://crowd-data-dashboard-v2.vercel.app`

**Why we use it**:
- Free for personal projects
- Automatic deployments from GitHub
- Fast global CDN (content delivery network)
- Easy to set up

---

## Key Features

### 1. Automatic Data Collection
- iPhone Shortcuts app captures screenshots automatically
- No manual intervention required
- Runs 3x daily for comprehensive data

### 2. Intelligent OCR Processing
- Tesseract OCR for text extraction
- Intelligent fallback if OCR fails
- Handles Japanese characters correctly

### 3. Data Visualization
- Beautiful charts showing crowd patterns
- Statistics cards with key metrics
- Interactive filters (date range, chart type)
- Responsive design (works on mobile)

### 4. Bilingual Support
- Japanese and English interface
- Automatic translation of status labels
- User can switch languages easily

### 5. Dark Mode
- Light and dark themes
- Respects system preferences
- Smooth transitions

### 6. Data Export
- CSV export functionality
- SVG chart downloads
- Easy data sharing

---

## Project Goals

### Primary Goal
**Help gym-goers make informed decisions about when to visit the gym** by providing historical crowd data and pattern analysis.

### Secondary Goals
- **Learn modern web development**: Next.js, React, TypeScript
- **Practice automation**: launchd, GitHub Actions, scripting
- **Understand data processing**: OCR, CSV manipulation, data visualization
- **Build something useful**: Real-world problem solving

### Success Criteria
- ✅ System runs automatically without manual intervention
- ✅ Data is accurate and reliable
- ✅ Dashboard is fast and user-friendly
- ✅ Code is maintainable and well-documented

---

## Future Vision

While not currently planned, potential future enhancements:

- **Real-time notifications**: Alert when gym is getting crowded
- **Predictive modeling**: ML to predict future crowd levels
- **Multi-gym support**: Track multiple gym locations
- **Mobile app**: Native iOS/Android app
- **API development**: Allow third-party integrations
- **PWA support**: Offline access to dashboard

---

## Related Documentation

- **[Architecture Guide](./architecture.md)**: Technical system design
- **[Implementation Notes](./implementation_notes.md)**: Why we made specific technical choices
- **[AI Context](./ai_context.md)**: How to work with this project as an AI assistant
- **[Quick Start](./QUICK_START.md)**: Getting started after factory reset
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues and solutions

---

**This document provides the "why" and "what" of the project. For the "how", see the Architecture and Implementation Notes documents.**
