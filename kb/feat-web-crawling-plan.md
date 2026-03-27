# MUST TO FOLLOW
NEVER ever run and command by your own, take a pause and tell me which commands to run in the terminal

# Web Crawling Feature Implementation Plan

**Feature**: Web Crawling for AI Platforms (ChatGPT, Claude, Gemini, Perplexity)  
**Priority**: HIGHEST  
**Estimated Timeline**: 7-10 days  
**Status**: NOT STARTED  
**Depends On**: Current MVP features (all complete)

---

## 🎯 Overview

### Goal
Enable GenSEO to analyze AI brand visibility through both **API calls** and **web crawling** methods, allowing users to compare results from direct API access versus actual web interface interactions.

### Why This Matters
1. **Real User Experience**: Web crawling shows what actual users see in AI chat interfaces
2. **Citation Accuracy**: Web UIs may display citations differently than APIs
3. **Feature Parity**: Some AI platforms have features only in web UI (e.g., web search in ChatGPT)
4. **Comparison Insights**: Detect discrepancies between API and UI responses
5. **Platform Coverage**: Some platforms may not have APIs (future-proofing)

### Success Criteria
- [ ] Can authenticate and crawl ChatGPT web interface
- [ ] Can authenticate and crawl Claude web interface
- [ ] Users can choose: API only, Crawling only, or Both methods
- [ ] Results show side-by-side comparison when both methods used
- [ ] Web crawling is reliable (>90% success rate)
- [ ] Proper error handling and retries
- [ ] Respects rate limits and anti-bot detection

---

## 📐 Architecture Overview

### High-Level Flow

```
User Submits Analysis
    ↓
User Selects Method: [API | Crawling | Both]
    ↓
Session Created with analysis_method field
    ↓
Orchestrator Routes Based on Method:
    ├─→ API Method: Use existing ai-query.ts
    ├─→ Crawling Method: Use new crawlers
    └─→ Both: Execute both in parallel
    ↓
Store Responses with method tag
    ↓
Display Results:
    - Single method: Show as normal
    - Both methods: Show comparison view
```

### Components to Build

1. **Database Layer** - Schema updates for method tracking
2. **Crawler Utilities** - Shared functions for all crawlers
3. **Platform Crawlers** - ChatGPT, Claude, etc.
4. **Orchestration** - Parallel execution and routing
5. **UI Updates** - Method selection and comparison views
6. **Configuration** - Environment variables and settings

---

## 🗄️ Phase 1: Database Schema Updates

### Objective
Add support for tracking analysis method (API vs Crawling) throughout the system.

### Tasks

#### 1.1 Add Analysis Method Enum
**What**: Create enum type for tracking analysis method
**Why**: Type-safe method tracking at database level

**Implementation Steps**:
1. Create new migration file in `drizzle/` directory
2. Add PostgreSQL enum: `analysis_method`
3. Values: `'api_only'`, `'crawling_only'`, `'both'`
4. Apply migration to database

**Files to Create**:
- `drizzle/XXXX_add_analysis_method.sql`

**Drizzle Schema Update**:
- Update `src/server/db/schema/db.schema.analysis.ts`
- Add `analysisMethodEnum` export
- Add `analysisMethod` field to `analysisSessions` table
- Default value: `'api_only'` (backward compatibility)

#### 1.2 Update Responses Table
**What**: Track which method generated each response
**Why**: Enable filtering and comparison

**Implementation Steps**:
1. Add `analysis_method` field to `responses` table
2. Use same enum as sessions table
3. Default to `'api_only'` for existing data
4. Update schema type exports

**Files to Modify**:
- `src/server/db/schema/db.schema.prompts.ts`

#### 1.3 Add Crawler Credentials Storage (Optional Secure Approach)
**What**: Store encrypted crawler credentials if needed
**Why**: Users may want to use their own ChatGPT/Claude accounts

**Decision Point**: 
- **Option A**: Use system-wide credentials (simpler, less secure)
- **Option B**: Per-user credentials (more complex, more secure)
- **Recommendation**: Start with Option A, migrate to B later

**If Option B chosen**:
- Create `crawler_credentials` table
- Encrypt credentials at rest
- Associate with user_id

#### 1.4 Migration Strategy
**Backward Compatibility**:
- All existing sessions get `analysis_method = 'api_only'`
- All existing responses get `analysis_method = 'api_only'`
- Existing queries work without modification
- No data loss

**Verification**:
- Test migration on local database
- Verify existing sessions still load correctly
- Run type checks to ensure schema types updated

---

## 🛠️ Phase 2: Crawler Utilities Foundation

### Objective
Build shared utilities that all platform crawlers will use.

### Tasks

#### 2.1 Create Crawler Utils Module
**What**: Shared functions for browser automation
**Location**: `src/server/services/crawling-analysis/crawler-utils.ts`

**Functions to Implement**:

1. **`setupBrowser()`**
   - Initialize Playwright browser with stealth mode
   - Configure user agent, viewport, headers
   - Apply anti-detection plugins
   - Return browser instance

2. **`setupStealth(page)`**
   - Apply stealth mode to page
   - Hide automation indicators
   - Randomize behavior patterns
   - Prevent bot detection

3. **`waitForResponse(page, timeout)`**
   - Wait for AI response to complete
   - Detect streaming completion
   - Handle different completion signals
   - Return response element

4. **`extractResponseText(element)`**
   - Extract text from response element
   - Handle markdown formatting
   - Preserve structure (code blocks, lists)
   - Return clean text

5. **`extractCitationsFromDOM(page)`**
   - Parse citations from DOM
   - Extract links, footnotes, references
   - Map to citation format
   - Return structured citations

6. **`handleRateLimit(platform, retryAfter)`**
   - Detect rate limit responses
   - Calculate retry delay
   - Log rate limit events
   - Return retry strategy

7. **`withRetry(fn, maxRetries, backoff)`**
   - Retry failed operations
   - Exponential backoff
   - Log retry attempts
   - Throw after max retries

8. **`cleanupBrowser(browser)`**
   - Close browser gracefully
   - Clean up resources
   - Handle errors during cleanup

**Error Types to Define**:
- `CrawlerAuthError` - Authentication failed
- `CrawlerRateLimitError` - Rate limited
- `CrawlerTimeoutError` - Operation timed out
- `CrawlerParseError` - Failed to parse response

**Configuration Constants**:
```typescript
const CRAWLER_CONFIG = {
  timeout: 60000,              // 60 seconds
  navigationTimeout: 30000,    // 30 seconds
  retryAttempts: 3,
  retryDelay: 5000,           // 5 seconds
  viewport: { width: 1920, height: 1080 },
  userAgent: 'Mozilla/5.0...',
  stealthMode: true,
}
```

#### 2.2 Install Required Dependencies
**What**: Add Playwright and stealth plugins

**Packages to Install**:
```bash
pnpm add playwright
pnpm add playwright-extra
pnpm add puppeteer-extra-plugin-stealth
```

**Post-Install**:
```bash
# Install browser binaries
npx playwright install chromium
```

#### 2.3 Add Environment Variables
**What**: Configure crawler credentials and settings

**Add to `.env`**:
```env
# Web Crawling (Optional - use with caution)
CHATGPT_EMAIL=your-email@example.com
CHATGPT_PASSWORD=your-password

CLAUDE_EMAIL=your-email@example.com
CLAUDE_PASSWORD=your-password

# Crawler Settings
CRAWLER_HEADLESS=true
CRAWLER_TIMEOUT=60000
CRAWLER_MAX_RETRIES=3
```

**Add to `src/env.js`**:
- Add optional validation for crawler credentials
- Make them optional (system can still use API-only mode)
- Add validation for crawler settings

**Security Notes**:
- Document that credentials are stored as plain text in .env
- Recommend using separate accounts for crawling
- Consider encryption at rest in future
- Add warning about account ban risks

---

## 🤖 Phase 3: ChatGPT Web Crawler

### Objective
Implement fully functional ChatGPT web interface crawler.

### Tasks

#### 3.1 Create ChatGPT Crawler Module
**What**: Dedicated crawler for ChatGPT
**Location**: `src/server/services/crawling-analysis/chatgpt-crawler.ts`

**Main Function**: `crawlChatGPT(prompt: string): Promise<CrawlResponse>`

#### 3.2 Authentication Flow
**What**: Log into ChatGPT web interface

**Steps to Implement**:
1. Navigate to `https://chat.openai.com`
2. Check if already authenticated (cookie persistence)
3. If not authenticated:
   - Click "Log in" button
   - Enter email from env
   - Enter password from env
   - Handle 2FA if present (may require manual intervention)
   - Wait for redirect to chat interface
4. Store session cookies for reuse
5. Handle authentication errors gracefully

**Error Handling**:
- Invalid credentials → `CrawlerAuthError`
- 2FA required → Log warning, return error
- Account locked → Log critical, return error
- Network issues → Retry with backoff

**Session Management**:
- Cache authenticated browser context
- Reuse for multiple prompts (efficiency)
- Refresh session if expired
- Clean up after batch completion

#### 3.3 Prompt Submission
**What**: Submit prompt and wait for response

**Steps to Implement**:
1. Locate chat input element (textarea)
2. Clear any existing text
3. Type prompt character by character (human-like)
4. Add random delays between characters (anti-bot)
5. Click send button or press Enter
6. Wait for response to start streaming
7. Wait for response to complete
8. Handle errors (rate limits, timeouts)

**Selectors to Use** (adjust based on actual ChatGPT HTML):
- Input: `textarea[data-id="root"]` (example)
- Send button: `button[data-testid="send-button"]` (example)
- Response container: `.response-container` (example)

**Streaming Detection**:
- Watch for new content being added to DOM
- Detect streaming completion (stop button disappears)
- Timeout if no activity for N seconds

#### 3.4 Response Extraction
**What**: Parse and extract the AI response

**Steps to Implement**:
1. Locate response container element
2. Extract text content
3. Preserve markdown formatting
4. Extract code blocks separately
5. Handle multi-paragraph responses
6. Detect if response was truncated

**Content Parsing**:
- Use `innerText` for plain text
- Parse markdown if present
- Extract structured data (lists, tables)
- Clean up extra whitespace

**Citation Extraction**:
- Look for citation indicators `[1]`, `[2]`, etc.
- Find corresponding URLs in footer
- Extract source titles
- Map citations to our citation format

#### 3.5 Error Handling
**What**: Handle various failure scenarios

**Scenarios to Handle**:
1. **Rate Limit Hit**:
   - Detect "Too many requests" message
   - Extract retry-after time if shown
   - Log rate limit event
   - Throw `CrawlerRateLimitError` with retry delay

2. **Content Policy Violation**:
   - Detect "I can't help with that" responses
   - Log prompt that triggered it
   - Return error with explanation

3. **Network Timeout**:
   - Set overall timeout (60s recommended)
   - Retry up to 3 times with backoff
   - Log timeout events

4. **Unexpected DOM Structure**:
   - Catch element not found errors
   - Log actual HTML for debugging
   - Provide helpful error message

5. **Browser Crash**:
   - Catch Playwright errors
   - Clean up zombie processes
   - Restart browser if needed

#### 3.6 Response Format
**What**: Return consistent data structure

**Type Definition**:
```typescript
interface CrawlResponse {
  success: boolean;
  platform: 'chatgpt';
  responseText: string;
  citations: Citation[];
  metadata: {
    executionTimeMs: number;
    attemptCount: number;
    rateLimited: boolean;
  };
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}
```

#### 3.7 Testing Strategy
**What**: Verify crawler works reliably

**Manual Tests**:
- [ ] Can authenticate successfully
- [ ] Can submit single prompt
- [ ] Can submit multiple prompts in sequence
- [ ] Handles rate limiting gracefully
- [ ] Extracts text correctly
- [ ] Extracts citations correctly
- [ ] Handles errors without crashing

**Edge Cases**:
- [ ] Very long prompts (>1000 chars)
- [ ] Prompts with special characters
- [ ] Prompts that trigger content policy
- [ ] Multiple concurrent sessions
- [ ] Session expiration during use

---

## 🤖 Phase 4: Claude Web Crawler

### Objective
Implement Claude web interface crawler with lessons learned from ChatGPT.

### Tasks

#### 4.1 Create Claude Crawler Module
**What**: Dedicated crawler for Claude
**Location**: `src/server/services/crawling-analysis/claude-crawler.ts`

**Main Function**: `crawlClaude(prompt: string): Promise<CrawlResponse>`

#### 4.2 Implementation Notes
**Similarities to ChatGPT**:
- Authentication flow (email/password)
- Prompt submission process
- Response streaming detection
- Citation extraction
- Error handling patterns

**Differences** (adjust based on actual Claude interface):
- Different base URL: `https://claude.ai`
- Different DOM selectors
- Different authentication flow (may use OAuth)
- Different rate limiting behavior
- Different citation format

**Reuse Common Functions**:
- Use `setupBrowser()` from utils
- Use `withRetry()` for error handling
- Use `extractCitationsFromDOM()` (may need platform-specific logic)

#### 4.3 Claude-Specific Considerations
**Conversation History**:
- Claude may show conversation history
- May need to start new conversation for each prompt
- Handle "New Chat" button click

**Project Selection** (if applicable):
- Claude has "Projects" feature
- May need to select default project
- Handle project creation if needed

**Model Selection**:
- Claude offers different models (Opus, Sonnet)
- May need to select specific model
- Default to Sonnet for cost efficiency

#### 4.4 Testing
Same testing strategy as ChatGPT crawler.

---

## 🔄 Phase 5: Orchestration Updates

### Objective
Update session orchestration to support both API and crawling methods.

### Tasks

#### 5.1 Update Session Orchestration
**What**: Modify main orchestrator to route based on method
**Location**: `src/server/services/session-orchestration.ts`

**Current Flow**:
```
processAnalysisSession() → executePromptsAcrossProviders() → API calls
```

**New Flow**:
```
processAnalysisSession()
  ↓
  Check analysis_method:
  ├─→ 'api_only': executePromptsAcrossProviders() (existing)
  ├─→ 'crawling_only': executePromptsCrawling() (new)
  └─→ 'both': executeBothMethods() (new, parallel)
```

#### 5.2 Create Crawling Execution Function
**What**: New function to execute prompts via crawling
**Function**: `executePromptsCrawling(prompts, config)`

**Implementation Steps**:
1. Initialize browser once (reuse for all prompts)
2. For each platform selected:
   - Authenticate once
   - For each prompt:
     - Submit prompt
     - Wait for response
     - Extract text and citations
     - Store in database with `analysis_method = 'crawling_only'`
     - Add delay between prompts (rate limiting)
   - Close browser
3. Update progress after each prompt
4. Handle errors per-prompt (don't fail entire batch)

**Rate Limiting**:
- Longer delays for crawling (5-10s between prompts)
- Respect platform-specific rate limits
- Monitor for rate limit indicators
- Implement exponential backoff

#### 5.3 Create Dual Method Execution
**What**: Execute both API and crawling in parallel
**Function**: `executeBothMethods(prompts, config)`

**Implementation Steps**:
1. Split execution into two parallel promises:
   - Promise 1: API execution (existing flow)
   - Promise 2: Crawling execution (new flow)
2. Use `Promise.allSettled()` to handle partial failures
3. Store results with appropriate `analysis_method` tag
4. If one method fails, continue with the other
5. Log which method(s) succeeded

**Error Strategy**:
- If API fails, crawling still runs (and vice versa)
- Session marked as "completed" if either succeeds
- Session marked as "partial" if only one succeeds
- Session marked as "failed" if both fail

**Progress Tracking**:
- Total prompts = prompts × providers × methods
- Update progress for each completed prompt/method combo
- UI shows progress bar with current method

#### 5.4 Platform Mapping
**What**: Map provider IDs to crawlers

**Mapping Strategy**:
```typescript
const CRAWLER_MAP = {
  'gpt-4-turbo': crawlChatGPT,
  'claude-3.5-sonnet': crawlClaude,
  'gemini-flash-lite': null, // No crawler yet
  'sonar': null, // No crawler yet
};
```

**Fallback Logic**:
- If crawler not available for provider, skip crawling
- Log warning that provider doesn't support crawling
- Only run API method for that provider

---

## 🎨 Phase 6: UI Updates

### Objective
Allow users to select analysis method and view comparison results.

### Tasks

#### 6.1 Update Search Form
**What**: Add method selection to analysis form
**Location**: `src/app/(dashboard)/dashboard/search/SearchPage.tsx`

**UI Elements to Add**:

1. **Analysis Method Selector**
   - Radio buttons or dropdown
   - Options:
     - "API Only (Fast)" - recommended
     - "Web Crawling (Slower, more accurate)"
     - "Both (Comprehensive comparison)"
   - Default: "API Only"
   - Show info icon with explanation

2. **Method Info Tooltips**:
   - API Only: "Uses official AI APIs. Fast and reliable."
   - Crawling: "Uses web interfaces. Slower but shows real user experience."
   - Both: "Runs both methods and compares results. Takes 2x longer."

3. **Cost/Time Estimates**:
   - Show estimated time per method
   - Show estimated cost (if applicable)
   - Update dynamically based on prompt count

**Form Schema Update**:
- Add `analysisMethod` field to `searchFormSchema`
- Validation: must be one of enum values
- Default to `'api_only'`

#### 6.2 Update Processing Page
**What**: Show method-specific progress
**Location**: `src/app/(dashboard)/dashboard/processing/[sessionId]/ProcessingPage.tsx`

**UI Enhancements**:
1. Show current method being executed
2. If "both" method, show two progress bars:
   - API Method progress
   - Crawling Method progress
3. Show ETA based on method
4. Show platform logo with method badge

**Example UI**:
```
Processing Analysis...

API Method: ████████░░ 80% (4/5 prompts)
Crawling Method: ███░░░░░░░ 30% (1.5/5 prompts)

Estimated time remaining: 3 minutes
```

#### 6.3 Create Method Comparison View
**What**: New component for comparing API vs Crawling results
**Location**: `src/components/analysis/MethodComparison.tsx`

**Features to Show**:

1. **Side-by-Side Metrics**:
   ```
   | Metric              | API Method | Crawling Method | Difference |
   |---------------------|------------|-----------------|------------|
   | Visibility Score    | 75%        | 80%             | +5%        |
   | Total Mentions      | 12         | 15              | +3         |
   | Citation Rate       | 50%        | 60%             | +10%       |
   ```

2. **Response Text Comparison**:
   - Show same prompt with both responses
   - Highlight differences in text
   - Show which brands appeared in which method

3. **Citation Comparison**:
   - Compare citation sources
   - Show citations unique to each method
   - Highlight overlapping citations

4. **Insights Panel**:
   - Auto-generated insights:
     - "Crawling found 3 more mentions than API"
     - "Citations were 20% more detailed in web UI"
     - "API responses were more consistent"

#### 6.4 Update Results Dashboard
**What**: Show method badge on responses
**Location**: `src/app/(dashboard)/dashboard/results/[sessionId]/ResultsPage.tsx`

**UI Changes**:
1. Add badge to each response showing method:
   - Blue badge: "API"
   - Green badge: "Crawling"
2. Add filter to show only one method
3. If both methods used, show "Compare Methods" button
4. Add tab: "Overview" | "API Results" | "Crawling Results" | "Comparison"

---

## 🧪 Phase 7: Testing & Validation

### Objective
Ensure web crawling feature works reliably in all scenarios.

### Tasks

#### 7.1 Unit Tests
**What**: Test individual crawler functions

**Tests to Write**:
- [ ] `setupBrowser()` creates browser successfully
- [ ] `setupStealth()` applies anti-detection
- [ ] `extractResponseText()` parses text correctly
- [ ] `extractCitationsFromDOM()` finds citations
- [ ] `withRetry()` retries on failure
- [ ] Error handling for each error type

**Location**: `src/server/services/crawling-analysis/__tests__/`

#### 7.2 Integration Tests
**What**: Test full crawling flow

**Tests to Run**:
- [ ] Can authenticate to ChatGPT
- [ ] Can submit prompt and get response
- [ ] Can handle multiple prompts in sequence
- [ ] Can run API + Crawling in parallel
- [ ] Database correctly stores method tags
- [ ] Results page displays comparison correctly

**Note**: May require test credentials or mocking

#### 7.3 Error Scenario Tests
**What**: Verify error handling works

**Scenarios to Test**:
- [ ] Invalid credentials
- [ ] Rate limiting
- [ ] Network timeout
- [ ] Browser crash
- [ ] Element not found
- [ ] Session expiration
- [ ] Concurrent session limits

#### 7.4 Performance Tests
**What**: Verify crawling doesn't slow down system

**Metrics to Track**:
- [ ] Time per prompt (API vs Crawling)
- [ ] Memory usage during crawling
- [ ] Browser resource consumption
- [ ] Concurrent session handling
- [ ] Database query performance with method filtering

#### 7.5 User Acceptance Testing
**What**: Test with real users

**Test Scenarios**:
- [ ] User can select method easily
- [ ] Progress updates are clear
- [ ] Results comparison is understandable
- [ ] Error messages are helpful
- [ ] Overall UX is smooth

---

## 🔒 Phase 8: Security & Compliance

### Objective
Ensure crawling feature is secure and compliant.

### Tasks

#### 8.1 Credential Security
**What**: Protect stored credentials

**Security Measures**:
- [ ] Document that .env credentials are plain text
- [ ] Recommend separate accounts for crawling
- [ ] Warn about account ban risks
- [ ] Consider encryption at rest (future enhancement)
- [ ] Never log passwords in console or errors
- [ ] Clear sensitive data from memory after use

#### 8.2 Rate Limiting Compliance
**What**: Respect platform rate limits

**Implementation**:
- [ ] Add delays between requests (5-10s minimum)
- [ ] Detect rate limit responses
- [ ] Implement exponential backoff
- [ ] Log rate limit events for monitoring
- [ ] Allow users to configure delay
- [ ] Stop if repeatedly rate limited

#### 8.3 Terms of Service Considerations
**What**: Stay compliant with platform ToS

**Important Notes**:
- Document that web scraping may violate ToS
- Recommend API-first approach
- Use crawling sparingly and responsibly
- Consider adding disclaimer in UI
- Monitor for breaking changes in web UIs

#### 8.4 Anti-Bot Detection Mitigation
**What**: Avoid being detected as bot

**Techniques**:
- [ ] Use stealth mode plugins
- [ ] Randomize typing speed
- [ ] Add human-like delays
- [ ] Rotate user agents
- [ ] Mimic human behavior patterns
- [ ] Don't submit too many requests too fast

#### 8.5 Data Privacy
**What**: Handle user data responsibly

**Considerations**:
- User credentials stored securely
- No logging of sensitive data
- Clear data retention policies
- Option to delete stored credentials

---

## 📝 Phase 9: Documentation

### Objective
Document web crawling feature for developers and users.

### Tasks

#### 9.1 Developer Documentation
**What**: Help developers understand and maintain code

**Documents to Create/Update**:

1. **`docs/web-crawling.md`**:
   - Architecture overview
   - How crawlers work
   - How to add new platform crawler
   - Troubleshooting guide
   - Known limitations

2. **`README.md` updates**:
   - Add web crawling to features list
   - Update environment variables section
   - Add crawler setup instructions
   - Note Playwright installation requirements

3. **Code comments**:
   - Add JSDoc to all exported functions
   - Explain complex logic
   - Document error codes
   - Add usage examples

#### 9.2 User Documentation
**What**: Help users understand and use feature

**Documents to Create**:

1. **User Guide**:
   - What is web crawling?
   - When to use API vs Crawling vs Both?
   - How to interpret comparison results
   - Troubleshooting common issues

2. **FAQ**:
   - Why is crawling slower?
   - Is web crawling against ToS?
   - How accurate is crawling?
   - What if crawling fails?

#### 9.3 API Documentation
**What**: Document new tRPC procedures

**Updates Needed**:
- Document `analysisMethod` field
- Document comparison endpoint (if added)
- Update examples with method selection
- Document error codes

---

## 🚀 Phase 10: Deployment

### Objective
Deploy web crawling feature to production.

### Tasks

#### 10.1 Pre-Deployment Checklist
**What**: Verify everything is ready

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Database migration tested
- [ ] Environment variables documented
- [ ] Playwright binaries installed on server
- [ ] Performance acceptable
- [ ] Error handling comprehensive
- [ ] Security review completed

#### 10.2 Deployment Strategy
**What**: Roll out safely

**Recommended Approach**:
1. **Feature Flag** (Optional):
   - Add feature flag to enable/disable crawling
   - Start with disabled
   - Enable for internal testing
   - Enable for beta users
   - Full rollout

2. **Phased Rollout**:
   - Deploy database changes first
   - Deploy backend code
   - Deploy frontend code
   - Monitor for errors
   - Full enable

3. **Monitoring**:
   - Track crawler success rate
   - Monitor error rates
   - Watch for rate limiting
   - Check performance metrics

#### 10.3 Post-Deployment
**What**: Monitor and iterate

**Day 1-3**:
- [ ] Monitor error logs
- [ ] Check success rates
- [ ] Gather user feedback
- [ ] Fix critical bugs

**Week 1-2**:
- [ ] Optimize performance
- [ ] Tune rate limits
- [ ] Improve error messages
- [ ] Add missing features

**Month 1**:
- [ ] Analyze usage patterns
- [ ] Plan next enhancements
- [ ] Update documentation
- [ ] Consider additional platforms

---

## 🎯 Success Metrics

### Technical Metrics
- **Crawler Success Rate**: >90% of crawl attempts succeed
- **Response Accuracy**: >95% accurate text extraction
- **Citation Accuracy**: >90% citations correctly extracted
- **Performance**: Crawling adds <2x time vs API only
- **Error Rate**: <5% of sessions fail due to crawling errors

### Business Metrics
- **Adoption**: >30% of users try crawling method
- **Retention**: Users who use "both" method return more often
- **Insights Value**: Comparison reveals meaningful differences
- **Support Tickets**: <5% increase due to crawling issues

### User Experience Metrics
- **Clarity**: Users understand which method to choose
- **Trust**: Users trust comparison results
- **Satisfaction**: High ratings for feature
- **Reliability**: Users don't report frequent failures

---

## 🚧 Known Limitations & Future Enhancements

### Current Limitations
1. **Manual Credentials**: Requires system-wide credentials (not per-user)
2. **Limited Platforms**: Only ChatGPT and Claude initially
3. **No 2FA Support**: Cannot handle 2FA automatically
4. **Slower**: Crawling is 2-5x slower than API
5. **Less Reliable**: Subject to web UI changes
6. **Rate Limits**: More aggressive than API rate limits
7. **No Parallel**: Must crawl sequentially per platform
8. **Session Limits**: May hit concurrent session limits

### Future Enhancements
1. **Additional Platforms**:
   - Gemini crawler
   - Perplexity crawler
   - Bing Chat crawler

2. **Advanced Features**:
   - Screenshot capture for visual comparison
   - Response formatting comparison
   - Chat history analysis
   - Multi-turn conversation support

3. **Performance**:
   - Parallel browser contexts
   - Browser pooling for reuse
   - Smarter rate limit detection
   - Response caching

4. **Security**:
   - Per-user credential encryption
   - OAuth integration where available
   - Session token management
   - Better credential storage

5. **Reliability**:
   - Automated selector updates
   - Self-healing selectors
   - Better error recovery
   - Fallback strategies

---

## 🔄 Rollback Plan

### If Feature Causes Issues

**Immediate Actions**:
1. Disable crawling via feature flag
2. Roll back to API-only mode
3. Investigate issues
4. Fix in development
5. Re-deploy when stable

**Database Rollback**:
- No need to roll back schema changes
- Default `analysis_method = 'api_only'` ensures backward compatibility
- Existing sessions continue working

**User Impact**:
- Users with "both" or "crawling_only" sessions:
  - Show error message
  - Offer to re-run with API only
  - Refund credits if applicable

---

## 📋 Implementation Checklist

### Phase 1: Database ✅
- [ ] Create migration for `analysis_method` enum
- [ ] Update `analysisSessions` schema
- [ ] Update `responses` schema
- [ ] Run migration locally
- [ ] Test backward compatibility

### Phase 2: Utilities ✅
- [ ] Install Playwright dependencies
- [ ] Create `crawler-utils.ts`
- [ ] Implement `setupBrowser()`
- [ ] Implement `setupStealth()`
- [ ] Implement `waitForResponse()`
- [ ] Implement `extractResponseText()`
- [ ] Implement `extractCitationsFromDOM()`
- [ ] Implement `withRetry()`
- [ ] Add environment variables
- [ ] Test utilities

### Phase 3: ChatGPT Crawler ✅
- [ ] Create `chatgpt-crawler.ts`
- [ ] Implement authentication
- [ ] Implement prompt submission
- [ ] Implement response extraction
- [ ] Implement citation extraction
- [ ] Add error handling
- [ ] Test with real prompts
- [ ] Verify rate limiting

### Phase 4: Claude Crawler ✅
- [ ] Create `claude-crawler.ts`
- [ ] Implement authentication
- [ ] Implement prompt submission
- [ ] Implement response extraction
- [ ] Add error handling
- [ ] Test with real prompts

### Phase 5: Orchestration ✅
- [ ] Update `session-orchestration.ts`
- [ ] Create `executePromptsCrawling()`
- [ ] Create `executeBothMethods()`
- [ ] Implement platform-to-crawler mapping
- [ ] Update progress tracking
- [ ] Test API + Crawling parallel execution

### Phase 6: UI Updates ✅
- [ ] Update `searchFormSchema` with `analysisMethod`
- [ ] Add method selector to search form
- [ ] Add tooltips explaining each method
- [ ] Update processing page for dual progress
- [ ] Create `MethodComparison.tsx` component
- [ ] Update results page with method badges
- [ ] Add method filter
- [ ] Test UI flow end-to-end

### Phase 7: Testing ✅
- [ ] Write unit tests for crawler utils
- [ ] Write integration tests for ChatGPT crawler
- [ ] Write integration tests for Claude crawler
- [ ] Test error scenarios
- [ ] Test performance and resource usage
- [ ] Conduct user acceptance testing

### Phase 8: Security ✅
- [ ] Review credential storage
- [ ] Implement rate limiting compliance
- [ ] Add anti-bot detection mitigation
- [ ] Document ToS considerations
- [ ] Add security warnings in UI

### Phase 9: Documentation ✅
- [ ] Create `docs/web-crawling.md`
- [ ] Update `README.md`
- [ ] Add JSDoc comments
- [ ] Create user guide
- [ ] Create FAQ
- [ ] Update API documentation

### Phase 10: Deployment ✅
- [ ] Run pre-deployment checklist
- [ ] Deploy database migration
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Monitor initial rollout
- [ ] Gather feedback and iterate

---

## 🎬 Getting Started Guide for Implementation Agent

### Step 1: Understand Current State
Before coding, review:
1. `kb/project-info.md` - Understand current architecture
2. `kb/current-status.md` - Know what's already done
3. Current database schema in `src/server/db/schema/`
4. Current orchestration in `src/server/services/session-orchestration.ts`
5. Current AI query logic in `src/server/services/ai-query.ts`

### Step 2: Set Up Development Environment
1. Ensure PostgreSQL is running
2. Install Playwright: `pnpm add playwright playwright-extra puppeteer-extra-plugin-stealth`
3. Install browser binaries: `npx playwright install chromium`
4. Add crawler credentials to `.env` (use test accounts)
5. Test that browser launches: Create simple test script

### Step 3: Start with Database (Easiest Win)
1. Create migration file in `drizzle/` directory
2. Add `analysis_method` enum
3. Update schema files in `src/server/db/schema/`
4. Run `pnpm db:push` to apply changes
5. Verify in Drizzle Studio that schema updated
6. Test that existing sessions still load

### Step 4: Build Crawler Utilities (Foundation)
1. Create directory: `src/server/services/crawling-analysis/`
2. Create `crawler-utils.ts` with browser setup functions
3. Test each utility function independently
4. Start with `setupBrowser()` and verify it launches
5. Add stealth mode and test anti-detection works
6. Build up remaining utilities incrementally

### Step 5: Implement ChatGPT Crawler (Core Feature)
1. Create `chatgpt-crawler.ts`
2. Start with manual authentication test (open browser, log in)
3. Identify correct DOM selectors (inspect ChatGPT UI)
4. Implement authentication function
5. Test authentication multiple times
6. Implement prompt submission
7. Test with single prompt
8. Implement response extraction
9. Test with various prompt types
10. Add error handling
11. Test error scenarios

### Step 6: Implement Claude Crawler (Extension)
1. Follow same process as ChatGPT
2. Reuse utilities from `crawler-utils.ts`
3. Focus on platform-specific differences
4. Test thoroughly

### Step 7: Update Orchestration (Integration)
1. Add method routing logic to `session-orchestration.ts`
2. Create new execution functions for crawling
3. Test API-only mode still works (no regression)
4. Test crawling-only mode works
5. Test both methods in parallel
6. Verify database stores method tags correctly

### Step 8: Update UI (User-Facing)
1. Update Zod schema for method field
2. Add method selector to search form
3. Test form submission with each method
4. Update processing page to show method
5. Create comparison component (start simple)
6. Test results display for each method
7. Polish and refine based on testing

### Step 9: Test Everything (Validation)
1. Run through complete user flow for each method
2. Test error scenarios (wrong credentials, rate limits, etc.)
3. Test with multiple prompts and providers
4. Verify no regressions in existing features
5. Check performance (memory usage, timing)
6. Get feedback from team

### Step 10: Document and Deploy (Finish)
1. Add code comments
2. Update README
3. Create deployment checklist
4. Deploy to staging first
5. Test on staging
6. Deploy to production
7. Monitor for issues

---

## 🎓 Key Principles for Implementation

### 1. Incremental Development
- Build one piece at a time
- Test each piece before moving on
- Don't try to build everything at once
- Commit working code frequently

### 2. Backward Compatibility First
- Never break existing API-only functionality
- All changes should be additive
- Default to API-only mode
- Test that old sessions still work

### 3. Error Handling is Critical
- Crawlers will fail - that's normal
- Always have fallbacks
- Log errors for debugging
- Show helpful error messages to users
- Don't crash the entire analysis if one crawler fails

### 4. Start Simple, Iterate
- MVP: Just get ChatGPT crawler working
- Then add Claude
- Then add comparison view
- Then add advanced features
- Polish comes last

### 5. Test with Real Data
- Use actual ChatGPT/Claude accounts
- Test with real prompts from your domain
- Don't rely on mocks alone
- Verify citations extract correctly

### 6. Performance Matters
- Crawling is slow - that's expected
- But don't make it slower than necessary
- Reuse browser contexts
- Don't block API execution while crawling
- Show progress to users

### 7. Security is Non-Negotiable
- Never log passwords
- Store credentials securely
- Respect rate limits
- Add warnings about ToS
- Consider per-user credentials (future)

---

## 🐛 Common Pitfalls to Avoid

### 1. Selector Breakage
**Problem**: ChatGPT/Claude change their HTML frequently
**Solution**: 
- Use flexible selectors (not too specific)
- Have fallback selectors
- Add logging when selectors fail
- Consider using `data-testid` attributes if available
- Plan for selector updates

### 2. Rate Limiting
**Problem**: Too many requests = account banned
**Solution**:
- Add delays between requests (5-10s minimum)
- Detect rate limit responses early
- Implement exponential backoff
- Monitor rate limit events
- Consider request pooling

### 3. Memory Leaks
**Problem**: Browsers consume lots of memory
**Solution**:
- Always close browsers in `finally` blocks
- Don't keep contexts open longer than needed
- Limit concurrent browsers
- Monitor memory usage
- Implement cleanup on error

### 4. Authentication Failures
**Problem**: Login flow breaks or credentials expire
**Solution**:
- Verify credentials before starting batch
- Handle 2FA gracefully (may require manual intervention)
- Refresh sessions if expired
- Log authentication errors clearly
- Provide helpful error messages

### 5. Streaming Detection
**Problem**: Don't know when response is complete
**Solution**:
- Watch for DOM changes
- Look for "stop" button disappearing
- Set reasonable timeout (60s)
- Check for completion indicators
- Test with various prompt lengths

### 6. Citation Parsing
**Problem**: Citations formatted differently than expected
**Solution**:
- Support multiple citation formats
- Parse DOM structure, not just text
- Handle missing citations gracefully
- Test with prompts that trigger citations
- Log unparseable citation formats

### 7. Concurrent Sessions
**Problem**: Platform limits concurrent sessions
**Solution**:
- Reuse browser contexts when possible
- Queue requests if limit hit
- Log concurrent session errors
- Implement session pooling
- Consider sequential execution per platform
