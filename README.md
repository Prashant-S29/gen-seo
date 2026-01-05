# GenSEO - AI Visibility Tracker

Track how visible your brand is in AI search results across multiple AI platforms including ChatGPT, Claude, Gemini, and Perplexity.

**Live Demo:** [Coming Soon]  
**Demo Video:** [Coming Soon]

---

## Features

- **Multi-Provider AI Analysis** - Test visibility across OpenAI, Google Gemini, Anthropic Claude, and Perplexity
- **Real-Time Tracking** [ WIP ] - Watch your analysis progress live with detailed status updates
- **Competitive Benchmarking** - Compare your brand against competitors with interactive leaderboards
- **Citation Tracking** - Monitor which sources AI models reference when mentioning your brand
- **Advanced Analytics** [ WIP ] - Interactive charts showing visibility scores, mention distribution, and citation rates
- **Export Functionality** - Download comprehensive CSV reports of all analysis data
- **Session History** - Access and manage all your past analyses

---

## Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Prashant-S29/gen-seo.git
cd gen-seo
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables Setup

Create a `.env` file in the root directory:

```env
# Required for Application to Run

# Better Auth (Authentication)
BETTER_AUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Google OAuth (For Sign In)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/genseo"

# Email Service (Resend)
RESEND_API_KEY="your-resend-api-key"

# AI Provider API Keys (At least ONE required to use the product)

# OpenAI (for GPT-4, GPT-3.5)
OPENAI_API_KEY="sk-..."

# Google AI (for Gemini models)
GOOGLE_GENERATIVE_AI_API_KEY="..."

# Perplexity (for citation-enabled search)
PERPLEXITY_API_KEY="pplx-..."
```

#### Required Environment Variables

These are **required** for the application to start:

- `BETTER_AUTH_SECRET` - Authentication secret key
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `DATABASE_URL` - PostgreSQL connection string
- `RESEND_API_KEY` - Email service API key

#### AI Provider Keys (Optional but Needed for Analysis)

**At least ONE AI provider key is required** to perform analyses:

- `OPENAI_API_KEY` - For GPT-4 Turbo, GPT-3.5 Turbo
- `GOOGLE_GENERATIVE_AI_API_KEY` - For Gemini 1.5 Flash, Gemini 1.5 Pro
- `PERPLEXITY_API_KEY` - For Perplexity Sonar (includes citations)

**Note:** The application will run without AI keys, but you won't be able to perform analyses until at least one is configured.

### 4. Database Setup

```bash
# Push schema to database
pnpm db:push

# (Optional) Open Drizzle Studio to view database
pnpm db:studio
```

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Managing AI Providers

### Configuration File

All AI provider configurations are managed in a single file:

**`src/lib/constants/llm-providers.ts`**

This is the **single source of truth** for all AI providers.

### Provider Configuration Structure

```typescript
{
  id: 'gemini-flash',              // Unique identifier
  slug: 'gemini-1.5-flash',        // Model slug
  name: 'Gemini 1.5 Flash',        // Display name
  provider: 'google',              // Provider type
  model: 'gemini-1.5-flash',       // Model name for API
  isEnabled: true,                 // Toggle provider on/off
  displayName: 'Gemini Flash',     // UI display name
  description: 'Fast model',       // Description
  category: 'free',                // 'free' | 'paid' | 'enterprise'
  maxOutputTokens: 8192,           // Max tokens
  temperature: 0.7,                // Temperature setting
  rateLimit: {
    requestsPerMinute: 15,
    requestsPerDay: 1500,
  },
  features: {
    supportsStreaming: true,
    supportsCitations: false,      // Does it provide citations?
    supportsWebSearch: true,
  }
}
```

### Enabling/Disabling Providers

To enable or disable a provider, simply change the `isEnabled` flag:

```typescript
// Enable OpenAI
{
  id: 'gpt-4-turbo',
  isEnabled: true,  // ← Set to false to disable
  // ...
}
```

### Adding a New Provider

1. Add provider configuration to `LLM_PROVIDERS` array in `llm-providers.ts`
2. Ensure corresponding API key is in `.env`
3. Provider will automatically appear in the UI

### Provider Categories

- **free** - No cost or generous free tier (e.g., Gemini)
- **paid** - Requires payment (e.g., OpenAI, Claude)
- **enterprise** - Enterprise-only plans

---

## How It Works - Data Flow

### 1. User Input
```
User enters:
├─ Product name (e.g., "Salesforce")
├─ Competitor brands (e.g., "HubSpot", "Zoho")
├─ Category (e.g., "CRM Software")
├─ Selected AI providers (e.g., OpenAI, Gemini)
└─ Number of prompts (5-50)
```

### 2. Prompt Generation
```
System generates diverse prompts:
├─ Recommendation prompts ("What's the best...")
├─ Comparison prompts ("Compare X vs Y...")
├─ Feature prompts ("X with best features...")
├─ Price prompts ("Most affordable X...")
└─ Use-case prompts ("Best X for remote teams...")
```

### 3. AI Query Execution
```
For each prompt × each provider:
├─ Query AI model via Vercel AI SDK
├─ Apply rate limiting (2s delay between requests)
├─ Store response in database
└─ Update progress in real-time
```

### 4. Response Analysis
```
For each AI response:
├─ Extract brand mentions (regex-based detection)
├─ Identify mention position (1st, 2nd, 3rd...)
├─ Extract context snippet (50 chars around mention)
├─ Analyze sentiment (positive/neutral/negative)
├─ Detect citations (URLs, markdown links)
└─ Store all data in database
```

### 5. Metrics Calculation
```
Calculate:
├─ Visibility Score = (mentions / total prompts) × 100
├─ Citation Rate = (citations / mentions) × 100
├─ Average Position = mean position across mentions
├─ Competitive Ranking = sort brands by mentions
└─ Citation Share = % of total citations per brand
```

### 6. Results Display
```
Dashboard shows:
├─ Overview metrics (visibility, citations, prompts)
├─ Interactive charts (bar, pie, trend)
├─ Competitive leaderboard
├─ Prompt-by-prompt breakdown
├─ Top cited domains
└─ Export to CSV option
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/                # Authentication pages
│   ├── (dashboard)/           # Main app pages
│   │   └── dashboard/
│   │       ├── search/        # New analysis form
│   │       ├── processing/    # Real-time progress
│   │       ├── results/       # Analysis results
│   │       └── history/       # Session history
│   └── api/                   # API routes (tRPC, auth)
├── components/
│   ├── analysis/              # Analysis-specific components
│   │   ├── SearchForm/        # Main search form
│   │   └── Charts/            # Visualization components
│   ├── ui/                    # Shadcn/ui components
│   └── layout/                # Layout components
├── lib/
│   ├── constants/             # Configuration files
│   │   ├── llm-providers.ts   # AI provider configs (IMPORTANT!)
│   │   └── analysis-config.ts # Analysis settings
│   └── utils.ts               # Utility functions
├── server/
│   ├── api/
│   │   └── routers/           # tRPC routers
│   │       └── analysis.ts    # Analysis endpoints
│   ├── db/
│   │   └── schema/            # Database schemas
│   └── services/              # Business logic
│       ├── ai-query.ts        # AI provider integration
│       ├── prompt-generation.ts
│       ├── response-parsing.ts
│       └── session-orchestration.ts
└── zodSchema/                 # Zod validation schemas
```
