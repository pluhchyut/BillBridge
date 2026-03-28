# BillBridge

**Understand any legislation or policy proposal in plain English.**

BillBridge is a civic-tech web app for students and everyday citizens. Paste any bill, ordinance, or policy document and get a structured, neutral, plain-English analysis — including who's affected, key tradeoffs, debate arguments, and questions for policymakers.

> For educational use only. Not legal advice.

---

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/billbridge.git
cd billbridge
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-...
```

Get a key at [platform.openai.com/api-keys](https://platform.openai.com/api-keys).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Set `OPENAI_API_KEY` in your Vercel project environment variables
(Project → Settings → Environment Variables).

The `maxDuration = 60` on the API route requires **Vercel Hobby or Pro** (Hobby supports 60s on Edge; Pro supports 60s on Node). If you're on the free Hobby plan, reduce `maxDuration` to `10` and switch `runtime` to `"edge"` — but note the OpenAI SDK may need the `fetch`-based client on Edge.

---

## File Structure

```
billbridge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze/
│   │   │       └── route.ts          # POST /api/analyze — main API handler
│   │   ├── globals.css               # Tailwind base + fadeIn animation
│   │   ├── layout.tsx                # Root layout + metadata
│   │   └── page.tsx                  # Home page (input form + result view)
│   │
│   ├── components/
│   │   ├── AnalysisResult.tsx        # Top-level result layout
│   │   ├── AffectedGroups.tsx        # "Who's Affected" panel
│   │   ├── ComplexityMeter.tsx       # Legal density / scope / grade level bars
│   │   ├── DebateSection.tsx         # For / Against / Lawmaker Questions tabs
│   │   ├── ReadingLevelToggle.tsx    # Legal Text / Plain English / Simple toggle
│   │   └── Tradeoffs.tsx             # +/− pros and cons list
│   │
│   ├── hooks/
│   │   └── useAnalyze.ts             # React hook — fetch wrapper + state
│   │
│   ├── lib/
│   │   ├── complexity.ts             # Heuristic complexity metric computation
│   │   ├── openai.ts                 # OpenAI client, retry logic, output validation
│   │   ├── prompt.ts                 # System prompt, user message builder, model config
│   │   ├── rateLimiter.ts            # In-memory sliding-window rate limiter
│   │   └── validate.ts               # Input sanitization and length validation
│   │
│   └── types/
│       └── analysis.ts               # All TypeScript interfaces and types
│
├── .env.local.example
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## API Reference

### `POST /api/analyze`

**Request body:**
```json
{ "text": "Paste policy text here..." }
```

**Success response (200):**
```json
{
  "ok": true,
  "data": {
    "summary": "...",
    "affectedGroups": ["..."],
    "keyPoints": ["..."],
    "pros": ["..."],
    "cons": ["..."],
    "debateFor": ["..."],
    "debateAgainst": ["..."],
    "lawmakerQuestions": ["..."],
    "complexity": {
      "legalDensity": 42,
      "scope": 65,
      "bipartisanScore": 50,
      "gradeLevelEstimate": 14
    },
    "readingLevels": {
      "legalText": "original trimmed text...",
      "plainEnglish": "plain-English restatement...",
      "simple": "simple K-8 version..."
    }
  }
}
```

**Error response:**
```json
{
  "ok": false,
  "error": "Human-readable error message.",
  "code": "EMPTY_INPUT | TOO_SHORT | TOO_LONG | MODEL_ERROR | PARSE_ERROR | RATE_LIMITED | SERVER_ERROR"
}
```

**Rate limit:** 5 requests per IP per 60-second window. Returns `429` with `Retry-After` header when exceeded.

---

## Architectural Decisions

### Why no database in v1?
Each analysis is stateless and session-bound. Users paste text, get results, and leave. Storing analyses in a database adds operational overhead (migrations, connection pooling, PII considerations) with no user benefit in v1. The right time to add persistence is when you ship saved analyses, user accounts, or a public bill library.

### Why in-memory rate limiting instead of Redis?
For a single Vercel serverless function, an in-memory Map is correct and zero-cost. The known tradeoff — limits reset on cold starts and don't share state across multiple instances — is acceptable for a public MVP where the goal is cost control, not hardened abuse prevention. The upgrade path is clearly documented in `rateLimiter.ts`: swap the Map for `@upstash/ratelimit` with one Upstash Redis URL.

### Why `gpt-4o` with `response_format: json_object`?
`gpt-4o` produces consistently structured output at low latency. The `json_object` response format instructs the model to return only valid JSON, eliminating the most common failure mode (freeform text with embedded JSON). Temperature `0.2` keeps analysis factual and reproducible while allowing enough variation that identical inputs don't produce identical word-for-word outputs.

### Why one automatic retry on transient errors?
OpenAI's API occasionally returns 5xx errors under load. A single retry with an 800ms delay resolves the vast majority of transient failures without meaningfully increasing user wait time. Parse errors (malformed JSON) are not retried — the second call with the same input and same prompt won't produce different structural output.

### Why keep `prompt.ts` separate from `openai.ts`?
The prompt is the product's core intellectual property and the thing most likely to be iterated on. Keeping it isolated from HTTP plumbing means non-engineers can read and improve it, and A/B testing prompt variants doesn't require touching the API client code.

### Why are complexity metrics heuristic?
Grade-level estimation and legal density scoring require only the raw text — no external API calls, no latency, no cost. The scores are clearly labeled as estimates in the UI. The alternative (sending text to a separate NLP service) would add a dependency, cost, and latency for marginal accuracy gains in v1. The values are meaningful enough to be educational and honest enough to not mislead.

### Why `useAnalyze` hook instead of a Server Component?
The analysis is triggered by user input on demand, not at page load. Server Components are ideal for data fetched at render time; client-side triggered mutations are cleaner as a hook + fetch pattern. This also keeps the loading/error state co-located with the component that owns it.

---

## Environment Variables

| Variable         | Required | Description                        |
|------------------|----------|------------------------------------|
| `OPENAI_API_KEY` | ✅ Yes   | Your OpenAI API key                |
| `NODE_ENV`       | Auto     | Set automatically by Vercel/Next   |

---

## Upgrade Paths (Post-MVP)

| Feature | Approach |
|---|---|
| Persistent saved analyses | Add Vercel Postgres or PlanetScale; store `PolicyAnalysis` with a UUID slug |
| Multi-instance rate limiting | Replace in-memory Map with `@upstash/ratelimit` + Upstash Redis |
| Auth / saved history | Clerk or NextAuth with a DB-backed session |
| Bill search / library | Scrape Congress.gov API, store bills in Postgres, add full-text search |
| PDF upload | Use `pdf-parse` in the API route to extract text before passing to OpenAI |
| Streaming analysis | Switch to OpenAI streaming + Next.js `ReadableStream` route for faster perceived load |
| Analytics | Vercel Analytics (zero config) + PostHog for event tracking |
