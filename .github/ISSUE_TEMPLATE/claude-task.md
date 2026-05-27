---
name: Claude Code task
about: A scoped, ready-to-implement task for Claude Code
title: "[X.Y] "
labels: ["claude-code"]
assignees: []
---

## Goal
<!-- One sentence — what does "done" look like? Be concrete. -->


## Context
<!-- 1–3 sentences — why this matters and what depends on it.
Link related issues with #N. -->


## Scope — in
<!-- Bullet list of files / components / routes this issue touches.
Be explicit: "creates app/(routes)/work/page.tsx",
             "modifies components/nav.tsx". -->
-
-

## Scope — out
<!-- Explicit list of things NOT to do.
Prevents Claude from over-reaching. -->
-
-

## Acceptance criteria
<!-- Specific, testable checks. Each pass/fail. Include:
- at least one visual criterion ("matches /mockups/X.html section Y")
- performance ("Lighthouse mobile ≥ 90")
- build ("compiles with no TS errors") -->
- [ ]
- [ ]
- [ ] Lighthouse mobile score ≥ 90 on affected route(s)
- [ ] No TypeScript errors, no ESLint/Biome warnings introduced

## Reference materials
<!-- Mockups, design tokens, related components. -->
- Mockup:
- Design tokens: `app/globals.css :root`
- Related component:

## Implementation notes
<!-- Optional. Architectural constraints. -->
- Server Components by default; client only when interaction requires it
- `nuqs` for URL-synced state, not `useState`
- `next/image` with explicit `sizes` prop for all raster images
- Use design tokens (`var(--accent)`), not raw hex values
