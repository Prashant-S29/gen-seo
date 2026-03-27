# Gen-SEO Development Timeline

## Overview

This timeline is structured for continuous development with backward compatibility at each stage. Each milestone builds on the previous one without breaking existing functionality.

---

## POC (Proof of Concept) - Week 1-2

**Goal:** Validate core concept with minimal viable features. Prove that we can track AI visibility using API method.

### Milestone 1.1: Foundation Setup (Days 1-2)

**Deliverables:**
- Next.js project initialization with T3 stack
- Database setup (PostgreSQL + Drizzle)
- Basic authentication (Better Auth)
- Landing page + Login/Signup

**Database Tables (Initial):**

```
✓ users
✓ analysis_sessions (basic fields only)
✓ prompts
✓ responses
```

**Success Criteria:**
- User can sign up and log in
- Database connected and migrations running
- Basic routing works

---

### Milestone 1.2: Simple Search Interface (Days 3-4)

**Deliverables:**
- Basic search page at `/search`
- Simple form with:
- Product name input (text field)
- Primary brand input (text field)
- 2-3 competitor inputs (text fields)
- Category selection (dropdown with 5-10 predefined options)
- Form validation with Zod

**No Product Enrichment Yet:**
- User manually enters all data
- No URL lookup
- No tag generation
- No auto-suggestions

**Success Criteria:**
- User can submit form
- Data saves to `analysis_sessions` table
- Redirects to processing page

---

### Milestone 1.3: API Analysis Engine - OpenAI Only (Days 5-7)

**Deliverables:**
- Single AI provider integration (OpenAI via Vercel AI SDK)
- Template-based prompt generation (5 fixed prompts)
- Basic response storage
- Simple mention extraction (regex-based)

**Implementation:**

```
Services:
✓ prompt-generation.ts (template-based only)
✓ api-analysis/openai-query.ts
✓ response-parsing.ts (basic regex)
✓ session-orchestration.ts (simple sequential)
```

**tRPC Procedures:**

```
✓ analysis.start (OpenAI only)
✓ analysis.getProgress
✓ analysis.getResults (basic)
```

**Database Updates:**

```
✓ Add mentions table
✓ Add basic indexes
```

**Success Criteria:**
- System generates 5 prompts for given category
- Queries OpenAI API successfully
- Stores responses in database
- Extracts brand mentions
- Shows basic results

---

### Milestone 1.4: Basic Results Dashboard (Days 8-10)

**Deliverables:**
- Simple results page showing:
- Total prompts executed
- Number of times primary brand mentioned
- List of prompts with mention status (✓/✗)
- Raw AI responses (expandable)
- Basic loading state during processing
- Progress indicator (X/5 prompts completed)

**Components:**

```
✓ Dashboard.tsx (basic layout)
✓ MetricsCards.tsx (simple stats)
✓ PromptsList.tsx (basic list)
```

**Success Criteria:**
- User sees real-time progress
- Results display after completion
- Can view individual responses

---

### POC Milestone Complete ✓

**What We Have:**
- Working auth system
- Manual product entry
- OpenAI API integration
- 5 template prompts
- Basic mention tracking
- Simple dashboard

**What Works:**
- User can analyze 1 product
- Get basic visibility data
- See where brand was mentioned

**Ready for Internal Testing**

---

## MVP (Minimum Viable Product) - Week 3-6

**Goal:** Production-ready core features with multiple AI platforms and better UX.

### Milestone 2.1: Multi-Platform API Support (Days 11-13)

**Deliverables:**
- Add Claude, Gemini, Perplexity integrations
- Parallel execution across platforms
- Platform-specific result tracking
- Rate limiting with Upstash

**Implementation:**

```
New Services:
✓ api-analysis/claude-query.ts
✓ api-analysis/gemini-query.ts
✓ api-analysis/perplexity-query.ts
✓ rate-limiting.ts
```

**Database Updates:**

```
✓ Add platform field to responses
✓ Add execution_time_ms field
✓ Add platform-specific indexes
```

**Backward Compatibility:**
- Existing OpenAI responses remain unchanged
- Old sessions still viewable
- New sessions use all 4 platforms
- Can filter results by platform

**Success Criteria:**
- All 4 platforms working
- Parallel execution (faster)
- Rate limiting prevents API errors
- Results show platform breakdown

---

### Milestone 2.2: Enhanced Prompt Generation (Days 14-16)

**Deliverables:**
- Increase to 10-15 prompts per analysis
- Category-specific prompt templates
- Query variations (comparison, recommendation, feature-based)
- Prompt type classification

**Implementation:**

```
Updates:
✓ prompt-generation.ts (expanded templates)
✓ Add prompt_type enum to prompts table
✓ Different templates for different intents
```

**Prompt Types:**
- Recommendation (“What’s the best…”)
- Comparison (“Compare X vs Y”)
- Feature-based (“X with feature Y”)
- Use-case (“X for use case Y”)
- Price (“Most affordable X”)

**Backward Compatibility:**
- Old sessions with 5 prompts remain visible
- New analyses use 10-15 prompts
- Results UI adapts to any prompt count

**Success Criteria:**
- More comprehensive coverage
- Different prompt types tracked
- Better visibility detection

---

### Milestone 2.3: Advanced Metrics & Analytics (Days 17-19)

**Deliverables:**
- Visibility score calculation (% of prompts with mention)
- Average position tracking
- Citation detection and storage
- Citation share calculation
- Sentiment analysis (positive/neutral/negative)

**Implementation:**

```
New Tables:
✓ citations
✓ Add sentiment field to mentions
✓ Add is_cited field to mentions

New Services:
✓ metrics-calculation.ts (all functions)

New tRPC Router:
✓ metrics.ts (visibility, citation share, leaderboard)
```

**New Metrics:**
- Visibility Score: (mentions / total prompts) × 100
- Average Position: Mean position across mentions
- Citation Share: % of total citations
- Sentiment Score: Positive/neutral/negative ratio

**Backward Compatibility:**
- Calculate metrics for old sessions retroactively
- Missing data shows as “N/A” or “Not tracked”
- New sessions have full metrics

**Success Criteria:**
- Dashboard shows all metrics
- Competitive leaderboard works
- Citation tracking functional
- Sentiment analysis accurate

---

### Milestone 2.4: Product Enrichment System (Days 20-23)

**Deliverables:**
- URL-based product lookup
- Product name-based search
- Auto-generate category tags
- Competitor suggestions
- Tag editing interface

**Implementation:**

```
New Service:
✓ product-enrichment.ts

New tRPC Router:
✓ products.ts

Database Updates:
✓ Add product_url to analysis_sessions
✓ Add category_tags array field
```

**Enrichment Sources:**
- Primary: Clearbit API
- Fallback: AI-based enrichment (GPT-4)
- Manual: User can override everything

**UI Flow:**

```
1. User enters URL or product name
2. System fetches info (shows loading)
3. Pre-populates form with:
   - Product name
   - Suggested tags (editable)
   - Competitor list (editable)
4. User reviews and edits
5. Submits for analysis
```

**Backward Compatibility:**
- Old sessions without enrichment still work
- Search page shows both manual and enriched flow
- Can skip enrichment and enter manually

**Success Criteria:**
- URL lookup works 80%+ of the time
- Product name lookup works 60%+ of the time
- Generated tags are relevant
- User can edit all suggestions

---

### Milestone 2.5: Enhanced Results Dashboard (Days 24-27)

**Deliverables:**
- Professional UI with charts (Recharts)
- Platform comparison view
- Detailed prompt cards with expandable responses
- Filtering and sorting
- Export functionality (CSV)

**Components:**

```
Enhanced:
✓ Dashboard.tsx (with tabs and sections)
✓ MetricsCards.tsx (styled with icons)
✓ Leaderboard.tsx (sortable table)
✓ PromptsList.tsx (filters, search)
✓ VisibilityChart.tsx (bar chart)
✓ CitationShareChart.tsx (pie chart)
✓ PlatformComparison.tsx (comparison view)
```

**Features:**
- Tab navigation (Overview, Platforms, Prompts, Citations)
- Filters: By platform, by mention status, by prompt type
- Sort: By position, by platform, by date
- Search: Find specific prompts
- Export: Download results as CSV

**Backward Compatibility:**
- Old sessions render with new dashboard
- Missing data shows gracefully
- Works with any number of prompts/platforms

**Success Criteria:**
- Professional, polished UI
- Easy to understand insights
- Fast filtering and sorting
- Export works correctly

---

### MVP Milestone Complete ✓

**What We Have:**
- 4 AI platforms (OpenAI, Claude, Gemini, Perplexity)
- 10-15 diverse prompts per analysis
- Product enrichment from URL/name
- Full metrics (visibility, citations, sentiment)
- Professional dashboard with charts
- Export functionality

**What Works:**
- Complete competitive analysis
- Multi-platform comparison
- Actionable insights
- User-friendly interface

**Ready for Beta Testing**

---

## Full Launch - Week 7-12

**Goal:** Web crawling, advanced features, production optimizations, and scaling.

### Milestone 3.1: Web Crawling Foundation (Days 28-32)

**Deliverables:**
- Playwright setup with stealth mode
- ChatGPT web crawler (authentication + prompting)
- Basic DOM parsing for responses
- Error handling and retries

**Implementation:**

```
New Services:
✓ crawling-analysis/chatgpt-crawler.ts
✓ crawling-analysis/crawler-utils.ts

Database Updates:
✓ Add analysis_method enum to analysis_sessions
✓ Add analysis_method field to responses
✓ Separate crawling credentials storage
```

**Environment Variables:**

```
+ CHATGPT_EMAIL
+ CHATGPT_PASSWORD
```

**New Analysis Method Field:**
- `api_only` (existing default)
- `crawling_only` (new)
- `both` (new)

**Backward Compatibility:**
- All existing sessions are `api_only`
- API analysis still works exactly the same
- New “Analysis Method” selector on search page
- Results show method badge per response

**Success Criteria:**
- Can authenticate to ChatGPT
- Submit prompt via web UI
- Extract response text
- Parse DOM for mentions
- Handle errors gracefully

---

### Milestone 3.2: Claude Web Crawler (Days 33-35)

**Deliverables:**
- Claude web UI crawler
- Platform-agnostic crawler utilities
- Unified crawling interface

**Implementation:**

```
New Service:
✓ crawling-analysis/claude-crawler.ts

Refactor:
✓ crawler-utils.ts (shared functions)
✓ Abstract common patterns
```

**Shared Utilities:**
- `setupStealth()` - Anti-bot detection
- `waitForResponse()` - Response completion detection
- `extractCitationsFromDOM()` - Citation parsing
- `withRateLimit()` - Rate limiting wrapper

**Backward Compatibility:**
- API analysis unaffected
- ChatGPT crawling continues working
- Users choose which method per analysis

**Success Criteria:**
- Claude crawler works reliably
- Code reuse between crawlers
- Both crawlers stable

---

### Milestone 3.3: Dual Method Analysis (Days 36-38)

**Deliverables:**
- Run API + Crawling in parallel
- Method comparison logic
- Side-by-side results view
- Insights generation

**Implementation:**

```
Updates:
✓ session-orchestration.ts (parallel execution)
✓ processBothMethods() function

New tRPC Procedures:
✓ metrics.compareMethod
✓ metrics.getVisibilityBreakdown

New Components:
✓ MethodComparison.tsx
✓ DifferenceAnalysis.tsx
```

**Features:**
- Select “Analyze Both” (default)
- System runs both methods simultaneously
- Results show:
- API results
- Crawling results
- Differences highlighted
- Insights (“API shows more citations”, etc.)

**Backward Compatibility:**
- Existing single-method analyses still viewable
- Can view old sessions without comparison
- New sessions can choose any method
- Results adapt based on available data

**Success Criteria:**
- Parallel execution works
- Both methods complete successfully
- Comparison metrics accurate
- Insights are helpful

---

### Milestone 3.4: Citation Deep Analysis (Days 39-42)

**Deliverables:**
- Citation type classification (inline/footnote/reference)
- Domain authority estimation
- Citation quality scoring
- Top cited pages analysis
- Source tier classification

**Implementation:**

```
Database Updates:
✓ Add citation_type to citations table
✓ Add domain_authority field
✓ Add quality_score field

New Service Functions:
✓ classifyCitationType()
✓ estimateDomainAuthority()
✓ scoreCitationQuality()
✓ analyzeTopCitedPages()
```

**New Metrics:**
- Citation quality distribution
- High-authority citation share
- Most cited domains
- Citation type breakdown

**UI Additions:**
- Citations tab in dashboard
- Domain authority badges
- Citation quality indicators
- Top pages leaderboard

**Backward Compatibility:**
- Old citations get default values
- Can retroactively analyze (background job)
- Missing data shows gracefully

**Success Criteria:**
- Citation types detected correctly
- Domain authority estimates reasonable
- Quality scores helpful
- Top pages insights actionable

---

### Milestone 3.5: AI-Powered Prompt Generation (Days 43-45)

**Deliverables:**
- Use AI to generate contextual prompts
- Query fan-out method (Google-style)
- Intent clustering
- Prompt quality scoring

**Implementation:**

```
Updates:
✓ prompt-generation.ts
✓ generatePromptsWithAI() function
✓ generateFanOutPrompts() function
```

**AI Prompt Generation:**
- Use GPT-4 to generate 20+ related queries
- Cover different intents (buy, compare, learn)
- Include long-tail variations
- Cluster by similarity

**User Option:**
- Toggle: “Use AI-generated prompts” (optional)
- Default: Template-based (faster, cheaper)
- Advanced: AI-generated (more comprehensive)

**Backward Compatibility:**
- Template prompts still default
- Users opt-in to AI generation
- Works with any analysis method
- Existing sessions use template prompts

**Success Criteria:**
- AI generates relevant prompts
- Better coverage than templates
- Prompts diverse and natural
- No duplicate or low-quality prompts

---

### Milestone 3.6: Session Management & History (Days 46-48)

**Deliverables:**
- Sessions list page (`/dashboard`)
- Session filtering and search
- Session comparison
- Session sharing (public links)
- Session archiving

**Implementation:**

```
New Pages:
✓ /dashboard (sessions list)
✓ /dashboard/[sessionId] (existing results)
✓ /share/[sessionId] (public view)

Database Updates:
✓ Add is_public to analysis_sessions
✓ Add archived_at timestamp
✓ Add share_token for public links

New tRPC Procedures:
✓ analysis.listSessions
✓ analysis.archiveSession
✓ analysis.shareSession
✓ analysis.getPublicSession
```

**Features:**
- View all past analyses
- Filter by date, product, status
- Compare two sessions side-by-side
- Generate shareable public link
- Archive old sessions

**Backward Compatibility:**
- All existing sessions appear in list
- Old sessions fully functional
- No migration needed

**Success Criteria:**
- Fast session loading
- Filters work correctly
- Sharing secure
- Comparison useful

---

### Milestone 3.7: Performance Optimization (Days 49-51)

**Deliverables:**
- Database query optimization
- Response caching (Upstash)
- Background job processing
- Pagination for large datasets
- Edge runtime for API routes

**Implementation:**

```
Optimizations:
✓ Add database indexes
✓ Implement Redis caching
✓ Paginate prompts list
✓ Lazy load response details
✓ Optimize tRPC queries

Caching Strategy:
✓ Cache product enrichment results (24h)
✓ Cache AI responses for duplicate prompts (7d)
✓ Cache calculated metrics (1h)
```

**Database Indexes:**

```sql
CREATE INDEX idx_sessions_user_created ON analysis_sessions(user_id, created_at DESC);
CREATE INDEX idx_responses_prompt ON responses(prompt_id);
CREATE INDEX idx_mentions_response ON mentions(response_id);
CREATE INDEX idx_citations_mention ON citations(mention_id);
```

**Backward Compatibility:**
- All existing queries faster
- No breaking changes
- Transparent to users

**Success Criteria:**
- Dashboard loads < 2s
- Large sessions (50+ prompts) performant
- No timeout errors
- Smooth scrolling and filtering

---

### Milestone 3.8: Advanced Analytics & Insights (Days 52-55)

**Deliverables:**
- Trend analysis over time
- Competitive intelligence insights
- AI-generated recommendations
- Visibility change tracking
- Opportunity detection

**Implementation:**

```
New Services:
✓ analytics/trend-analysis.ts
✓ analytics/insights-generation.ts
✓ analytics/opportunity-detection.ts

New Tables:
✓ visibility_snapshots (time-series data)
✓ insights (generated recommendations)

New tRPC Router:
✓ analytics.ts
```

**New Features:**
- Track same product over time
- “Your visibility increased 15% vs last month”
- “Competitors mentioned 3x more on Claude”
- “Opportunity: Not mentioned in price comparisons”
- AI-generated action items

**UI Components:**

```
New:
✓ TrendChart.tsx (time-series)
✓ InsightsList.tsx (recommendations)
✓ OpportunitiesPanel.tsx (gaps)
```

**Backward Compatibility:**
- Works with any session
- Historical data from existing sessions
- Insights optional enhancement

**Success Criteria:**
- Trends accurate
- Insights actionable
- Opportunities relevant
- Users understand recommendations

---

### Milestone 3.9: Production Hardening (Days 56-58)

**Deliverables:**
- Comprehensive error handling
- Logging and monitoring (Sentry optional)
- Rate limiting per user
- Usage quotas and limits
- Graceful degradation

**Implementation:**

```
New Services:
✓ error-handling.ts
✓ monitoring.ts

Updates:
✓ Add user quotas to database
✓ Implement usage tracking
✓ Add error boundaries
✓ Retry logic for all external calls
```

**Error Handling:**
- API failures → Retry 3x, then show partial results
- Crawling failures → Fall back to API
- Database errors → Show cached data
- Rate limits → Queue for later

**User Quotas:**
- Free tier: 10 analyses/month
- Pro tier: 100 analyses/month
- Rate limit: 5 concurrent analyses

**Backward Compatibility:**
- Existing users get quotas retroactively
- Old sessions don’t count against quota
- No feature removal

**Success Criteria:**
- No unhandled errors
- Clear error messages
- System recovers gracefully
- Users not blocked unnecessarily

---

### Milestone 3.10: Documentation & Polish (Days 59-60)

**Deliverables:**
- User documentation
- API documentation
- Help tooltips throughout UI
- Onboarding tour
- Example analyses

**Implementation:**

```
New Pages:
✓ /docs (user guide)
✓ /api-docs (for future API access)
✓ /examples (sample analyses)

New Components:
✓ HelpTooltip.tsx
✓ OnboardingTour.tsx
✓ EmptyState.tsx (helpful messages)
```

**Documentation:**
- “How it works” explainer
- Interpreting results guide
- Best practices for analysis
- FAQ section
- Video tutorials (optional)

**Backward Compatibility:**
- All existing features enhanced
- No breaking changes

**Success Criteria:**
- Users understand all features
- Self-service support
- Low support tickets
- High user satisfaction

---

## Full Launch Milestone Complete ✓

**What We Have:**
- Complete dual-method analysis (API + Crawling)
- 4 AI platforms + web UI crawling
- Advanced metrics and insights
- Citation deep analysis
- AI-powered prompt generation
- Session management and history
- Performance optimized
- Production-ready
- Well documented

**Ready for Public Launch**

---

## Post-Launch Enhancements (Week 13+)

### Phase 4.1: Advanced Features

**Potential Additions:**
- Email reports (Resend integration)
- Scheduled monitoring (re-run analyses weekly)
- Slack/Discord notifications
- Custom prompt templates
- Team collaboration features
- White-label reports
- API access for enterprise

### Phase 4.2: Scaling & Enterprise

**Enhancements:**
- Multi-user organizations
- Role-based access control
- Bulk analysis (multiple products)
- Historical data warehouse
- Advanced filtering and segmentation
- Custom dashboards
- Webhook integrations

---

## Migration & Compatibility Strategy

### Database Migrations

**Approach:**
- Always additive (new columns, never drop)
- Default values for new fields
- Background migrations for heavy operations
- Version tracking in `schema_migrations` table

**Example Migration Flow:**

```
Week 3: Add analysis_method field
→ Default to 'api_only' for existing records
→ New analyses can choose method

Week 7: Add citation_type field
→ Default to 'inline' for existing
→ Background job classifies old citations
→ New citations classified on insert
```

### Feature Flags

**Implementation:**

```tsx
// Feature flag system
const FEATURES = {
  WEB_CRAWLING: true,
  AI_PROMPTS: false, // Enable after testing
  TREND_ANALYSIS: false,
  PUBLIC_SHARING: true,
};

// Check before rendering
{FEATURES.WEB_CRAWLING && <CrawlingOption />}
```

### Version Compatibility

**Session Versioning:**

```tsx
// Add version to sessions
analysis_sessions {
  ...
  schema_version: '1.0', // POC
  schema_version: '2.0', // MVP
  schema_version: '3.0', // Full Launch
}

// Render based on version
if (session.schema_version === '1.0') {
  return <LegacyDashboard />;
}
```

### Testing Strategy

**Each Milestone:**
1. Unit tests for new services
2. Integration tests for tRPC procedures
3. Manual E2E testing
4. Regression testing (old sessions still work)
5. Performance testing (no slowdown)

**Before Each Phase:**
- Complete regression suite
- Load testing
- User acceptance testing
- Security audit

---

## Success Metrics by Phase

### POC Success Metrics

- 5-10 internal users test successfully
- 90% query success rate
- Basic insights useful
- No critical bugs

### MVP Success Metrics

- 100+ beta users
- 95% query success rate across platforms
- Average session completion < 5 min
- User satisfaction > 4/5
- < 5% error rate

### Full Launch Success Metrics

- 1000+ active users
- 98% query success rate (API + crawling)
- Both methods complete reliably
- Comparison insights accurate
- < 2% error rate
- User satisfaction > 4.5/5

---

## Risk Mitigation

### POC Risks

- **Risk:** OpenAI API unreliable
- **Mitigation:** Implement retries, show partial results

### MVP Risks

- **Risk:** Rate limiting across platforms
- **Mitigation:** Upstash Redis, queue system, user notifications

### Full Launch Risks

- **Risk:** Web crawling breaks due to UI changes
- **Mitigation:**
    - Fallback to API method
    - Monitoring alerts on failures
    - Quick selector updates
    - Graceful degradation
- **Risk:** Anti-bot detection
- **Mitigation:**
    - Stealth mode
    - Residential proxies (if needed)
    - Slow down crawling
    - Human-like delays

---

This timeline ensures continuous, stable development with each phase building on the previous while maintaining backward compatibility and system reliability.