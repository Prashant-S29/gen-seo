# GenSEO - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Core Business Logic](#core-business-logic)
3. [Database Schema Design](#database-schema-design)
4. [Architecture & Code Patterns](#architecture--code-patterns)
5. [Data Flow](#data-flow)
6. [Metrics Calculation](#metrics-calculation)
7. [API Endpoints](#api-endpoints)
8. [Security & Authentication](#security--authentication)
9. [Configuration](#configuration)
10. [Key Implementation Details](#key-implementation-details)

---

## 🎯 Project Overview

**GenSEO** is an AI Visibility Tracker that helps brands understand how visible they are in AI search results across multiple AI platforms (ChatGPT, Claude, Gemini, Perplexity). It performs competitive analysis by comparing brand mentions against competitors.

### Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **Authentication**: Better Auth (Google OAuth)
- **API Layer**: tRPC (type-safe API)
- **AI Integration**: Vercel AI SDK
- **UI**: React 19 + Tailwind CSS + Shadcn/ui
- **Validation**: Zod schemas
- **Email**: Resend

### Supported AI Providers
- **Google Gemini** (Flash Lite)
- **OpenAI** (GPT-4 Turbo)
- **Anthropic** (Claude 3.5 Sonnet, Claude 3 Opus)
- **Perplexity** (Sonar - native citations support)

---

## 🔄 Core Business Logic

### Analysis Workflow (6 Steps)

#### **Step 1: User Input**
Users provide:
- Product name (e.g., "Salesforce")
- Primary brand name
- Competitor brands (2-10 competitors, e.g., "HubSpot", "Zoho")
- Category (e.g., "CRM Software")
- Selected AI providers (1-10 providers)
- Number of prompts (5-50, **hardcoded to 5 in production**)

#### **Step 2: Prompt Generation**
System generates diverse prompts across 5 types:

| Prompt Type | Example |
|-------------|---------|
| `recommendation` | "What is the best CRM Software for small businesses?" |
| `comparison` | "Compare the top CRM Software options" |
| `feature` | "Which CRM Software has the best features?" |
| `price` | "Most affordable CRM Software" |
| `use_case` | "Best CRM Software for remote teams" |

**Implementation**: `src/server/services/prompt-generation.ts`
- Template-based generation
- Category-specific keywords
- Balanced distribution across types
- Randomized order

#### **Step 3: AI Query Execution**
- Queries each selected AI provider with all prompts
- **Parallel execution** across providers
- **Sequential execution** per provider (2-second delay between requests)
- Uses Vercel AI SDK for unified interface
- Stores responses in database

**Rate Limiting**:
```typescript
delayBetweenRequests: 2000 // 2 seconds
```

#### **Step 4: Response Analysis**
For each AI response:

1. **Citation Detection**
   - Extracts URLs (plain, markdown, footnote styles)
   - Extracts domain names
   - Stores in `citations` table

2. **Brand Mention Extraction**
   - Case-insensitive regex matching
   - Extracts context snippet (50 chars around mention)
   - Determines position (1st, 2nd, 3rd mention)
   - Flags if brand is recommended
   - Cross-references with citations

3. **Sentiment Analysis**
   - Simple keyword-based approach
   - Positive keywords: "best", "great", "excellent", "recommend", etc.
   - Negative keywords: "avoid", "poor", "limited", "expensive", etc.
   - Result: `positive` | `neutral` | `negative`

#### **Step 5: Metrics Calculation**
Calculated on-demand in `getResults()` procedure:

| Metric | Formula | Description |
|--------|---------|-------------|
| **Visibility Score** | `(mentions / total prompts) × 100` | % of prompts where brand was mentioned |
| **Citation Rate** | `(citations / mentions) × 100` | % of mentions with citations |
| **Average Position** | `mean(position)` | Average ranking position |
| **Competitive Ranking** | `sort by mentions DESC` | Brand leaderboard |

#### **Step 6: Results Display**
Dashboard shows:
- Overview metrics (visibility, citations, prompts)
- Interactive charts (bar, pie, trend)
- Competitive leaderboard
- Prompt-by-prompt breakdown
- Top cited domains (top 10)
- Export to CSV option

---

## 🗄️ Database Schema Design

### Schema Organization
Located in: `src/server/db/schema/`

```
schema/
├── db.schema.user.ts          # User accounts
├── db.schema.auth.ts          # Authentication (session, account, verification)
├── db.schema.analysis.ts      # Analysis sessions
├── db.schema.prompts.ts       # Prompts & responses
├── db.schema.mentions.ts      # Mentions & citations
└── index.ts                   # Schema exports
```

### Table Relationships

```
user (1) ─────────┬──────────> (N) analysis_sessions
                  │
                  ├──────────> (N) account
                  │
                  └──────────> (N) session

analysis_sessions (1) ─────> (N) prompts

prompts (1) ──────────────> (N) responses

responses (1) ────────┬────> (N) mentions
                      │
                      └────> (N) citations
```

### Core Tables

#### 1. `user` Table
```sql
user (
  id: uuid PRIMARY KEY,
  name: text NOT NULL,
  email: text UNIQUE NOT NULL,
  email_verified: boolean DEFAULT false,
  image: text,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

#### 2. `analysis_sessions` Table
```sql
analysis_sessions (
  id: uuid PRIMARY KEY,
  user_id: uuid NOT NULL → user.id (CASCADE),
  
  -- Input data
  product_name: varchar(255) NOT NULL,
  primary_brand: varchar(255) NOT NULL,
  brands: text[] NOT NULL,  -- Array of all brands
  category: varchar(255) NOT NULL,
  
  -- Configuration
  selected_providers: text[] NOT NULL,
  prompt_count: integer DEFAULT 10,
  analysis_method: enum('api_only', 'crawling_only', 'both') DEFAULT 'api_only',
  
  -- Progress tracking
  status: enum('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  total_prompts: integer DEFAULT 0,
  completed_prompts: integer DEFAULT 0,
  
  -- Timestamps
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

**Status Flow**: `pending` → `processing` → `completed`/`failed`

#### 3. `prompts` Table
```sql
prompts (
  id: uuid PRIMARY KEY,
  session_id: uuid NOT NULL → analysis_sessions.id (CASCADE),
  prompt_text: text NOT NULL,
  prompt_type: enum('recommendation', 'comparison', 'feature', 'price', 'use_case'),
  executed_at: timestamp DEFAULT now()
)
```

#### 4. `responses` Table
```sql
responses (
  id: uuid PRIMARY KEY,
  prompt_id: uuid NOT NULL → prompts.id (CASCADE),
  platform: text NOT NULL,        -- 'google', 'openai', 'anthropic', 'perplexity'
  model: text NOT NULL,            -- 'gpt-4-turbo', 'gemini-2.5-flash-lite', etc.
  response_text: text NOT NULL,
  execution_time_ms: timestamp,
  created_at: timestamp DEFAULT now()
)
```

**One-to-Many**: One prompt generates multiple responses (one per provider)

#### 5. `mentions` Table
```sql
mentions (
  id: uuid PRIMARY KEY,
  response_id: uuid NOT NULL → responses.id (CASCADE),
  brand_name: text NOT NULL,
  position: integer NOT NULL,           -- Order of appearance (1, 2, 3...)
  context_snippet: text,                -- 50 chars around mention
  sentiment: enum('positive', 'neutral', 'negative') DEFAULT 'neutral',
  is_recommended: boolean DEFAULT false,
  is_cited: boolean DEFAULT false       -- Brand appears in citations
)
```

#### 6. `citations` Table
```sql
citations (
  id: uuid PRIMARY KEY,
  response_id: uuid NOT NULL → responses.id (CASCADE),
  url: text NOT NULL,
  domain: text NOT NULL,                -- Extracted from URL
  title: text,                          -- Optional link title
  citation_type: text NOT NULL          -- 'inline', 'footnote', 'markdown'
)
```

### Authentication Tables (Better Auth)

#### `account` Table
```sql
account (
  id: uuid PRIMARY KEY,
  account_id: text NOT NULL,
  provider_id: text NOT NULL,           -- 'google', 'credentials'
  user_id: uuid NOT NULL → user.id (CASCADE),
  access_token: text,
  refresh_token: text,
  id_token: text,
  access_token_expires_at: timestamp,
  refresh_token_expires_at: timestamp,
  scope: text,
  password: text,                       -- For email/password auth
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

#### `session` Table
```sql
session (
  id: uuid PRIMARY KEY,
  expires_at: timestamp NOT NULL,
  token: text UNIQUE NOT NULL,
  user_id: uuid NOT NULL → user.id (CASCADE),
  ip_address: text,
  user_agent: text,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

#### `verification` Table
```sql
verification (
  id: uuid PRIMARY KEY,
  identifier: text NOT NULL,            -- Email or phone
  value: text NOT NULL,                 -- Verification code/token
  expires_at: timestamp NOT NULL,
  created_at: timestamp DEFAULT now(),
  updated_at: timestamp DEFAULT now()
)
```

### Cascade Deletion Strategy

```
DELETE user
  ↓ CASCADE
  ├─> analysis_sessions
  │     ↓ CASCADE
  │     └─> prompts
  │           ↓ CASCADE
  │           └─> responses
  │                 ↓ CASCADE
  │                 ├─> mentions
  │                 └─> citations
  │
  ├─> account
  └─> session
```

---

## 🏗️ Architecture & Code Patterns

### Project Structure

```
gen-seo/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth pages (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   └── dashboard/
│   │   │       ├── search/           # New analysis form
│   │   │       ├── processing/[id]/  # Real-time progress
│   │   │       ├── results/[id]/     # Analysis results
│   │   │       └── history/          # Session history
│   │   ├── (default)/                # Landing page
│   │   ├── api/                      # API routes
│   │   │   ├── auth/                 # Better Auth handlers
│   │   │   └── trpc/[trpc]/         # tRPC endpoint
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── analysis/                 # Analysis-specific components
│   │   │   ├── SearchForm/           # Main search form
│   │   │   └── Charts/               # Visualization components
│   │   ├── auth/                     # Auth components
│   │   ├── ui/                       # Shadcn/ui components
│   │   ├── layout/                   # Layout components
│   │   └── common/                   # Shared components
│   │
│   ├── lib/
│   │   ├── constants/
│   │   │   ├── llm-providers.ts      # ⭐ AI provider configs (IMPORTANT!)
│   │   │   ├── analysis-config.ts    # Analysis settings
│   │   │   └── index.ts
│   │   ├── auth.ts                   # Auth utilities
│   │   ├── mail.ts                   # Email utilities
│   │   └── utils.ts                  # Utility functions
│   │
│   ├── server/
│   │   ├── api/
│   │   │   ├── routers/
│   │   │   │   ├── analysis.ts       # ⭐ Main analysis router
│   │   │   │   └── hello.ts
│   │   │   ├── root.ts               # tRPC app router
│   │   │   └── trpc.ts               # tRPC config & middleware
│   │   │
│   │   ├── better-auth/
│   │   │   ├── config.ts             # Better Auth configuration
│   │   │   ├── client.ts             # Client-side auth
│   │   │   ├── server.ts             # Server-side auth
│   │   │   └── index.ts
│   │   │
│   │   ├── db/
│   │   │   ├── schema/               # ⭐ Database schemas
│   │   │   │   ├── db.schema.analysis.ts
│   │   │   │   ├── db.schema.auth.ts
│   │   │   │   ├── db.schema.mentions.ts
│   │   │   │   ├── db.schema.prompts.ts
│   │   │   │   ├── db.schema.user.ts
│   │   │   │   └── index.ts
│   │   │   └── index.ts              # Drizzle client
│   │   │
│   │   └── services/                 # ⭐ Business logic
│   │       ├── session-orchestration.ts   # Main orchestrator
│   │       ├── prompt-generation.ts       # Prompt generator
│   │       ├── ai-query.ts                # AI provider integration
│   │       └── response-parsing.ts        # Response analysis
│   │
│   ├── trpc/
│   │   ├── react.tsx                 # tRPC React setup
│   │   └── server.ts                 # Server-side tRPC caller
│   │
│   ├── zodSchema/                    # Validation schemas
│   │   ├── analysis/
│   │   │   └── index.ts              # Analysis form schema
│   │   └── auth/
│   │
│   ├── hooks/                        # Custom React hooks
│   ├── styles/                       # Global styles
│   └── env.js                        # ⭐ Environment validation
│
├── drizzle/                          # Database migrations
│   ├── 0000_init.sql
│   ├── 0001_add-providerid-and-promptcount.sql
│   └── 0002_citation_added.sql
│
├── public/                           # Static assets
├── drizzle.config.ts                 # Drizzle Kit config
├── next.config.js
├── tsconfig.json
└── package.json
```

### Service Layer Architecture

#### 1. `session-orchestration.ts` - Main Orchestrator
**Purpose**: Coordinates the entire analysis flow

```typescript
processAnalysisSession(config: AnalysisConfig): Promise<void>
```

**Flow**:
1. Update session status to `processing`
2. Generate prompts → Insert into DB
3. Execute prompts across all providers (parallel)
4. For each response:
   - Detect citations → Insert into DB
   - Extract mentions → Insert into DB
   - Update progress counter
5. Update session status to `completed`

**Error Handling**:
- On error: Set status to `failed`
- Individual prompt failures don't stop the process
- Detailed console logging

#### 2. `prompt-generation.ts` - Prompt Generator
**Purpose**: Generate diverse, high-quality prompts

```typescript
generatePrompts(category: string, productName: string, count: number): PromptTemplate[]
```

**Strategy**:
- 5 prompt types with 10 templates each
- Balanced distribution across types
- Category-specific keywords (CRM, Project Management, etc.)
- Template replacement: `{category}`, `{keyword}`, `{productName}`
- Randomized final order

**Example Templates**:
```typescript
recommendation: "What is the best {category} for small businesses?"
comparison: "Compare the top {category} options"
feature: "Which {category} has the best features?"
price: "Most affordable {category}"
use_case: "Best {category} for remote teams"
```

#### 3. `ai-query.ts` - AI Provider Integration
**Purpose**: Unified interface for querying all AI providers

```typescript
queryAI(providerId: string, prompt: string): Promise<AIQueryResult>
executePromptsForProvider(providerId, prompts, delayMs): Promise<AIQueryResult[]>
executePromptsAcrossProviders(providerIds, prompts, delayMs): Promise<Record<string, AIQueryResult[]>>
```

**Features**:
- Abstraction layer over Vercel AI SDK
- Provider configuration lookup
- Rate limiting with configurable delays
- Parallel provider execution
- Sequential prompt execution per provider
- Error handling per provider

**AI SDK Integration**:
```typescript
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { perplexity } from "@ai-sdk/perplexity";
import { generateText } from "ai";
```

#### 4. `response-parsing.ts` - Response Analysis
**Purpose**: Extract insights from AI responses

**Functions**:

1. **extractBrandMentions(responseText, brands)**
   - Regex-based case-insensitive matching
   - Extracts 50-char context snippet
   - Determines position order
   - Checks for recommendation keywords

2. **analyzeSentiment(context)**
   - Keyword-based sentiment analysis
   - Counts positive vs negative keywords
   - Returns: `positive` | `neutral` | `negative`

3. **detectCitations(responseText)**
   - Extracts markdown links: `[text](url)`
   - Extracts plain URLs: `https://...`
   - Extracts footnotes: `[1]: https://...`
   - Deduplicates URLs
   - Extracts domain names

4. **isBrandCited(citations, brandName)**
   - Checks if brand appears in any citation URL/domain/title
   - Case-insensitive matching

### AI Provider Configuration

**File**: `src/lib/constants/llm-providers.ts` (Single source of truth)

```typescript
export interface LLMProvider {
  // Identification
  id: string;                       // Unique ID: 'gpt-4-turbo'
  slug: string;                     // URL slug
  name: string;                     // Display name
  provider: 'google' | 'openai' | 'anthropic' | 'perplexity';
  
  // Model details
  model: string;                    // Model name for API
  version?: string;                 // Model version
  
  // Configuration
  maxOutputTokens: number;
  temperature: number;
  
  // Status
  isEnabled: boolean;               // Toggle on/off
  requiresApiKey: boolean;
  
  // Metadata
  displayName: string;
  description: string;
  category: 'free' | 'paid' | 'enterprise';
  costPerToken?: number;
  
  // Rate limits
  rateLimit: {
    requestsPerMinute: number;
    requestsPerDay?: number;
  };
  
  // Features
  features: {
    supportsStreaming: boolean;
    supportsCitations: boolean;     // Native citation support
    supportsWebSearch: boolean;
  };
}
```

**Current Providers**:

| Provider | Model | Enabled | Citations | Cost |
|----------|-------|---------|-----------|------|
| Gemini Flash Lite | gemini-2.5-flash-lite | ❌ | ❌ | Free |
| GPT-4 Turbo | gpt-4-turbo | ✅ | ❌ | $0.00003/token |
| Claude 3.5 Sonnet | claude-3-5-sonnet-20241022 | ❌ | ❌ | $0.000015/token |
| Claude 3 Opus | claude-3-opus-20240229 | ❌ | ❌ | $0.000075/token |
| Perplexity Sonar | sonar | ❌ | ✅ | $0.000001/token |

**Helper Functions**:
```typescript
getEnabledProviders(): LLMProvider[]
getProviderById(id: string): LLMProvider | undefined
getProvidersByCategory(category): LLMProvider[]
getProvidersByProviderType(provider): LLMProvider[]
```

### tRPC API Layer

**File**: `src/server/api/trpc.ts`

#### Context Creation
```typescript
createTRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers });
  return { db, session, ...opts };
}
```

#### Procedures
- **`publicProcedure`**: No authentication required
- **`protectedProcedure`**: Requires valid session, enforces user authentication

#### Middleware
```typescript
timingMiddleware: Logs execution time + adds artificial delay in dev
authMiddleware: Throws UNAUTHORIZED error if no session
```

### Validation with Zod

**File**: `src/zodSchema/analysis/index.ts`

```typescript
export const searchFormSchema = z.object({
  productName: z.string().min(2).max(255),
  primaryBrand: z.string().min(2).max(255),
  competitors: z.array(z.string().min(1)).min(2).max(10),
  category: z.string().min(1),
  selectedProviders: z.array(z.string()).min(1).max(10),
  promptCount: z.number().int().min(5).max(50),
});

export type SearchFormInput = z.infer<typeof searchFormSchema>;
```

**Configuration Source**: `src/lib/constants/analysis-config.ts`

```typescript
export const ANALYSIS_CONFIG = {
  prompts: { min: 5, max: 50, default: 10 },
  providers: { minRequired: 1, maxAllowed: 10 },
  brands: { min: 2, max: 10 },
  rateLimit: { delayBetweenRequests: 2000 }, // 2 seconds
};
```

---

## 📊 Data Flow

### Complete Analysis Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. USER INPUT (Frontend)                     │
│  SearchForm Component → React Hook Form + Zod Validation        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              2. tRPC: analysis.create (Mutation)                │
│  • Validate input with searchFormSchema                         │
│  • Calculate totalPrompts = 5 × selectedProviders.length        │
│  • INSERT INTO analysis_sessions (status: 'pending')            │
│  • Return { sessionId, status: 'processing' }                   │
│  • Start processAnalysisSession() async (no await)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         3. REDIRECT: /dashboard/processing/[sessionId]          │
│  • ProcessingPage polls analysis.getSession every 2s            │
│  • Shows progress: completedPrompts / totalPrompts              │
│  • Redirects to /results/[id] when status = 'completed'         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│      BACKGROUND: processAnalysisSession() [ASYNC]               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              4. UPDATE: status = 'processing'                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 5. PROMPT GENERATION                            │
│  generatePrompts(category, productName, 5)                      │
│  • Generate 5 prompts (balanced across types)                   │
│  • INSERT INTO prompts (promptText, promptType, sessionId)      │
│  • Returns promptRecords[]                                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            6. AI QUERY EXECUTION (PARALLEL)                     │
│  executePromptsAcrossProviders(providerIds, prompts, 2000)     │
│                                                                 │
│  For each provider (PARALLEL with Promise.allSettled):         │
│    For each prompt (SEQUENTIAL with 2s delay):                 │
│      • queryAI(providerId, promptText)                         │
│      • Call Vercel AI SDK generateText()                       │
│      • Return { providerId, platform, model, responseText }    │
│                                                                 │
│  Returns: Record<providerId, AIQueryResult[]>                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│           7. PROCESS & STORE RESPONSES                          │
│  For each promptRecord:                                         │
│    For each provider:                                           │
│      For each aiResponse:                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              7a. INSERT RESPONSE                                │
│  INSERT INTO responses (                                        │
│    promptId, platform, model,                                   │
│    responseText, executionTimeMs                                │
│  )                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              7b. EXTRACT & STORE CITATIONS                      │
│  detectCitations(responseText)                                  │
│  • Regex: markdown links [text](url)                            │
│  • Regex: plain URLs https://...                                │
│  • Regex: footnotes [1]: https://...                            │
│  • Extract domain from URL                                      │
│  • Deduplicate URLs                                             │
│                                                                 │
│  INSERT INTO citations (                                        │
│    responseId, url, domain, title, citationType                 │
│  )                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│             7c. EXTRACT & STORE MENTIONS                        │
│  extractBrandMentions(responseText, brands)                     │
│  For each brand:                                                │
│    • Regex match (case-insensitive)                             │
│    • Extract context snippet (50 chars)                         │
│    • Determine position order                                   │
│    • analyzeSentiment(contextSnippet)                           │
│    • checkIfRecommended(contextSnippet)                         │
│    • isBrandCited(citations, brandName)                         │
│                                                                 │
│  INSERT INTO mentions (                                         │
│    responseId, brandName, position,                             │
│    contextSnippet, sentiment,                                   │
│    isRecommended, isCited                                       │
│  )                                                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              7d. UPDATE PROGRESS                                │
│  completedCount++                                               │
│  UPDATE analysis_sessions                                       │
│  SET completedPrompts = completedCount                          │
│  WHERE id = sessionId                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼ (Loop until all prompts × providers done)
                         │
┌─────────────────────────────────────────────────────────────────┐
│              8. UPDATE: status = 'completed'                    │
│  UPDATE analysis_sessions                                       │
│  SET status = 'completed'                                       │
│  WHERE id = sessionId                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│      9. FRONTEND: Auto-redirect to /results/[sessionId]         │
│  Polling detects status = 'completed'                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│         10. tRPC: analysis.getResults (Query)                   │
│  • Fetch session + prompts + responses + mentions + citations   │
│  • Calculate metrics on-demand                                  │
│  • Return aggregated data                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              11. RESULTS DASHBOARD                              │
│  • Overview metrics                                             │
│  • Charts (visibility, citations, sentiment)                    │
│  • Leaderboard (brands ranked by mentions)                      │
│  • Top cited domains                                            │
│  • Prompt-by-prompt breakdown                                   │
│  • Export to CSV                                                │
└─────────────────────────────────────────────────────────────────┘
```

### Error Handling Flow

```
ERROR in processAnalysisSession()
  │
  ├─> Log error to console
  ├─> UPDATE analysis_sessions SET status = 'failed'
  └─> Throw error
  
FRONTEND POLLING:
  │
  ├─> Detects status = 'failed'
  └─> Show error message + retry option
```

---

## 📈 Metrics Calculation

### Location
`src/server/api/routers/analysis.ts` → `getResults` procedure

### Calculation Logic

#### 1. Total Counts
```typescript
totalPrompts = promptsData.length
totalMentions = sum of all mentions across all responses
totalCitations = sum of all citations across all responses
```

#### 2. Primary Brand Metrics
```typescript
// Count unique prompts where primary brand was mentioned
primaryBrandMentions = count(prompts where any response has primaryBrand mention)

// Count citations for primary brand
primaryBrandCitations = count(responses where mention.brandName = primaryBrand AND mention.isCited = true)

// Visibility Score (%)
visibilityScore = (primaryBrandMentions / totalPrompts) × 100

// Citation Rate (%)
citationRate = (primaryBrandCitations / primaryBrandMentions) × 100
```

#### 3. Competitive Leaderboard
```typescript
For each brand in session.brands:
  1. Count total mentions across all responses
  2. Count total citations (mention.isCited = true)
  3. Calculate visibility score = (mentions / totalPrompts) × 100
  4. Calculate citation rate = (citations / mentions) × 100
  
Sort brands by mentions (descending)

Result:
[
  { brand: "Salesforce", mentions: 15, citations: 8, visibilityScore: 75, citationRate: 53 },
  { brand: "HubSpot", mentions: 12, citations: 5, visibilityScore: 60, citationRate: 42 },
  ...
]
```

#### 4. Platform Distribution
```typescript
responsesByPlatform = {
  "google": 5,
  "openai": 5,
  "anthropic": 5
}
```

#### 5. Top Cited Domains
```typescript
1. Group citations by domain
2. Count occurrences per domain
3. Sort by count (descending)
4. Take top 10

Result:
[
  { domain: "salesforce.com", count: 12 },
  { domain: "g2.com", count: 8 },
  { domain: "capterra.com", count: 6 },
  ...
]
```

#### 6. Prompt-Level Analysis
```typescript
For each prompt:
  - primaryBrandMentioned: boolean (any response has primaryBrand)
  - competitorsMentioned: string[] (unique competitor brands)
  - responseCount: number (total responses for this prompt)
  - citationCount: number (total citations across responses)
```

---

## 🔌 API Endpoints

### tRPC Routers

#### Analysis Router (`analysis`)
Located: `src/server/api/routers/analysis.ts`

##### 1. `analysis.create` (Mutation, Protected)
**Purpose**: Create a new analysis session

**Input**:
```typescript
{
  productName: string;        // 2-255 chars
  primaryBrand: string;       // 2-255 chars
  competitors: string[];      // 2-10 competitors
  category: string;           // Non-empty
  selectedProviders: string[]; // 1-10 provider IDs
  promptCount: number;        // 5-50 (hardcoded to 5)
}
```

**Output**:
```typescript
{
  sessionId: string;  // UUID
  status: "processing";
}
```

**Flow**:
1. Validate input with `searchFormSchema`
2. Calculate `totalPrompts = 5 × selectedProviders.length`
3. Insert into `analysis_sessions` table
4. Start `processAnalysisSession()` asynchronously
5. Return sessionId immediately

##### 2. `analysis.getSession` (Query, Protected)
**Purpose**: Get session metadata by ID

**Input**:
```typescript
{ sessionId: string }  // UUID
```

**Output**:
```typescript
{
  id: string;
  userId: string;
  productName: string;
  primaryBrand: string;
  brands: string[];
  category: string;
  selectedProviders: string[];
  promptCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  totalPrompts: number;
  completedPrompts: number;
  createdAt: Date;
  updatedAt: Date;
}
```

**Authorization**: User can only access their own sessions

##### 3. `analysis.getResults` (Query, Protected)
**Purpose**: Get complete analysis results with calculated metrics

**Input**:
```typescript
{ sessionId: string }  // UUID
```

**Output**:
```typescript
{
  session: AnalysisSession;
  metrics: {
    totalPrompts: number;
    totalMentions: number;
    totalCitations: number;
    visibilityScore: number;       // Primary brand visibility %
    primaryBrandMentions: number;
    primaryBrandCitations: number;
    citationRate: number;          // Primary brand citation %
    responsesByPlatform: Record<string, number>;
  };
  leaderboard: Array<{
    brand: string;
    mentions: number;
    citations: number;
    visibilityScore: number;
    citationRate: number;
  }>;
  topCitedDomains: Array<{
    domain: string;
    count: number;
  }>;
  prompts: Array<{
    id: string;
    text: string;
    type: string;
    primaryBrandMentioned: boolean;
    competitorsMentioned: string[];
    responseCount: number;
    citationCount: number;
  }>;
}
```

**Authorization**: User can only access their own sessions

##### 4. `analysis.listSessions` (Query, Protected)
**Purpose**: List user's sessions with pagination

**Input**:
```typescript
{
  page: number;   // Min: 1, default: 1
  limit: number;  // Min: 1, max: 100, default: 20
}
```

**Output**:
```typescript
{
  sessions: AnalysisSession[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}
```

**Authorization**: Returns only user's own sessions

##### 5. `analysis.deleteSession` (Mutation, Protected)
**Purpose**: Delete an analysis session (cascades to all related data)

**Input**:
```typescript
{ sessionId: string }  // UUID
```

**Output**:
```typescript
{ success: boolean }
```

**Authorization**: User can only delete their own sessions

**Cascade**: Deletes prompts → responses → mentions + citations

---

## 🔐 Security & Authentication

### Authentication System
**Library**: Better Auth
**Location**: `src/server/better-auth/config.ts`

### Authentication Methods

#### 1. Email/Password
```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendResetPassword: async (data) => {
    await sendPasswordResetEmail({ email, name, url });
  }
}
```

**Flow**:
1. User signs up with email/password
2. Verification email sent via Resend
3. User clicks verification link
4. Email marked as verified
5. Welcome email sent

#### 2. Google OAuth
```typescript
socialProviders: {
  google: {
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
  }
}
```

**Flow**:
1. User clicks "Sign in with Google"
2. OAuth flow with Google
3. Account created/linked
4. Welcome email sent (new users)

### Authorization Patterns

#### Protected Procedures (tRPC)
```typescript
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.session?.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: { session: { ...ctx.session, user: ctx.session.user } }
    });
  });
```

#### Ownership Verification
All analysis endpoints verify ownership:

```typescript
// Example from getSession
const session = await ctx.db.query.analysisSessions.findFirst({
  where: and(
    eq(sessions.id, input.sessionId),
    eq(sessions.userId, ctx.session.user.id)  // ✅ User can only access own data
  )
});

if (!session) {
  throw new Error("Session not found");  // Or unauthorized
}
```

### Security Best Practices

#### 1. Environment Variables
- All secrets in `.env` file
- Validated at build time with `@t3-oss/env-nextjs`
- Never exposed to client

```typescript
// src/env.js
export const env = createEnv({
  server: {
    BETTER_AUTH_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.url(),
    RESEND_API_KEY: z.string(),
  },
  client: {}, // No client-side secrets
  ...
});
```

#### 2. SQL Injection Prevention
- Drizzle ORM parameterizes all queries
- No raw SQL with user input

#### 3. Input Validation
- Zod schemas validate all inputs
- Type-safe with tRPC
- Min/max constraints enforced

#### 4. Session Management
- Secure session tokens
- Stored in database
- Automatic expiration
- IP address and user agent tracking

#### 5. CORS & Trusted Origins
```typescript
trustedOrigins: [
  "http://localhost:3000",
  "https://gen-seo-omega.vercel.app"
]
```

### Email Service (Resend)
**Location**: `src/lib/mail.ts`

**Email Types**:
1. **Welcome Email** - After email verification
2. **Email Verification** - Verify new email addresses
3. **Password Reset** - Reset forgotten passwords

---

## ⚙️ Configuration

### Environment Variables

#### Required (Application Won't Start)
```env
# Authentication
BETTER_AUTH_SECRET="..."           # Generate: openssl rand -base64 32

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Database
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# Email
RESEND_API_KEY="..."
```

#### Optional (AI Providers)
**At least ONE required to perform analyses**

```env
# OpenAI
OPENAI_API_KEY="sk-..."

# Google AI
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Perplexity
PERPLEXITY_API_KEY="pplx-..."

# Anthropic (if using Claude)
ANTHROPIC_API_KEY="..."
```

### Configuration Files

#### 1. Analysis Config (`src/lib/constants/analysis-config.ts`)
```typescript
export const ANALYSIS_CONFIG = {
  prompts: {
    min: 5,
    max: 50,
    default: 10,
  },
  providers: {
    minRequired: 1,
    maxAllowed: 10,
  },
  brands: {
    min: 2,
    max: 10,
  },
  rateLimit: {
    delayBetweenRequests: 2000, // 2 seconds
  },
};
```

#### 2. LLM Provider Config (`src/lib/constants/llm-providers.ts`)
**Single source of truth for AI providers**

To enable/disable a provider:
```typescript
{
  id: 'gpt-4-turbo',
  isEnabled: true,  // ← Change to false to disable
  // ...
}
```

To add a new provider:
1. Add config to `LLM_PROVIDERS` array
2. Add API key to `.env`
3. Provider automatically appears in UI

#### 3. Drizzle Config (`drizzle.config.ts`)
```typescript
export default {
  schema: "./src/server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["gen-seo_*"],
} satisfies Config;
```

### Database Commands
```bash
# Push schema changes to database
pnpm db:push

# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Open Drizzle Studio (GUI)
pnpm db:studio
```

### Development Commands
```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm typecheck

# Linting
pnpm lint
pnpm lint:fix

# Formatting
pnpm format:check
pnpm format:write
```

---

## 💡 Key Implementation Details

### 1. Hardcoded Prompt Limit
**Why**: API cost management

**Location**: `src/server/api/routers/analysis.ts`
```typescript
// FIX: hardcoded to 5 for now (costs too much API quota)
const totalPrompts = 5 * input.selectedProviders.length;
promptCount: 5,  // Instead of input.promptCount
```

**Impact**:
- UI still shows slider for 5-50 prompts
- Backend always uses 5 prompts
- Total queries = 5 prompts × number of providers

### 2. Asynchronous Processing
**Pattern**: Fire-and-forget

```typescript
// Start processing asynchronously (don't await)
processAnalysisSession({...config}).catch((error) => {
  console.error(`Failed to process session ${sessionId}:`, error);
});

return { sessionId, status: "processing" };
```

**Why**:
- Immediate response to user
- Long-running process (2s delay × 5 prompts × N providers)
- User polls for progress updates

### 3. Parallel Provider Execution
**Strategy**: Query all providers simultaneously

```typescript
// Execute all providers in parallel
const providerPromises = providerIds.map(async (providerId) => {
  const providerResults = await executePromptsForProvider(
    providerId,
    prompts,
    delayMs
  );
  return { providerId, results: providerResults };
});

const allResults = await Promise.allSettled(providerPromises);
```

**Benefits**:
- Faster overall execution
- Provider failures isolated
- 5 prompts × 3 providers = ~30s (not 90s)

### 4. Citation Detection Methods
**Supports 3 formats**:

```typescript
// 1. Markdown links
[Salesforce CRM Review](https://www.g2.com/products/salesforce)

// 2. Plain URLs
https://www.salesforce.com/products/sales-cloud/overview/

// 3. Footnote-style
[1]: https://www.salesforce.com
[2] https://www.capterra.com/p/123456/Salesforce/
```

### 5. Sentiment Analysis Approach
**Method**: Keyword-based (not ML)

```typescript
const positiveKeywords = [
  "best", "great", "excellent", "recommend",
  "popular", "leading", "top", "ideal"
];

const negativeKeywords = [
  "avoid", "poor", "limited", "expensive",
  "complicated", "worst", "lacking"
];

// Count occurrences
if (positiveCount > negativeCount) return "positive";
if (negativeCount > positiveCount) return "negative";
return "neutral";
```

**Limitation**: Simple heuristic, not context-aware

### 6. Brand Mention Detection
**Method**: Regex-based

```typescript
const regex = new RegExp(brandName, "gi"); // Case-insensitive, global
const matches = [...responseText.matchAll(regex)];
```

**Context Extraction**:
```typescript
// Extract 50 characters before and after mention
const startIdx = Math.max(0, matchIndex - 50);
const endIdx = Math.min(responseText.length, matchIndex + brandName.length + 50);
const contextSnippet = responseText.slice(startIdx, endIdx).trim();
```

### 7. Progress Tracking
**Real-time updates**:

```typescript
completedCount++;

// Update progress after each response
await db
  .update(analysisSessions)
  .set({ completedPrompts: completedCount })
  .where(eq(analysisSessions.id, config.sessionId));
```

**Frontend polling**:
```typescript
// ProcessingPage polls every 2 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetch(); // Re-fetch session status
  }, 2000);
  
  return () => clearInterval(interval);
}, []);
```

### 8. Error Handling Strategy
**Graceful degradation**:

```typescript
// Individual prompt failures don't stop the entire process
try {
  const result = await queryAI(providerId, prompt);
  results.push(result);
} catch (error) {
  console.error(`Failed to execute prompt for ${providerId}:`, error);
  // Continue with other prompts
}
```

**Session failure**:
```typescript
catch (error) {
  console.error("Session processing failed:", error);
  
  // Mark session as failed
  await db
    .update(analysisSessions)
    .set({ status: "failed" })
    .where(eq(analysisSessions.id, config.sessionId));
  
  throw error;
}
```

### 9. Type Safety Throughout
**End-to-end type inference**:

```typescript
// Database → tRPC → Frontend (fully typed)
const { data } = api.analysis.getResults.useQuery({ sessionId });
//     ^? data is fully typed with all nested relations

// No runtime type errors
data.metrics.visibilityScore // ✅ TypeScript knows this exists
data.metrics.invalidField    // ❌ TypeScript error
```

### 10. Drizzle Relations Pattern
**Declarative relations**:

```typescript
export const analysisSessionsRelations = relations(
  analysisSessions,
  ({ one, many }) => ({
    user: one(user, {
      fields: [analysisSessions.userId],
      references: [user.id],
    }),
    prompts: many(prompts),
  })
);
```

**Benefits**:
- Type-safe joins
- Automatic eager loading
- Clean query syntax

```typescript
// Query with relations
const session = await db.query.analysisSessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: {
    prompts: {
      with: {
        responses: {
          with: {
            mentions: true,
            citations: true,
          }
        }
      }
    }
  }
});
```

---

## 🎨 Code Quality & Best Practices

### 1. Separation of Concerns
- **Services** = Business logic
- **Routers** = API contracts
- **Schemas** = Data validation
- **Components** = UI presentation

### 2. Single Responsibility
Each service has one clear purpose:
- `session-orchestration.ts` - Coordinates flow
- `prompt-generation.ts` - Generates prompts
- `ai-query.ts` - Queries AI providers
- `response-parsing.ts` - Parses responses

### 3. Configuration Over Code
- AI providers in config file (not hardcoded)
- Analysis limits in config file
- Easy to modify without code changes

### 4. Type Safety First
- TypeScript everywhere
- Zod for runtime validation
- tRPC for type-safe APIs
- Drizzle for type-safe DB queries

### 5. Error Handling
- Try-catch blocks at boundaries
- Detailed error logging
- Graceful degradation
- User-friendly error messages

### 6. Database Best Practices
- UUID primary keys
- Cascade deletes for referential integrity
- Timestamps on all tables
- Proper indexing (via Drizzle)
- Enums for fixed value sets

### 7. Security First
- No secrets in code
- Environment validation
- Protected API routes
- Ownership verification
- Input sanitization

---

## 📚 Additional Resources

### Project Files
- **README**: `gen-seo/README.md` - Setup instructions
- **Package**: `gen-seo/package.json` - Dependencies
- **Migrations**: `gen-seo/drizzle/` - Database history

### Key Directories
- `src/server/services/` - Core business logic
- `src/server/api/routers/` - API endpoints
- `src/server/db/schema/` - Database models
- `src/lib/constants/` - Configuration

### External Documentation
- [Next.js 16](https://nextjs.org/docs)
- [tRPC](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- [Better Auth](https://www.better-auth.com/docs)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [Zod](https://zod.dev/)

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Real-time streaming** - Show AI responses as they generate
2. **Webhook notifications** - Alert when analysis completes
3. **Scheduled analyses** - Run analyses automatically
4. **Historical comparison** - Compare results over time
5. **ML-based sentiment** - Use actual NLP models
6. **Custom prompt templates** - Let users create their own
7. **API rate limit optimization** - Better queue management
8. **Export formats** - PDF, Excel, JSON
9. **Team collaboration** - Share analyses with team
10. **Citation quality scoring** - Rank citation sources

---

**Last Updated**: 2025
**Version**: 1.0
**Maintainer**: Project Team