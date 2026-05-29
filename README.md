# Zergcore Portfolio — Frontend

Next.js 15 frontend for the Zergcore portfolio. App Router, React 19, TypeScript, Tailwind CSS 4, next-intl (EN/ES), and a full admin CMS backed by the FastAPI backend.

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| i18n | next-intl — path-based routing (`/en/…`, `/es/…`) |
| Forms | react-hook-form + zod |
| AI streaming | Server-Sent Events via `/api/ai/rewrite/route.ts` |
| Images | Cloudinary |
| Analytics | Metricool (tracker script in `components/scripts/MetricoolScript.tsx`) |
| E2E tests | Playwright |

## Prerequisites

- Node.js 20+
- The [backend](../backend/README.md) running on port 8000 (required for admin features and public data)

## Getting started

```bash
cd frontend

pnpm install

cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL at minimum
```

**Minimum env vars for local dev:**

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8000/api/v1` |
| `REVALIDATION_SECRET` | Match the backend's `REVALIDATION_SECRET` |

```bash
pnpm dev         # http://localhost:3000
```

Admin panel: `http://localhost:3000/admin` (login with the credentials set in the backend `.env`).

## Available scripts

```bash
pnpm dev                   # Dev server (Turbopack)
pnpm build                 # Production build
pnpm lint                  # ESLint
pnpm typecheck             # tsc --noEmit  (run before merge)
pnpm exec playwright test  # E2E tests (requires backend + frontend running)
```

## Project structure

```
app/
  [locale]/          Public site (EN + ES via next-intl)
    page.tsx         Homepage
    projects/        Projects listing + case studies
    contact/         Contact page
  admin/
    (dashboard)/     Admin CMS (English-only)
      profile/       Profile editor
      experience/    Experience entries
      education/     Education & certifications
      projects/      Project entries
      skills/        Skills & categories
      blog/          Blog posts + AI enhance
      translations/  EN→ES translation queue
      imports/       LinkedIn ZIP import
      cv/generate/   CV generator (JD → ATS-friendly PDF)
      ai/usage/      AI token usage dashboard
      messages/      Contact inbox
  api/
    ai/rewrite/      SSE streaming route for AI rewrite
    revalidate/      On-demand ISR webhook

components/
  admin/             Admin-only components (forms, AI panel, sidebar)
  sections/          Public site sections (Hero, Experience, Projects…)
  ui/                Shared UI primitives

lib/
  api.ts             Public read-only API client
  adminApi.ts        Admin write API client (JWT from cookies)
  schemas/           Zod schemas (mirror of backend Pydantic schemas)
  constants/         adminNav, etc.

messages/
  en.json            English UI strings
  es.json            Spanish UI strings
```

## i18n

- All public routes live under `/[locale]/` where `locale ∈ {en, es}`.
- Locale detection: Vercel `geo` headers (LATAM countries → ES, else EN). Cookie `NEXT_LOCALE` overrides.
- Admin section is English-only.
- Every new user-facing string must be added to both `messages/en.json` and `messages/es.json`.

## Admin CMS

The admin panel at `/admin` provides:

- **Profile** — bio, social links, meeting URL
- **Experience / Education / Skills / Projects / Blog** — full CRUD with AI-enhance (✨) on text fields
- **LinkedIn Import** — upload a LinkedIn data export ZIP and preview/confirm import
- **CV Generator** — paste a job description (text or URL) → AI-tailored ATS-friendly PDF
- **Translation Queue** — review AI-drafted ES translations before publishing
- **AI Usage** — token counts and cost dashboard per feature

## LinkedIn Import

Admin route: `/admin/imports/linkedin`

### How to export the right ZIP from LinkedIn

LinkedIn currently offers two archive options. The importer needs files (`Positions.csv`, `Education.csv`, `Skills.csv`, `Projects.csv`, `Certifications.csv`, `Honors.csv`) that are **only included in the larger archive** — the "Want something in particular?" picker no longer lists those categories (as of 2026).

1. Go to **LinkedIn → Me → Settings & Privacy → Data Privacy → Get a copy of your data**.
2. Select the **first option**: *"Download larger data archive, including connections, verifications, contacts, account history, and information we infer about you based on your profile and activity."*
3. Click **Request archive** and verify your password.
4. LinkedIn emails the ZIP. Small accounts arrive in 10–60 minutes; LinkedIn officially says up to **24 hours**.

> **LinkedIn rate-limits export requests.** After requesting one export you must wait roughly **2–4 hours** before you can request another. Plan ahead — if your archive is missing data, you'll have to wait the cooldown out before re-requesting.

The "Want something in particular?" picker currently only offers Articles, Invitations, Profile, Recommendations, and Registration. None of those produce the CSVs the importer reads, so don't waste a request on it.

Upload the larger archive at `/admin/imports/linkedin` to preview and confirm the import.

## CV Generator (Chunk 10)

Admin route: `/admin/cv/generate`

Paste a job description or enter a URL → the backend fetches and parses the JD, selects the most relevant profile bullets via cosine similarity on Gemini embeddings, renders a single-column ATS-friendly HTML/PDF, and uploads it to Cloudinary.

Requires the backend to have `GEMINI_API_KEY` and `CLOUDINARY_URL` configured.
