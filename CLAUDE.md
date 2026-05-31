# CLAUDE.md

> Entry point for Claude Code. Read this first, then read the files in `.claude/`.

## What this repo is

The frontend for **zergcore.dev**, a senior full-stack engineer's portfolio. This codebase is being refactored from a generic Next.js template into an editorial, anti-AI-template design system. See `.claude/README.md` for the full design context.

## Project state

This is a side-by-side refactor:
- **`/` (root routes)** — the current live site (legacy)
- **`/v2/*`** — the new design, built piece-by-piece behind a route prefix
- Eventually `/v2/*` will be promoted to `/` in Epic 6 (cutover)

When implementing an issue, work in the `/v2/*` namespace unless the issue is explicitly tagged `surface: legacy-cleanup`.

## Content architecture — READ THIS BEFORE TOUCHING ANY DATA LAYER

The database is the **source of truth** for all structured career data: projects, experience, skills, credentials, and essays/articles. This data is also used by AI features and other application features outside the portfolio — the portfolio frontend is **one of several consumers**.

**DO NOT migrate database content to MDX files.**
**DO NOT suggest moving structured career data to the filesystem.**
**DO NOT create MDX files for projects, experience entries, skills, or credentials.**

The correct data pattern for this project is:

```
Database (source of truth)
    ↓
Backend API
    ↓
lib/content/*.ts  ←  'use cache' + cacheTag + revalidateTag
    ↓
Portfolio pages   ←  Server Components, reads from cache layer
```

The cache layer in `lib/content/` makes pages render fast (cache hit = no DB round-trip) while staying fresh (backend calls `/api/revalidate` when data changes). This is set up once in issue [0.6] and then invisible to all subsequent issues.

**The only content that lives as files in this repo:**
- Long-form case study essays (`app/(v2)/_data/essays/*.mdx`) — authored content that benefits from rich MDX components (code blocks, embedded SVG diagrams)
- The "currently reading" list (`app/(v2)/_data/currently-reading.ts`) — a manually curated list with no DB equivalent

Everything else comes from the database via the cache layer.

## Before you start any task

1. Read `.claude/README.md`
2. Read `.claude/design-system.md` (palette, typography, layout grammar)
3. Read `.claude/editorial-voice.md` (writing style, anti-AI manifesto)
4. Read `.claude/component-patterns.md` (reusable patterns)
5. If the issue references a mockup, read the corresponding file in `.claude/mockups/`

## How to find the issue you're implementing

Issues are referenced by their title prefix (e.g. `[0.1]`, `[1.2]`), not by number, because GitHub assigns numbers based on repo history. To find an issue by its title prefix:

```bash
gh issue list --search "in:title [0.6]" --json number,title
# returns the issue number for that issue in this repo
```

Then view the full body:
```bash
gh issue view <NUMBER> --json title,body,labels
```

## Engineering conventions

- **Server Components by default.** Add `'use client'` only when interaction requires it.
- **Design tokens, not raw values.** Always `var(--accent)`, never `#d48aa6`.
- **Three-font system.** Instrument Serif (display), Geist (body/UI), JetBrains Mono (captions). Each font has a categorical job — never mix.
- **No icon libraries.** Use Unicode glyphs (`↗`, `·`, `—`) and inline SVG.
- **`nuqs` for URL state**, not `useState`.
- **`next/image` with explicit `sizes`** for any raster image.
- **TypeScript strict mode.** No `any`. No `@ts-ignore` without a comment explaining why.
- **`'use cache'` for all data fetching** from the backend API. See `lib/content/` for the pattern.

## Per-issue workflow

1. Find the issue: `gh issue list --search "in:title [X.Y]" --json number,title`
2. Read the full issue body: `gh issue view <NUMBER> --json title,body,labels`
3. Read the referenced mockup file in `.claude/mockups/` if applicable
4. Plan your changes — list the files you'll touch
5. Implement
6. Self-verify against the acceptance criteria checklist
7. Run `pnpm typecheck && pnpm lint && pnpm build` before declaring done
8. If anything is unclear, ask before guessing. Do not invent design or architectural decisions.

## What "done" looks like

Every Claude-Code-ready issue has acceptance criteria as a checklist. Treat them as objective pass/fail. If a criterion says "Lighthouse mobile ≥ 90," run Lighthouse and verify. Don't claim done without verifying.
