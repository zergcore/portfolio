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

## Before you start any task

1. Read `.claude/README.md`
2. Read `.claude/design-system.md` (palette, typography, layout grammar)
3. Read `.claude/editorial-voice.md` (writing style, anti-AI manifesto)
4. Read `.claude/component-patterns.md` (reusable patterns)
5. If the issue references a mockup, read the corresponding file in `.claude/mockups/`

## Engineering conventions

- **Server Components by default.** Add `'use client'` only when interaction requires it.
- **Design tokens, not raw values.** Always `var(--accent)`, never `#d48aa6`.
- **Three-font system.** Instrument Serif (display), Geist (body/UI), JetBrains Mono (captions). Each font has a categorical job — never mix.
- **No icon libraries.** Use Unicode glyphs (`↗`, `·`, `—`) and inline SVG.
- **`nuqs` for URL state**, not `useState`.
- **`next/image` with explicit `sizes`** for any raster image.
- **TypeScript strict mode.** No `any`. No `@ts-ignore` without a comment explaining why.

## Per-issue workflow

1. Read the issue completely. Pay attention to the **Scope — out** section as a hard boundary.
2. Read referenced mockup file in `.claude/mockups/`
3. Plan your changes — list the files you'll touch
4. Implement
5. Self-verify against the acceptance criteria checklist
6. Run `pnpm typecheck && pnpm lint && pnpm build` (or `npm` equivalent) before declaring done
7. If anything in the acceptance criteria is unclear, ask before guessing

## What "done" looks like

Every Claude-Code-ready issue has acceptance criteria as a checklist. Treat them as objective pass/fail. If a criterion says "Lighthouse mobile ≥ 90," run Lighthouse and verify. Don't claim done without verifying.

## When you're stuck

If the design intent is unclear from the issue + mockups + design system docs, **stop and ask**. Do not invent design decisions — the whole point of this documentation is that every decision is already made. If something isn't documented, it's a gap we should fix, not a license to improvise.
