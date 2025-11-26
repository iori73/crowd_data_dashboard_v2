# AI Context Guide

**Last Updated**: 2025-01-XX  
**Purpose**: Guide for future AI assistants working with this project and a beginner developer

---

## User Profile

### Developer Background

**Experience Level**: Beginner  
**Knowledge**: Limited programming experience, relies on AI assistance  
**Learning Style**: Prefers detailed explanations with reasoning  
**Goals**: Learn modern best practices while building useful projects

### Key Characteristics

- **Needs Explanations**: Don't assume knowledge - explain fundamentals
- **Prefers Best Practices**: Follow modern, professional engineering standards
- **Wants to Learn**: Use this as a teaching opportunity, not just code generation
- **Relies on AI**: Expects AI to guide development decisions

### Communication Preferences

- ✅ **Explain WHY**, not just WHAT
- ✅ Use analogies for complex concepts
- ✅ Show examples before/after code changes
- ✅ Reference documentation when making suggestions
- ✅ Break down complex tasks into steps
- ❌ Don't use jargon without explanation
- ❌ Don't skip steps assuming knowledge
- ❌ Don't make changes without explaining impact

---

## Communication Style

### Always Explain WHY

**Bad Example**:
> "Change the OCR engine to Tesseract."

**Good Example**:
> "We should change the OCR engine to Tesseract because EasyOCR has timeout issues in automated environments. Tesseract is more reliable for scheduled jobs and doesn't require model downloads. Here's why this matters: [explanation]"

### Use Analogies

**Complex Concept**: OCR (Optical Character Recognition)

**Analogy**:
> "OCR is like a scanner that can 'read' a photo of text and convert it to actual text you can copy/paste. Just like how you might take a photo of a document and then use an app to extract the text, our system takes screenshots of the gym app and extracts the crowd numbers."

### Show Examples

**Before Making Changes**:
```typescript
// Current code
const data = await loadData()

// Proposed change
const data = await loadData(true) // Force reload, bypass cache

// Why: The user clicked refresh, so we want fresh data, not cached
```

**After Making Changes**:
```typescript
// Updated code with explanation
const data = await loadData(true) // Force reload on user refresh
// This bypasses the 5-minute cache to ensure fresh data
```

### Reference Documentation

When suggesting changes, reference relevant docs:
> "According to [Implementation Notes](./implementation_notes.md), we use Tesseract because EasyOCR had timeout issues. If we want to try EasyOCR again, we should test it thoroughly first."

---

## Development Patterns

### How Past Cursor Sessions Approached Problems

**Pattern 1: Incremental Development**
- Start with working code
- Make small, testable changes
- Verify each change before proceeding
- Document decisions as we go

**Pattern 2: Error-First Debugging**
- When something breaks, check logs first
- Start with simplest explanation
- Test assumptions with minimal changes
- Document findings for future reference

**Pattern 3: Documentation-Driven**
- Write docs before major changes
- Update docs as code evolves
- Keep docs in sync with code
- Use docs to explain decisions

### Debugging Methodology

**Step 1: Reproduce the Issue**
```bash
# Run the failing command
python scripts/python_ocr_processor.py

# Note the exact error message
# Check which step failed
```

**Step 2: Check Logs**
```bash
# Check automation logs
tail -50 logs/icloud-sync.log
tail -50 logs/launchd-stderr.log

# Check GitHub Actions logs
# (via GitHub web interface)
```

**Step 3: Isolate the Problem**
```bash
# Test individual components
# Test with minimal data
# Test with known-good data
```

**Step 4: Fix and Verify**
```bash
# Make minimal fix
# Test again
# Verify with full pipeline
```

### Testing Patterns

**Current Approach**: Manual verification (no automated tests yet)

**Testing Checklist**:
- [ ] OCR processes sample images correctly
- [ ] CSV updates with new data
- [ ] Dashboard displays data correctly
- [ ] Filters work as expected
- [ ] Dark mode works
- [ ] Mobile responsive
- [ ] Bilingual support works

**Future Improvement**: Add automated tests (unit tests, integration tests)

---

## Common Workflows

### How to Test Automation Locally

**Step 1: Manual iCloud Sync**
```bash
cd /Users/i_kawano/Documents/crowd_data_dashboard_v2
./scripts/icloud-sync.sh
```

**Step 2: Check Results**
```bash
# Check if files were copied
ls -la screenshots/inbox/

# Check git status
git status

# Check logs
tail -20 logs/icloud-sync.log
```

**Step 3: Test OCR Processing**
```bash
# Run OCR on inbox images
python scripts/python_ocr_processor.py

# Check output
cat scripts/extracted-data.json | jq '.totalCount'
```

**Step 4: Test CSV Update**
```bash
# Update CSV with extracted data
node scripts/update-csv.js

# Check CSV
tail -5 public/fit_place24_data.csv
```

**Step 5: Test Dashboard**
```bash
# Start dev server
npm run dev

# Open http://localhost:3000
# Verify data displays correctly
```

---

### How to Debug OCR Failures

**Symptom**: OCR not extracting data correctly

**Step 1: Check Image Quality**
```bash
# View the image
open screenshots/inbox/FP24_*.png

# Check if text is readable
# Check if image is blurry
```

**Step 2: Test OCR Manually**
```bash
# Test Tesseract directly
tesseract screenshots/inbox/FP24_*.png stdout -l jpn+eng

# Check output
# Verify Japanese characters are recognized
```

**Step 3: Check Preprocessing**
```python
# Add debug output to preprocess_image()
# Save intermediate images
cv2.imwrite('debug_grayscale.png', gray)
cv2.imwrite('debug_denoised.png', denoised)
cv2.imwrite('debug_enhanced.png', enhanced)
```

**Step 4: Check Regex Patterns**
```python
# Test regex patterns with sample text
import re
text = "22人 やや混んでいます 14:30"
count_match = re.search(r'(\d{1,2})人', text)
print(count_match.group(1))  # Should print: 22
```

**Step 5: Check Fallback**
```python
# Verify fallback is working
# Check if filename parsing works
# Check if time-based estimation is reasonable
```

---

### How to Verify CSV Data Integrity

**Step 1: Check Record Count**
```bash
# Count total records (excluding header)
wc -l public/fit_place24_data.csv
# Should be: (total records + 1 for header)
```

**Step 2: Check for Duplicates**
```bash
# Find duplicate datetime+count combinations
cut -d',' -f1,6 public/fit_place24_data.csv | sort | uniq -d
# Should return empty (no duplicates)
```

**Step 3: Validate Data Ranges**
```bash
# Check count values are reasonable (0-60)
awk -F',' 'NR>1 && ($6 < 0 || $6 > 60) {print}' public/fit_place24_data.csv
# Should return empty (all counts valid)
```

**Step 4: Check Status Code Consistency**
```bash
# Verify count matches status range
# (Requires custom script or manual inspection)
```

**Step 5: Check Date Format**
```bash
# Verify dates are valid
awk -F',' 'NR>1 {print $2}' public/fit_place24_data.csv | sort | uniq
# Should show valid YYYY-MM-DD dates
```

---

### How to Update Dashboard Components

**Step 1: Understand Current Structure**
```bash
# Read the component file
cat src/components/charts/weekly-chart.tsx

# Understand props and state
# Check dependencies
```

**Step 2: Make Changes Incrementally**
```typescript
// Start with small change
// Test in browser
// Verify no regressions
```

**Step 3: Test Responsively**
```bash
# Test on desktop
npm run dev
# Open http://localhost:3000

# Test on mobile (browser dev tools)
# Check different screen sizes
```

**Step 4: Verify Dark Mode**
```typescript
// Test both light and dark themes
// Check color contrast
// Verify readability
```

**Step 5: Check Bilingual Support**
```typescript
// Test Japanese and English
// Verify translations
// Check text overflow
```

---

## AI Assistance Best Practices

### Don't Assume Knowledge - Explain Fundamentals

**Bad**:
> "Use a singleton pattern for the DataLoader."

**Good**:
> "We should use a singleton pattern for the DataLoader. A singleton ensures only one instance exists, which is important here because we want to share the cached data across all components. Here's how it works: [explanation with code example]"

### Provide Step-by-Step Instructions

**For Complex Tasks**:
1. Break into small steps
2. Explain each step
3. Provide code examples
4. Show expected output
5. Explain how to verify

**Example**:
> "To add a new chart type, follow these steps:
> 1. First, understand the current chart structure [show code]
> 2. Add the new chart type to the type definition [show code]
> 3. Update the chart rendering logic [show code]
> 4. Test with sample data [show command]
> 5. Verify in browser [show what to check]"

### Validate Changes with Testing Commands

**Always Provide**:
- Commands to test the change
- Expected output
- How to verify success
- What to check if it fails

**Example**:
> "After making this change, test it with:
> ```bash
> npm run dev
> # Open http://localhost:3000
> # Click the new button
> # Verify it works as expected
> ```
> 
> If it doesn't work, check:
> - Browser console for errors
> - Network tab for failed requests
> - Component props are correct"

### Document Decisions for Future Reference

**When Making Changes**:
- Explain why the change is needed
- Document alternatives considered
- Note any trade-offs
- Update relevant documentation

**Example**:
> "I'm changing the cache duration from 5 minutes to 10 minutes because:
> - The data doesn't change frequently
> - Reduces server load
> - Still provides fresh data when needed
> 
> Trade-off: Users might see slightly stale data (up to 10 minutes old)
> 
> Alternative considered: Real-time updates via WebSocket (too complex for current needs)"

---

## Project-Specific Guidance

### Critical Files to Never Modify Without Backup

**1. `public/fit_place24_data.csv`**
- **Why**: Contains all historical data
- **Before Changes**: Create backup, commit current state
- **Risk**: Data loss if corrupted

**2. `scripts/python_ocr_processor.py`**
- **Why**: Core OCR logic, complex and tested
- **Before Changes**: Test with sample images, commit before changes
- **Risk**: Breaking data extraction

**3. Automation Configuration Files**
- `scripts/com.mygym.*.plist` - launchd jobs
- `.github/workflows/*.yml` - GitHub Actions
- **Before Changes**: Test in branch, verify automation still works
- **Risk**: Breaking scheduled jobs

### Safe Areas for Experimentation

**Frontend Components**:
- `src/components/` - UI components
- `src/app/page.tsx` - Main page
- `src/lib/translations.ts` - Translations

**Styling**:
- `src/app/globals.css` - Global styles
- `tailwind.config.ts` - Tailwind config

**Documentation**:
- `docs/` - All documentation
- `README.md` - Project readme

### How to Roll Back If Something Breaks

**Git Rollback**:
```bash
# View recent commits
git log --oneline -10

# Rollback to previous commit (keeps changes)
git reset --soft HEAD~1

# Rollback specific file
git checkout HEAD~1 -- path/to/file
```

**CSV Rollback**:
```bash
# Restore previous CSV version
git checkout <commit-hash> -- public/fit_place24_data.csv
```

**launchd Rollback**:
```bash
# Unload job
launchctl unload ~/Library/LaunchAgents/com.mygym.icloud-sync.plist

# Restore previous plist
cp _archive/com.mygym.icloud-sync.plist ~/Library/LaunchAgents/

# Reload job
launchctl load ~/Library/LaunchAgents/com.mygym.icloud-sync.plist
```

---

## Typical Commands / Workflows

### Daily Development

```bash
# Start development server
npm run dev

# Type check
npm run typecheck

# Lint code
npm run lint

# Build for production
npm run build
```

### Testing Automation

```bash
# Test iCloud sync
./scripts/icloud-sync.sh

# Test OCR processing
python scripts/python_ocr_processor.py

# Test CSV update
node scripts/update-csv.js

# Check logs
tail -f logs/icloud-sync.log
```

### Git Workflow

```bash
# Check status
git status

# View changes
git diff

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push
```

### Debugging

```bash
# Check launchd jobs
launchctl list | grep mygym

# View launchd logs
tail -f logs/launchd-stdout.log
tail -f logs/launchd-stderr.log

# Test OCR manually
tesseract image.png stdout -l jpn+eng

# Check CSV data
head -20 public/fit_place24_data.csv
```

---

## User Preferences in Development

### Code Style

- **Follow Modern Best Practices**: Use latest patterns, avoid deprecated APIs
- **TypeScript**: Prefer type safety, use interfaces
- **React**: Use functional components, hooks
- **Naming**: Clear, descriptive names (not abbreviations)

### Documentation

- **Inline Comments**: Explain complex logic
- **README Updates**: Keep README current
- **Doc Comments**: Document functions and classes
- **Change Logs**: Note significant changes

### Testing

- **Manual Testing**: Current approach (no automated tests yet)
- **Verify Changes**: Always test before committing
- **Check Multiple Scenarios**: Test edge cases
- **Document Test Results**: Note what was tested

### Error Handling

- **Graceful Degradation**: System should continue working if possible
- **Clear Error Messages**: Help user understand what went wrong
- **Logging**: Log errors for debugging
- **Fallback Systems**: Have backup plans (e.g., OCR fallback)

---

## How the AI Should Reason About This Project

### Understanding the System

**Think in Layers**:
1. **Data Collection**: iPhone → iCloud → Local
2. **Data Processing**: OCR → JSON → CSV
3. **Data Storage**: CSV file (simple, portable)
4. **Data Visualization**: Next.js dashboard

**Think in Flows**:
- Screenshot capture flow
- OCR processing flow
- CSV update flow
- Dashboard rendering flow

**Think in Components**:
- Frontend: React components, state management
- Backend: Python OCR, Node.js CSV processor
- Automation: launchd, GitHub Actions
- Deployment: Vercel

### Making Decisions

**Consider**:
- **Simplicity**: Prefer simple solutions
- **Reliability**: System must work automatically
- **Maintainability**: Code should be easy to understand
- **Beginner-Friendly**: Explain decisions clearly

**Avoid**:
- Over-engineering
- Complex dependencies
- Breaking changes without migration path
- Assumptions about user knowledge

### Suggesting Improvements

**Before Suggesting**:
1. Understand current implementation
2. Identify the problem clearly
3. Consider alternatives
4. Explain trade-offs
5. Provide migration path if needed

**When Suggesting**:
- Explain why it's better
- Show code examples
- Provide testing steps
- Note any risks
- Update documentation

---

## Common Scenarios

### User Asks: "How do I add a new feature?"

**Response Structure**:
1. Understand the feature request
2. Explain where it fits in the architecture
3. Break down into steps
4. Provide code examples
5. Show how to test
6. Update documentation

### User Asks: "Something is broken, help me fix it"

**Response Structure**:
1. Ask for error messages/logs
2. Reproduce the issue
3. Identify root cause
4. Explain the problem
5. Provide fix with explanation
6. Show how to verify fix
7. Update docs if needed

### User Asks: "Can we use [new technology]?"

**Response Structure**:
1. Understand why they want it
2. Evaluate fit with current architecture
3. Explain pros and cons
4. Consider alternatives
5. Provide migration path if appropriate
6. Note any risks or complexity

---

## Related Documentation

- **[Project Overview](./project_overview.md)**: What this project does
- **[Architecture](./architecture.md)**: System design
- **[Implementation Notes](./implementation_notes.md)**: Technical decisions
- **[Quick Start](./QUICK_START.md)**: Setup instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues

---

**This document helps future AI assistants understand how to work effectively with this project and its beginner developer.**
