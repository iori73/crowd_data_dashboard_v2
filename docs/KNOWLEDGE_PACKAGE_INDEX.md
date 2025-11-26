# Knowledge Preservation Package - Index

**Created**: 2025-01-XX  
**Purpose**: Master index for all project knowledge documentation

---

## 📚 Complete Documentation Package

This knowledge preservation package contains **7 comprehensive documents** that capture all project context, architecture, decisions, and workflows. After a factory reset, a fresh Cursor installation can use these documents to fully understand and continue development.

---

## 📖 Documentation Files

### 1. [Project Overview](./project_overview.md)
**Purpose**: Complete project context and domain knowledge

**Contains**:
- What problem this solves
- User stories and scenarios
- Domain concepts (Japanese terminology, status codes)
- Data flow narrative
- Success metrics
- Beginner-friendly explanations

**Read this first** to understand what the project does and why it exists.

---

### 2. [Architecture](./architecture.md)
**Purpose**: Technical architecture with visual diagrams

**Contains**:
- System architecture diagrams (Mermaid)
- Component relationships
- Data flow diagrams
- Frontend/backend architecture
- File structure explanations
- Module dependencies
- Deployment architecture

**Read this** to understand how the system is built and how components interact.

---

### 3. [Implementation Notes](./implementation_notes.md)
**Purpose**: Critical technical decisions and constraints

**Contains**:
- Why we made specific choices (Tesseract, launchd, SSH, CSV, etc.)
- Known limitations and trade-offs
- Configuration deep-dives
- Non-obvious technical details
- Critical files to protect
- Rollback procedures

**Read this** to understand why things are implemented the way they are.

---

### 4. [AI Context](./ai_context.md)
**Purpose**: Guide for future AI assistants working with a beginner developer

**Contains**:
- User profile and characteristics
- Communication style preferences
- Development patterns used
- Common workflows
- AI assistance best practices
- Project-specific guidance

**Read this** if you're an AI assistant helping with this project.

---

### 5. [TODO & Next Steps](./todo_next_steps.md)
**Purpose**: Future development roadmap and technical debt

**Contains**:
- Technical debt items
- Feature ideas
- Performance improvements
- Beginner-friendly next tasks
- Advanced future considerations
- Priority matrix

**Read this** to see what's planned for the future.

---

### 6. [Quick Start](./QUICK_START.md)
**Purpose**: Immediate setup instructions after factory reset

**Contains**:
- Prerequisites checklist
- Step-by-step setup (10 steps)
- Verification commands
- Common pitfalls and solutions
- Next steps after setup

**Read this** when setting up the project from scratch.

---

### 7. [Troubleshooting](./TROUBLESHOOTING.md)
**Purpose**: Practical debugging guide

**Contains**:
- Symptom → Diagnosis → Solution format
- Common issues and fixes
- Health check commands
- Emergency recovery procedures
- Getting help resources

**Read this** when something isn't working.

---

## 🗺️ Navigation Guide

### For New Developers / AI Assistants

**Start Here**:
1. [Project Overview](./project_overview.md) - Understand what this is
2. [Quick Start](./QUICK_START.md) - Get it running
3. [Architecture](./architecture.md) - Understand the structure
4. [AI Context](./ai_context.md) - Learn how to help effectively

**When Developing**:
- [Implementation Notes](./implementation_notes.md) - Understand decisions
- [Troubleshooting](./TROUBLESHOOTING.md) - Fix issues
- [TODO & Next Steps](./todo_next_steps.md) - See what's next

### For Understanding Specific Topics

**Want to understand...**

- **Why we use Tesseract?** → [Implementation Notes](./implementation_notes.md#why-tesseract-over-easyocr)
- **How data flows?** → [Architecture](./architecture.md#data-flow-diagrams)
- **How to debug OCR?** → [Troubleshooting](./TROUBLESHOOTING.md#ocr-processing-issues)
- **What's the user story?** → [Project Overview](./project_overview.md#user-story)
- **How to set up automation?** → [Quick Start](./QUICK_START.md#step-6-configure-launchd-jobs)
- **What features are planned?** → [TODO & Next Steps](./todo_next_steps.md#feature-ideas)

---

## 📋 Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dashboard
npm run build            # Build for production
npm run typecheck        # Type check
npm run lint             # Lint code

# Data Processing
python3 scripts/python_ocr_processor.py  # Run OCR
node scripts/update-csv.js                # Update CSV
./scripts/icloud-sync.sh                  # Sync iCloud

# Automation
launchctl list | grep mygym              # Check jobs
tail -f logs/icloud-sync.log             # Watch logs

# Git
git status                               # Check changes
git push                                 # Push to GitHub
```

### Key File Locations

```
public/fit_place24_data.csv              # Main data file
scripts/extracted-data.json              # OCR output
scripts/python_ocr_processor.py          # OCR logic
scripts/update-csv.js                    # CSV processor
src/app/page.tsx                         # Main dashboard
.github/workflows/weekly-data-collection.yml  # GitHub Actions
```

### Important Paths

```
~/Library/Mobile Documents/iCloud~is~workflow~my~workflows/Documents/My_Gym  # iCloud
~/Library/LaunchAgents/com.mygym.*.plist  # launchd configs
logs/                                     # Log files
screenshots/inbox/                        # Processing queue
```

---

## 🎯 Success Criteria

After reading this documentation package, you should be able to:

- ✅ Understand what the project does and why
- ✅ Navigate the codebase confidently
- ✅ Explain any technical decision
- ✅ Debug issues systematically
- ✅ Suggest improvements aligned with project goals
- ✅ Assist the user as a patient teacher, not just a code generator

---

## 📝 Document Maintenance

### When to Update

- **After major changes**: Update relevant docs
- **When fixing bugs**: Update Troubleshooting if new issue
- **When adding features**: Update TODO & Next Steps
- **When making decisions**: Update Implementation Notes

### How to Update

1. Identify which document(s) need updates
2. Make changes with clear explanations
3. Update "Last Updated" date
4. Cross-reference related documents
5. Keep beginner-friendly tone

---

## 🔗 Related Resources

### External Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract)
- [launchd Documentation](https://www.launchd.info/)
- [GitHub Actions](https://docs.github.com/en/actions)

### Project Resources

- [GitHub Repository](https://github.com/iori73/crowd_data_dashboard_v2)
- [Live Dashboard](https://crowd-data-dashboard-v2.vercel.app)
- [GitHub Actions](https://github.com/iori73/crowd_data_dashboard_v2/actions)

---

## 📊 Documentation Statistics

- **Total Documents**: 7
- **Total Pages**: ~50+ (estimated)
- **Diagrams**: 10+ Mermaid diagrams
- **Code Examples**: 30+ snippets
- **Troubleshooting Items**: 20+ common issues

---

## ✅ Verification Checklist

After factory reset, verify you can:

- [ ] Understand project purpose from Project Overview
- [ ] Set up project using Quick Start
- [ ] Navigate codebase using Architecture
- [ ] Explain technical decisions using Implementation Notes
- [ ] Debug issues using Troubleshooting
- [ ] Plan future work using TODO & Next Steps
- [ ] Assist effectively using AI Context

---

## 🙏 Notes for Future Maintainers

This documentation package was created to preserve all project knowledge for post-factory-reset continuity. It's designed to:

1. **Help beginners**: Clear explanations, no assumed knowledge
2. **Guide AI assistants**: Specific instructions for working with this project
3. **Preserve context**: All decisions, constraints, and reasoning documented
4. **Enable continuity**: Fresh start can pick up where we left off

**Please keep it updated** as the project evolves. This is a living document that should grow with the project.

---

**This index provides a roadmap to all project knowledge. Use it to navigate the documentation package efficiently.**
