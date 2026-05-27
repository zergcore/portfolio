# zergcore.dev — Claude Code Context

> **If you are Claude Code reading this:** start here. This folder contains everything you need to understand this project's design system, voice, and engineering conventions. Read the files in this order:
>
> 1. **`design-system.md`** — palette, typography, spacing, component primitives
> 2. **`editorial-voice.md`** — writing style, anti-AI manifesto, voice samples
> 3. **`component-patterns.md`** — reusable component patterns referenced across the codebase
> 4. **`mockups/`** — HTML mockups of every page; these are the visual specs

If a GitHub issue references a mockup section, find the corresponding `.html` file in `mockups/` and read the relevant block. The mockups are not just visual references — their CSS contains the exact design tokens, spacing scale, and layout grammar. **Treat the mockups as a source-of-truth specification, not as inspiration.**

---

## Project overview

This is a personal portfolio for a senior full-stack engineer. The redesign is a refactor in progress, structured as 6 epics. See GitHub Projects for the live board.

### Architecture summary

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript (strict mode)
- **Content:** MDX colocated with routes in `app/(v2)/_data/`
- **Styling:** CSS Modules + CSS custom properties (no Tailwind, no CSS-in-JS)
- **Component model:** Server Components by default; Client Components only when interaction requires it
- **URL state:** `nuqs` for any state that should be shareable/deep-linkable
- **Fonts:** Loaded via `next/font/google` — see `design-system.md` for the three-font system

### Non-negotiable rules

- **Server Components by default.** Reach for `'use client'` only when an interaction genuinely requires it (URL state, keyboard handlers, palette toggles).
- **Design tokens, not raw values.** Always `var(--accent)`, never `#d48aa6`.
- **Three-font system, not interchangeable.** Each font has a categorical job — see design-system.md.
- **No icon libraries on read paths.** Use Unicode glyphs (`↗`, `·`, `—`) and inline SVG. No `lucide-react`, no `react-icons` in production routes.
- **No gradient buttons.** No pill-tagged categories. No floating action bubbles. No bento grids. See `editorial-voice.md` for the full anti-AI manifesto.
- **Mobile responsive at 375px, 768px, 1280px.** Always.

### How to interpret an issue

Every Claude-Code-ready issue has six sections:

- **Goal** — one sentence describing "done"
- **Context** — why this matters, what depends on it
- **Scope — in** — files/components/routes you should touch
- **Scope — out** — explicit list of things NOT to do
- **Acceptance criteria** — testable checks
- **Reference materials** — mockup links, related components

Treat the **Scope — out** as a hard boundary. If you find yourself wanting to "also fix" something not in scope, leave it alone and surface it as a separate issue or comment on the PR.
