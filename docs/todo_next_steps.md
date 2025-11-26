# TODO & Next Steps

**Last Updated**: 2025-01-XX  
**Purpose**: Future development roadmap, technical debt, and improvement ideas

---

## Technical Debt

### Documentation Consolidation

**Current State**: Documentation is fragmented across multiple files
- `docs/MASTER_SYSTEM_GUIDE.md` - Comprehensive guide
- `docs/CRITICAL_ISSUES_ANALYSIS.md` - Issue analysis
- `docs/CHAT_SESSION_LOG.md` - Implementation history
- `README.md` - Basic setup
- Various other docs in `_archive/`

**Issue**: Information scattered, difficult to maintain

**Solution**: 
- ✅ Created unified documentation structure (this package)
- ⏳ Migrate critical content from old docs
- ⏳ Archive or remove redundant files
- ⏳ Create single source of truth

**Priority**: Medium  
**Effort**: 2-3 hours

---

### Test Coverage

**Current State**: No automated tests, manual verification only

**Issue**: 
- Changes require manual testing
- Risk of regressions
- Difficult to verify fixes

**Solution**: Add automated tests
- Unit tests for CSV processor
- Unit tests for data processing logic
- Integration tests for OCR pipeline
- E2E tests for dashboard

**Priority**: High  
**Effort**: 1-2 weeks

**Beginner-Friendly Approach**:
1. Start with simple unit tests (CSV parsing)
2. Add tests incrementally
3. Use Jest (already in Next.js)
4. Focus on critical paths first

---

### Error Handling Improvements

**Current State**: Basic error handling, some silent failures

**Issue**:
- Errors not always logged clearly
- Some failures are silent
- Difficult to debug issues

**Solution**: 
- Add comprehensive error logging
- Add error notifications (email/Slack)
- Add retry logic for transient failures
- Add health check endpoints

**Priority**: Medium  
**Effort**: 1 week

**Areas to Improve**:
- OCR processing errors
- CSV update failures
- Git push failures
- Dashboard loading errors

---

### Monitoring/Alerting System

**Current State**: Manual log checking, no alerts

**Issue**:
- Don't know when system fails
- Must manually check logs
- No proactive notifications

**Solution**: 
- Add health check script
- Add monitoring dashboard
- Add alert notifications (email/Slack)
- Track key metrics (processing success rate, data quality)

**Priority**: Low  
**Effort**: 1-2 weeks

**Beginner-Friendly Approach**:
- Start with simple health check script
- Use free services (GitHub Actions status, Vercel analytics)
- Add email notifications for failures
- Gradually add more sophisticated monitoring

---

## Feature Ideas

### Real-Time Notifications

**Idea**: Alert users when gym is getting crowded

**Implementation**:
- Monitor current crowd level
- Compare to historical averages
- Send push notification if above threshold
- Optional: Predict future crowding

**Complexity**: Medium-High  
**Dependencies**: 
- Push notification service (Firebase, OneSignal)
- Real-time data updates (WebSocket or polling)
- User preferences (thresholds, notification times)

**Beginner-Friendly**: Start with simple email notifications, add push later

---

### Predictive Modeling

**Idea**: Use ML to predict future crowd levels

**Implementation**:
- Collect historical data (already have this)
- Train ML model (time series forecasting)
- Predict crowd levels for next few hours
- Display predictions in dashboard

**Complexity**: High  
**Dependencies**:
- ML framework (TensorFlow, PyTorch, or simpler time series)
- Training pipeline
- Model deployment

**Beginner-Friendly**: Start with simple statistical models (moving averages), add ML later

---

### API Development

**Idea**: Create API for third-party integrations

**Implementation**:
- REST API endpoints
- Authentication (API keys)
- Rate limiting
- Documentation (OpenAPI/Swagger)

**Endpoints**:
- `GET /api/data` - Get crowd data
- `GET /api/stats` - Get statistics
- `GET /api/predictions` - Get predictions (future)

**Complexity**: Medium  
**Dependencies**:
- API framework (Next.js API routes or separate service)
- Authentication system
- Rate limiting middleware

**Beginner-Friendly**: Start with simple Next.js API routes, add auth later

---

### PWA Support

**Idea**: Make dashboard work offline

**Implementation**:
- Service worker for offline caching
- Install prompt for mobile
- Offline data access
- Background sync

**Complexity**: Medium  
**Dependencies**:
- Service worker setup
- Cache strategy
- Offline data storage (IndexedDB)

**Beginner-Friendly**: Use Next.js PWA plugin, configure caching strategy

---

### Multi-Gym Support

**Idea**: Track multiple gym locations

**Implementation**:
- Add gym location field to data model
- Filter by location in dashboard
- Separate charts per location
- Location selection UI

**Complexity**: Medium  
**Dependencies**:
- Data model changes (CSV schema or database migration)
- UI updates (location selector)
- Data collection changes (identify location in screenshots)

**Beginner-Friendly**: Start with hardcoded location, add selection later

---

## Performance Improvements

### OCR Processing Speed Optimization

**Current**: Processes images sequentially

**Improvement**: 
- Parallel processing for multiple images
- Batch processing optimization
- Caching of preprocessed images

**Complexity**: Medium  
**Impact**: High (faster processing)

**Beginner-Friendly**: Start with simple parallel processing (Python multiprocessing)

---

### Dashboard Load Time Reduction

**Current**: ~2-3 seconds initial load

**Improvements**:
- Code splitting (lazy load charts)
- CSV compression (gzip)
- Incremental data loading
- Server-side rendering for initial data

**Complexity**: Medium  
**Impact**: Medium (better user experience)

**Beginner-Friendly**: Start with Next.js built-in optimizations, add code splitting later

---

### CSV File Size Management

**Current**: Single CSV file, grows over time

**Improvements**:
- Archive old data (yearly CSV files)
- Compress archived data
- Implement data retention policy
- Consider database migration if >1000 records

**Complexity**: Low-Medium  
**Impact**: Medium (maintains performance)

**Beginner-Friendly**: Start with simple archiving script, add compression later

---

## Beginner-Friendly Next Tasks

### Add Unit Tests for CSV Processor

**Task**: Write tests for `update-csv.js`

**Why**: 
- CSV processor is critical
- Easy to test (pure functions)
- Good learning opportunity

**Steps**:
1. Set up Jest
2. Write test for `loadExtractedData()`
3. Write test for `removeDuplicates()`
4. Write test for `convertToCSVFormat()`
5. Add to CI/CD

**Estimated Time**: 4-6 hours  
**Learning Value**: High (testing fundamentals)

---

### Improve Error Messages in OCR Script

**Task**: Make error messages more helpful

**Why**:
- Current errors can be cryptic
- Better errors = easier debugging
- Good practice for error handling

**Steps**:
1. Review current error messages
2. Add context to error messages
3. Add suggestions for fixes
4. Add logging for debugging

**Estimated Time**: 2-3 hours  
**Learning Value**: Medium (error handling)

---

### Add Loading States to Dashboard Components

**Task**: Show loading indicators during data fetch

**Why**:
- Better user experience
- Clear feedback during operations
- Professional polish

**Steps**:
1. Add loading state to DataLoader
2. Show spinner during fetch
3. Add skeleton screens for charts
4. Handle loading errors gracefully

**Estimated Time**: 3-4 hours  
**Learning Value**: Medium (UX patterns)

---

### Create Admin Panel for Data Verification

**Task**: Simple UI to verify OCR results

**Why**:
- Catch OCR errors early
- Improve data quality
- Learn form handling

**Steps**:
1. Create admin page (password protected)
2. Show recent OCR results
3. Allow manual correction
4. Update CSV with corrections

**Estimated Time**: 1 week  
**Learning Value**: High (full-stack development)

---

## Advanced Future Considerations

### Migration from CSV to Database

**When**: If data grows beyond ~1000 records

**Options**:
- **SQLite**: Simple, file-based, good for local
- **PostgreSQL**: Full-featured, good for cloud
- **Supabase**: Managed PostgreSQL, easy setup

**Migration Path**:
1. Set up database
2. Create migration script (CSV → DB)
3. Update data processors to use DB
4. Keep CSV as backup/export

**Complexity**: High  
**Beginner-Friendly**: Use Supabase (managed, good docs)

---

### Real-Time WebSocket Updates

**Idea**: Push updates to dashboard in real-time

**Implementation**:
- WebSocket server (or Server-Sent Events)
- Client connects to receive updates
- Push new data when available
- Update charts without refresh

**Complexity**: High  
**Dependencies**:
- WebSocket server (Next.js API or separate service)
- Client WebSocket handling
- Connection management

**Beginner-Friendly**: Start with Server-Sent Events (simpler than WebSocket)

---

### User Authentication for Personalization

**Idea**: Allow users to save preferences, favorite times, etc.

**Implementation**:
- Authentication (NextAuth.js)
- User profiles
- Saved preferences
- Personalized recommendations

**Complexity**: High  
**Dependencies**:
- Auth provider (NextAuth.js)
- User database
- Session management

**Beginner-Friendly**: Use NextAuth.js (good docs, many providers)

---

### Mobile App Development

**Idea**: Native iOS/Android app

**Options**:
- **React Native**: Share code with web
- **Flutter**: Cross-platform, good performance
- **Native**: Best performance, more work

**Complexity**: Very High  
**Dependencies**:
- Mobile development setup
- App store accounts
- API for data access

**Beginner-Friendly**: React Native (can reuse React knowledge)

---

## Notes for Future AI Collaboration

### When Adding New Features

1. **Start Small**: MVP first, iterate
2. **Document Decisions**: Why this approach?
3. **Test Thoroughly**: Manual testing minimum
4. **Update Docs**: Keep documentation current
5. **Consider Beginner**: Explain complex parts

### When Fixing Bugs

1. **Reproduce First**: Understand the issue
2. **Find Root Cause**: Don't just patch symptoms
3. **Test Fix**: Verify it works
4. **Check Regressions**: Ensure nothing else broke
5. **Document**: Note the fix and why

### When Refactoring

1. **Understand Current Code**: Read before changing
2. **Make Incremental Changes**: Small steps
3. **Test After Each Step**: Verify still works
4. **Update Tests**: Keep tests current
5. **Update Docs**: Reflect changes in documentation

### When Learning New Technologies

1. **Start with Documentation**: Read official docs
2. **Try Simple Examples**: Get basic working
3. **Apply to Project**: Integrate gradually
4. **Ask Questions**: Don't assume
5. **Document Learnings**: Help future self

---

## Priority Matrix

### High Priority (Do Soon)
- ✅ Documentation consolidation (in progress)
- ⏳ Add unit tests for CSV processor
- ⏳ Improve error messages in OCR script
- ⏳ Add loading states to dashboard

### Medium Priority (Do When Time Permits)
- ⏳ Error handling improvements
- ⏳ OCR processing speed optimization
- ⏳ CSV file size management
- ⏳ Admin panel for data verification

### Low Priority (Nice to Have)
- ⏳ Monitoring/alerting system
- ⏳ Real-time notifications
- ⏳ PWA support
- ⏳ Multi-gym support

### Future Considerations (When Needed)
- ⏳ Database migration
- ⏳ Predictive modeling
- ⏳ API development
- ⏳ Real-time WebSocket updates
- ⏳ User authentication
- ⏳ Mobile app development

---

## Related Documentation

- **[Project Overview](./project_overview.md)**: What this project does
- **[Architecture](./architecture.md)**: System design
- **[Implementation Notes](./implementation_notes.md)**: Technical decisions
- **[AI Context](./ai_context.md)**: How to work with this project
- **[Quick Start](./QUICK_START.md)**: Setup instructions
- **[Troubleshooting](./TROUBLESHOOTING.md)**: Common issues

---

**This document provides a roadmap for future development. Priorities may change based on user needs and project evolution.**
