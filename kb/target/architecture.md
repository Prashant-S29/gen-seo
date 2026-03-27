Gen-SEO Technical Documentation

## Table of Contents

1. [System Architecture Overview](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
2. [Tech Stack](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
3. [Database Design](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
4. [User Flow](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
5. [API Architecture (tRPC)](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
6. [Core Services & Functions](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
7. [Data Flow Diagrams](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)
8. [Implementation Plan](https://www.notion.so/Better-Architecture-2dc166adf4948079ac99f4ff831f3f54?pvs=21)

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  Next.js 14 (App Router) + React + TypeScript + TailwindCSS │
│  + React Query + Better Auth                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    tRPC API Layer (Server)                   │
│  API Routes → tRPC Procedures → Services → Database          │
└─────────────────────────────────────────────────────────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
┌─────────────────────────┐  ┌──────────────────────────┐
│   PostgreSQL Database   │  │   External Services      │
│  (Drizzle ORM)          │  │  - Vercel AI SDK         │
│  + Upstash Redis        │  │  - Playwright            │
│  (Rate Limiting)        │  │  - Product Info APIs     │
└─────────────────────────┘  └──────────────────────────┘

```

### Component Breakdown

**Frontend**

- Landing page with authentication (Better Auth)
- Search page with URL/product name input
- Product info pre-population with tag editing
- Analysis method selection (API/Crawling/Both)
- Real-time progress tracking dashboard
- Results visualization (metrics, charts, leaderboards)

**Backend**

- Type-safe tRPC procedures
- Product information enrichment service
- Dual analysis engines (API + Web Crawling)
- Response parsing and mention extraction
- Metrics calculation and aggregation
- Rate limiting with Upstash Redis

**Database**

- User accounts and sessions
- Analysis sessions with metadata
- Prompts, responses, and platform results
- Brand mentions and citations
- Calculated metrics and rankings

**External Integrations**

- Vercel AI SDK (OpenAI, Claude, Gemini, Perplexity)
- Playwright for web UI crawling
- Clearbit/Similar APIs for product enrichment
- Upstash Redis for rate limiting

---

## Tech Stack

### Core Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **API Layer**: tRPC
- **Database**: PostgreSQL + Drizzle ORM
- **Cache/Rate Limiting**: Upstash Redis
- **Authentication**: Better Auth
- **Styling**: Tailwind CSS + Shadcn/ui
- **AI Integration**: Vercel AI SDK
- **Web Crawling**: Playwright
- **Data Fetching**: React Query (via tRPC)
- **Deployment**: Vercel

### Key Libraries

```json
{
  "dependencies": {
    "@ai-sdk/openai": "^0.x.x",
    "@ai-sdk/anthropic": "^0.x.x",
    "@ai-sdk/google": "^0.x.x",
    "ai": "^3.x.x",
    "playwright": "^1.x.x",
    "playwright-extra": "^4.x.x",
    "puppeteer-extra-plugin-stealth": "^2.x.x",
    "@upstash/redis": "^1.x.x",
    "@upstash/ratelimit": "^1.x.x",
    "drizzle-orm": "^0.x.x",
    "better-auth": "^0.x.x",
    "zod": "^3.x.x",
    "recharts": "^2.x.x"
  }
}

```

---

## Database Design

### Schema Structure

**Files Organization:**

```
src/server/db/schema/
├── users.ts                 # User accounts
├── analysis-sessions.ts     # Analysis tracking
├── prompts.ts              # Prompts and responses
├── mentions.ts             # Brand mentions and citations
└── index.ts                # Export all schemas

```

### Entity Relationship Diagram

```
┌──────────────┐
│    users     │
├──────────────┤
│ id (PK)      │
│ email        │
│ name         │
│ created_at   │
└──────────────┘
       │
       │ 1:N
       ▼
┌─────────────────────────┐
│   analysis_sessions     │
├─────────────────────────┤
│ id (PK)                 │
│ user_id (FK)            │
│ product_url             │
│ product_name            │
│ category_tags (array)   │
│ brands (array)          │
│ primary_brand           │
│ analysis_method         │
│ status                  │
│ created_at              │
└─────────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────────────┐
│       prompts           │
├─────────────────────────┤
│ id (PK)                 │
│ session_id (FK)         │
│ prompt_text             │
│ prompt_type             │
│ executed_at             │
└─────────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────────────┐
│      responses          │
├─────────────────────────┤
│ id (PK)                 │
│ prompt_id (FK)          │
│ platform                │
│ model                   │
│ analysis_method         │
│ response_text           │
│ raw_response (JSON)     │
│ execution_time_ms       │
│ created_at              │
└─────────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────────────┐
│       mentions          │
├─────────────────────────┤
│ id (PK)                 │
│ response_id (FK)        │
│ brand_name              │
│ position                │
│ context_snippet         │
│ sentiment               │
│ is_recommended          │
│ is_cited                │
└─────────────────────────┘
       │
       │ 1:N
       ▼
┌─────────────────────────┐
│      citations          │
├─────────────────────────┤
│ id (PK)                 │
│ mention_id (FK)         │
│ url                     │
│ domain                  │
│ page_title              │
│ citation_type           │
└─────────────────────────┘

```

### Key Schema Definitions

**analysis_sessions**

```tsx
export const analysisMethodEnum = pgEnum('analysis_method', [
  'api_only',
  'crawling_only',
  'both'
]);

export const analysisSessions = pgTable('analysis_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  productUrl: text('product_url'),
  productName: varchar('product_name', { length: 255 }).notNull(),
  categoryTags: text('category_tags').array().notNull(),
  brands: text('brands').array().notNull(),
  primaryBrand: varchar('primary_brand', { length: 255 }).notNull(),
  analysisMethod: analysisMethodEnum('analysis_method').default('both').notNull(),
  status: sessionStatusEnum('status').default('pending').notNull(),
  totalPrompts: integer('total_prompts').default(0),
  completedPrompts: integer('completed_prompts').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

```

**responses (with analysis_method field)**

```tsx
export const responses = pgTable('responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  promptId: uuid('prompt_id').references(() => prompts.id).notNull(),
  platform: varchar('platform', { length: 50 }).notNull(),
  model: varchar('model', { length: 50 }),
  analysisMethod: analysisMethodEnum('analysis_method').notNull(),
  responseText: text('response_text').notNull(),
  rawResponse: json('raw_response'),
  executionTimeMs: integer('execution_time_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

```

---

## User Flow

### Complete User Journey

```
START
  │
  ▼
[Landing Page - genseo.ai]
  │
  ▼
[Login / Sign Up]
  │ (Better Auth)
  │
  ▼
[Search Page - /search]
  │
  ├─ Option 1: Enter Website URL
  │   └─ Input: "<https://notion.so>"
  │
  └─ Option 2: Enter Product Name
      └─ Input: "Notion"
  │
  │ [Search Product Info]
  │
  ▼
[Product Enrichment API Call]
  │
  ▼
[Pre-populated Form]
  ├─ Product Name: "Notion" (editable)
  ├─ Category Tags: ["productivity", "note-taking", "workspace"] (editable)
  ├─ Add/Remove tags interface
  └─ Competitor Brands input
  │
  │ [Continue]
  │
  ▼
[Analysis Method Selection]
  │
  ├─ ○ Analyze via API (OpenAI, Claude, Gemini, Perplexity)
  ├─ ○ Analyze via Web Crawling (ChatGPT UI, Claude UI)
  └─ ● Analyze Both (Default/Recommended)
  │
  │ [Analyze] [Cancel]
  │
  ▼
[Processing Screen]
  ├─ Real-time progress tracking
  ├─ Show which prompts are executing
  ├─ Display platform/method status
  │   ├─ API: OpenAI (3/10) ✓
  │   ├─ API: Claude (2/10) ⏳
  │   ├─ Crawl: ChatGPT (1/10) ⏳
  │   └─ Crawl: Claude (0/10) ⏱
  └─ Estimated time remaining
  │
  │ (React Query polling every 5s)
  │
  ▼
[Results Dashboard]
  │
  ├─ Overview Metrics
  │   ├─ Overall Visibility Score
  │   ├─ API Visibility vs Crawling Visibility
  │   ├─ Citation Share %
  │   └─ Total Prompts Executed
  │
  ├─ Platform Comparison
  │   ├─ OpenAI API vs ChatGPT Crawl
  │   ├─ Claude API vs Claude Crawl
  │   └─ Difference analysis
  │
  ├─ Competitive Leaderboard
  │   ├─ Rank by mention frequency
  │   └─ Compare across methods
  │
  ├─ Method Comparison Chart
  │   └─ Side-by-side API vs Crawling results
  │
  └─ Detailed Prompts List
      ├─ Filter by: Platform, Method, Mentioned/Not
      ├─ Expandable prompt cards
      └─ Click for full response details
  │
  ▼
[Export/Share Results]
  ├─ Download comprehensive report
  ├─ Export raw data (CSV/JSON)
  └─ Share session link
  │
  ▼
END

```

---

## API Architecture (tRPC)

### Router Structure

```
src/server/api/routers/
├── users.ts              # User management
├── products.ts           # Product info enrichment
├── analysis.ts           # Analysis session management
├── prompts.ts            # Prompt management
└── metrics.ts            # Metrics calculation

```

### Key Procedures

**products.ts**

```tsx
export const productsRouter = createTRPCRouter({
  // Enrich product information from URL or name
  enrichProduct: protectedProcedure
    .input(z.object({
      url: z.string().url().optional(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Returns: { name, description, category, tags[], competitors[] }
    }),

  // Update product tags
  updateTags: protectedProcedure
    .input(z.object({
      sessionId: z.string().uuid(),
      tags: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      // Updates session tags
    }),
});

```

**analysis.ts**

```tsx
export const analysisRouter = createTRPCRouter({
  // Start new analysis
  start: protectedProcedure
    .input(z.object({
      productName: z.string(),
      categoryTags: z.array(z.string()),
      brands: z.array(z.string()),
      primaryBrand: z.string(),
      analysisMethod: z.enum(['api_only', 'crawling_only', 'both']),
    }))
    .mutation(async ({ ctx, input }) => {
      // Returns: { sessionId, status: 'processing' }
    }),

  // Get session progress
  getProgress: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Returns: progress, status, platform-wise breakdown
    }),

  // Get complete results
  getResults: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Returns: full results with method comparison
    }),
});

```

**metrics.ts**

```tsx
export const metricsRouter = createTRPCRouter({
  // Compare API vs Crawling results
  compareMethod: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Returns: side-by-side comparison metrics
    }),

  // Get visibility by platform and method
  getVisibilityBreakdown: protectedProcedure
    .input(z.object({ sessionId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Returns: platform-wise, method-wise visibility
    }),
});

```

---

## Core Services & Functions

### Service Organization

```
src/server/services/
├── product-enrichment.ts     # Product info lookup
├── prompt-generation.ts      # Generate search prompts
├── api-analysis/
│   ├── openai-query.ts      # OpenAI API calls
│   ├── claude-query.ts      # Claude API calls
│   ├── gemini-query.ts      # Gemini API calls
│   └── perplexity-query.ts  # Perplexity API calls
├── crawling-analysis/
│   ├── chatgpt-crawler.ts   # ChatGPT web UI crawling
│   ├── claude-crawler.ts    # Claude web UI crawling
│   └── crawler-utils.ts     # Shared crawling utilities
├── response-parsing.ts       # Extract mentions/citations
├── metrics-calculation.ts    # Calculate visibility scores
├── rate-limiting.ts          # Upstash rate limiting
└── session-orchestration.ts  # Coordinate analysis flow

```

### Function Signatures

**product-enrichment.ts**

```tsx
// Lookup product info from URL
enrichFromUrl(url: string): Promise<ProductInfo>

// Lookup product info from name
enrichFromName(name: string): Promise<ProductInfo>

// Generate competitor list
suggestCompetitors(productName: string, category: string): Promise<string[]>

```

**prompt-generation.ts**

```tsx
// Generate prompts based on category tags
generatePrompts(categoryTags: string[], count: number): Promise<string[]>

// Generate prompts using AI for better coverage
generatePromptsWithAI(categoryTags: string[], count: number): Promise<string[]>

// Include query fan-out variations
generateFanOutPrompts(basePrompt: string): Promise<string[]>

```

**api-analysis/openai-query.ts**

```tsx
// Query OpenAI API with web search enabled
queryOpenAI(prompt: string, enableSearch: boolean): Promise<APIResponse>

// Batch execute prompts with rate limiting
executeBatch(prompts: string[]): Promise<APIResponse[]>

```

**crawling-analysis/chatgpt-crawler.ts**

```tsx
// Initialize browser and login
initBrowser(): Promise<Browser>

// Navigate to ChatGPT and authenticate
authenticateChatGPT(browser: Browser): Promise<Page>

// Submit prompt and wait for response
submitPrompt(page: Page, prompt: string): Promise<string>

// Extract response with citations from DOM
extractResponse(page: Page): Promise<CrawlResponse>

// Parse DOM for brand mentions
extractMentions(html: string, brands: string[]): Promise<Mention[]>

// Close browser session
closeBrowser(browser: Browser): Promise<void>

```

**crawling-analysis/crawler-utils.ts**

```tsx
// Handle anti-bot detection
setupStealth(browser: Browser): Promise<void>

// Wait for AI response completion
waitForResponse(page: Page, timeout: number): Promise<boolean>

// Extract citations from rendered HTML
extractCitationsFromDOM(page: Page): Promise<Citation[]>

// Handle rate limiting and retries
withRateLimit(fn: () => Promise<any>, key: string): Promise<any>

```

**response-parsing.ts**

```tsx
// Extract brand mentions from text
extractBrandMentions(text: string, brands: string[]): Mention[]

// Detect citation URLs and types
detectCitations(text: string): Citation[]

// Analyze sentiment of mention context
analyzeSentiment(context: string): 'positive' | 'neutral' | 'negative'

// Determine mention position/rank
calculateMentionPosition(mentions: Mention[]): Mention[]

```

**metrics-calculation.ts**

```tsx
// Calculate visibility score per brand
calculateVisibilityScore(sessionId: string, brandName: string): Promise<number>

// Calculate visibility by method
calculateVisibilityByMethod(sessionId: string, method: string): Promise<MethodMetrics>

// Compare API vs Crawling results
compareMethodResults(sessionId: string): Promise<MethodComparison>

// Generate competitive leaderboard
generateLeaderboard(sessionId: string): Promise<LeaderboardEntry[]>

// Calculate citation share
calculateCitationShare(sessionId: string): Promise<CitationShareData>

```

**rate-limiting.ts**

```tsx
// Initialize Upstash rate limiter
createRateLimiter(identifier: string, limit: number): Ratelimit

// Check rate limit before API call
checkRateLimit(key: string): Promise<boolean>

// Apply rate limiting to function
withRateLimit<T>(fn: () => Promise<T>, key: string): Promise<T>

```

**session-orchestration.ts**

```tsx
// Main orchestrator for analysis session
startAnalysis(config: AnalysisConfig): Promise<string>

// Process API-based analysis
processAPIAnalysis(sessionId: string, config: AnalysisConfig): Promise<void>

// Process web crawling analysis
processCrawlingAnalysis(sessionId: string, config: AnalysisConfig): Promise<void>

// Process both methods in parallel
processBothMethods(sessionId: string, config: AnalysisConfig): Promise<void>

// Update session progress
updateProgress(sessionId: string, progress: ProgressUpdate): Promise<void>

```

---

## Data Flow Diagrams

### Product Enrichment Flow

```
User Input (URL or Name)
        │
        ▼
[productsRouter.enrichProduct]
        │
        ▼
[enrichFromUrl / enrichFromName]
        │
        ├─ Query Clearbit API
        ├─ Query Similar Web API
        └─ Fallback: AI-based enrichment
        │
        ▼
[Return ProductInfo]
        ├─ name
        ├─ description
        ├─ category
        ├─ suggested tags[]
        └─ competitors[]
        │
        ▼
[Frontend: Pre-populate Form]

```

### Dual Analysis Flow (API + Crawling)

```
User Submits Analysis
        │
        ▼
[analysisRouter.start]
        │
        ▼
[Create Session in DB]
        │
        ▼
[startAnalysis(config)]
        │
        ├─ If method === 'api_only'
        │   └─ processAPIAnalysis()
        │
        ├─ If method === 'crawling_only'
        │   └─ processCrawlingAnalysis()
        │
        └─ If method === 'both'
            └─ processBothMethods()
                │
                ├─ Parallel execution:
                │   ├─ processAPIAnalysis()
                │   └─ processCrawlingAnalysis()
                │
                └─ Wait for both to complete
        │
        ▼
[Mark Session as Completed]

```

### API Analysis Execution Flow

```
processAPIAnalysis()
        │
        ▼
[Generate Prompts]
        │
        ▼
[For each Platform: OpenAI, Claude, Gemini, Perplexity]
        │
        ├─ Apply rate limiting (Upstash)
        │
        ├─ Execute prompt with web search enabled
        │   └─ queryOpenAI(prompt, enableSearch: true)
        │
        ├─ Store response in DB
        │
        ├─ Parse response
        │   ├─ extractBrandMentions()
        │   ├─ detectCitations()
        │   └─ analyzeSentiment()
        │
        ├─ Store mentions and citations
        │
        └─ Update progress
        │
        ▼
[All platforms completed]

```

### Web Crawling Execution Flow

```
processCrawlingAnalysis()
        │
        ▼
[Initialize Playwright Browser]
        │
        ├─ Setup stealth mode
        └─ Configure viewport
        │
        ▼
[For each Platform: ChatGPT, Claude]
        │
        ├─ authenticateChatGPT() / authenticateClaude()
        │   ├─ Navigate to login page
        │   ├─ Enter credentials (from env)
        │   └─ Wait for dashboard
        │
        ├─ For each prompt:
        │   │
        │   ├─ submitPrompt(page, prompt)
        │   │
        │   ├─ waitForResponse(page)
        │   │   └─ Poll for completion indicator
        │   │
        │   ├─ extractResponse(page)
        │   │   ├─ Get full response text from DOM
        │   │   └─ Extract citations from DOM
        │   │
        │   ├─ Store response in DB (method: 'crawling_only')
        │   │
        │   ├─ extractMentions(html, brands)
        │   │
        │   ├─ Store mentions and citations
        │   │
        │   └─ Update progress
        │
        └─ closeBrowser()
        │
        ▼
[All platforms crawled]

```

### Results Comparison Flow

```
User Views Dashboard
        │
        ▼
[metricsRouter.compareMethod]
        │
        ▼
[Query DB for session results]
        │
        ├─ Responses where method = 'api_only'
        └─ Responses where method = 'crawling_only'
        │
        ▼
[Calculate metrics separately]
        │
        ├─ API Visibility Scores
        ├─ Crawling Visibility Scores
        ├─ API Citation Share
        ├─ Crawling Citation Share
        └─ Difference calculations
        │
        ▼
[Return MethodComparison]
        │
        ├─ apiMetrics
        ├─ crawlingMetrics
        ├─ differences
        └─ insights[]
        │
        ▼
[Frontend: Render Comparison Charts]

```

---

## Implementation Plan

### Phase 1: Setup & Auth (30 mins)

**Tasks:**

1. Install dependencies (Playwright, Upstash, Vercel AI SDK)
2. Configure Better Auth
3. Setup database with user schema
4. Create landing and auth pages
5. Test authentication flow

### Phase 2: Product Enrichment (45 mins)

**Tasks:**

1. Create product enrichment API endpoints
2. Implement URL/name lookup functions
3. Build search page UI
4. Create pre-population form
5. Add tag editing interface
6. Test enrichment flow

### Phase 3: Database Schema & Migrations (30 mins)

**Tasks:**

1. Create all Drizzle schemas
2. Add analysis_method field to responses
3. Generate migrations
4. Run migrations
5. Verify schema with test data

### Phase 4: API Analysis Engine (45 mins)

**Tasks:**

1. Implement Vercel AI SDK queries (OpenAI, Claude, Gemini, Perplexity)
2. Enable web search in prompts
3. Create rate limiting with Upstash
4. Build response parsing functions
5. Test API analysis flow

### Phase 5: Web Crawling Engine (90 mins)

**Tasks:**

1. Setup Playwright with stealth mode
2. Implement ChatGPT crawler
    - Authentication
    - Prompt submission
    - Response extraction
    - Citation parsing from DOM
3. Implement Claude crawler
    - Same steps as ChatGPT
4. Build crawler utilities
5. Handle errors and retries
6. Test crawling flow

### Phase 6: Orchestration & Dual Processing (45 mins)

**Tasks:**

1. Build session orchestration service
2. Implement parallel execution (API + Crawling)
3. Create progress tracking
4. Build method comparison logic
5. Test both methods together

### Phase 7: Frontend Dashboard (60 mins)

**Tasks:**

1. Create processing screen with live progress
2. Build results dashboard
3. Implement method comparison charts
4. Create detailed prompt cards
5. Add filtering and sorting
6. Style with Tailwind + Shadcn/ui

### Phase 8: Metrics & Analytics (30 mins)

**Tasks:**

1. Implement visibility calculations by method
2. Build method comparison metrics
3. Create leaderboard with method breakdown
4. Add citation share comparison
5. Test all metrics

### Phase 9: Polish & Testing (30 mins)

**Tasks:**

1. Add loading states and skeletons
2. Implement error handling
3. Test complete user flow
4. Fix bugs and edge cases
5. Optimize performance

**Total Time: ~6.5 hours**

---

## Web Crawling Implementation Details

### Playwright Configuration

```tsx
// playwright.config.ts
export default defineConfig({
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
});

```

### Stealth Mode Setup

```tsx
// Uses playwright-extra with stealth plugin
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

chromium.use(StealthPlugin());

```

### ChatGPT Crawler Workflow

**Authentication:**

- Navigate to `https://chat.openai.com`
- Check if already logged in (session cookie)
- If not, perform login flow
- Store session for reuse

**Prompt Execution:**

- Wait for input textarea to be ready
- Type prompt text
- Click send button
- Wait for response generation
- Detect completion (stop generating button disappears)
- Extract full response from DOM

**Response Extraction:**

- Target specific DOM selectors for response text
- Extract citation links and metadata
- Parse markdown formatting
- Capture screenshots (optional for debugging)

**Citation Extraction from DOM:**

- Find all citation elements (numbered references)
- Extract URLs, domains, and titles
- Map citations to mention positions
- Store citation type (inline vs footnote)

### Claude Crawler Workflow

**Similar to ChatGPT with platform-specific adjustments:**

- Navigate to `https://claude.ai`
- Different DOM selectors for response area
- Different citation format (if any)
- Handle Claude-specific UI elements

### Rate Limiting with Upstash

```tsx
// Prevent overwhelming platforms
const limiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
});

// Apply before each request
await limiter.limit(`crawl:${platform}:${userId}`);

```

### Error Handling

**Common Issues:**

- Anti-bot detection → Retry with stealth mode
- Session expiry → Re-authenticate
- Timeout → Increase wait time, retry
- Rate limiting → Wait and retry with backoff
- DOM changes → Update selectors

**Retry Strategy:**

- Max 3 retries per prompt
- Exponential backoff (5s, 15s, 45s)
- Store failed prompts for manual review
- Alert on repeated failures

### Comparison: API vs Crawling Results

**Expected Differences:**

| Aspect | API Results | Crawling Results |
| --- | --- | --- |
| Speed | Faster (2-5s per query) | Slower (10-30s per query) |
| Citations | Variable by platform | More consistent (as shown to users) |
| Formatting | Plain text | Rich HTML/markdown |
| Accuracy | Direct from model | What users actually see |
| Rate Limits | 50-100 RPM | 5-10 RPM (cautious) |
| Cost | Pay per token | Browser resources |
| Reliability | High | Medium (DOM changes) |

**Insights from Comparison:**

- API may have different citation behavior
- Web UI shows exact user experience
- Some platforms add citations only in UI
- Position/ranking may differ
- Both methods needed for complete picture

---

## Key Data Types

```tsx
type ProductInfo = {
  name: string;
  description: string;
  category: string;
  tags: string[];
  competitors: string[];
  url?: string;
};

type AnalysisConfig = {
  productName: string;
  categoryTags: string[];
  brands: string[];
  primaryBrand: string;
  analysisMethod: 'api_only' | 'crawling_only' | 'both';
  promptCount?: number;
};

type APIResponse = {
  platform: string;
  model: string;
  responseText: string;
  citations?: Citation[];
  tokensUsed?: number;
  executionTime: number;
};

type CrawlResponse = {
  platform: string;
  responseText: string;
  citations: Citation[];
  screenshots?: string[];
  executionTime: number;
};

type Mention = {
  brandName: string;
  position: number;
  contextSnippet: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  isRecommended: boolean;
  isCited: boolean;
};

type Citation = {
  url: string;
  domain: string;
  page_title?: string;
  citationType: 'inline' | 'footnote' | 'reference';
};

type MethodComparison = {
  apiMetrics: {
    visibilityScore: number;
    citationShare: number;
    averagePosition: number;
  };
  crawlingMetrics: {
    visibilityScore: number;
    citationShare: number;
    averagePosition: number;
  };
  differences: {
    visibilityDiff: number;
    citationDiff: number;
    positionDiff: number;
  };
  insights: string[];
};

```

---

## Environment Variables

```
# Database
DATABASE_URL=postgresql://...

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_GENERATIVE_AI_API_KEY=...
PERPLEXITY_API_KEY=pplx-...

# Web Crawling Credentials
CHATGPT_EMAIL=...
CHATGPT_PASSWORD=...
CLAUDE_EMAIL=...
CLAUDE_PASSWORD=...

# Rate Limiting
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Product Enrichment
CLEARBIT_API_KEY=...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

```