# NewsLoom — AI Curated Personalized News Reader

NewsLoom is a premium-feeling, 3-pane news reader and aggregator built with Next.js App Router + TypeScript. It runs with **zero required API keys** and supports optional OpenAI-powered summaries.

## Features

- 3-pane desktop layout and mobile bottom navigation
- Personalized **For You** ranking (recency, interests, diversity, saved behavior)
- Source ingestion:
  - Generic RSS
  - Substack (auto `/feed` conversion)
  - YouTube RSS (channel URL derivation when possible)
  - Hacker News via Algolia API
  - X profile/list timeline embeds
- Saved articles with persistence in localStorage
- Settings for interests, density, theme intent, AI summaries
- Safe server-side RSS parsing and optional AI summarization endpoint
- In-memory server caching + local client cache

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in Vercel.
3. Deploy with default settings.
4. Optional: add `OPENAI_API_KEY` in Project → Settings → Environment Variables to enable enhanced summaries.

No required env vars for baseline operation.

## Optional env vars

See `.env.example`.

- `OPENAI_API_KEY` (optional): enables enhanced summarization in `/api/summarize`.

## How to add sources

1. Click `+` in the top bar.
2. Enter source URL and pick source type.
3. For Substack, paste homepage or feed URL.
4. For YouTube, paste channel URL (`/channel/...`) or manual RSS URL.
5. For Hacker News, choose Hacker News source type.
6. For X, paste profile/list URL and view embedded timeline in reading pane.

Then click refresh.

## Keyboard shortcuts (desktop)

- `j` / `k`: navigate list
- `o`: open in reading pane
- `s`: save
- `/`: focus search
- `esc`: close modals

## Troubleshooting

- **No items after refresh**: verify source URL provides valid RSS feed.
- **Substack not loading**: ensure site is public; app auto-tries `/feed`.
- **YouTube URL not supported**: use channel URL (`/channel/...`) or paste direct RSS URL.
- **X timeline not visible**: try public profile/list URL.
- **AI summaries unavailable**: set `OPENAI_API_KEY` and redeploy/restart.

## Acceptance checklist

- [x] `npm install` succeeds
- [x] `npm run dev` launches app
- [x] Add Substack URL and fetch articles
- [x] Add generic RSS and fetch articles
- [x] Add X profile URL and view embed
- [x] Save article and persist in localStorage
- [x] Desktop 3-pane layout + mobile bottom nav
- [x] Dark mode palette intentionally designed
- [x] No required env vars for baseline
- [x] Optional `OPENAI_API_KEY` documented
- [x] `npm run build` succeeds
