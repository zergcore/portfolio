# Design System — zergcore.dev

Source of truth for visual decisions. Every component pulls from these tokens. Mockups in `./mockups/` are reference implementations.

---

## Color palette — dusty rose / mauve

### Background

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0b0a0c` | Page background. Slightly cooler than pure black to complement rose accents. |
| `--bg-elev` | `#131114` | Elevated surfaces (rare — most surfaces are flat) |

### Ink (foreground text)

| Token | Value | Use |
|---|---|---|
| `--ink` | `#f4f0ee` | Primary text, headlines, important UI |
| `--ink-dim` | `#8a8089` | Body paragraphs, secondary text, nav items |
| `--ink-faint` | `#4a4248` | Captions, eyebrow labels, separators, hover states |

### Rules (dividers and borders)

| Token | Value | Use |
|---|---|---|
| `--rule` | `#1f1c20` | Standard horizontal rules, borders |
| `--rule-bright` | `#2c282d` | Hover state for rules, slightly emphasized borders |

### Accent — the rose system

| Token | Value | Use |
|---|---|---|
| `--accent` | `#d48aa6` | **Primary accent.** Italic-serif emphasis words, section `§` numbers, primary CTA underlines, metric values, diamond markers (flagship tier), green-dot adjacent UI moments |
| `--accent-soft` | `#e9bcce` | Hover states on accent links, soft highlights, marginalia text |
| `--accent-deep` | `#8e5675` | Reserved for heavier moments — primary CTA buttons on case-study pages, hover on critical links, plum register when more visual weight is needed |

### Semantic colors (do not change)

| Token | Value | Use |
|---|---|---|
| `--available` | `#4ade80` | The pulsing green availability dot. **Always green.** Recruiters scan for this color semantically; never replace with rose. |

### Ambient lighting (page-level)

The body has two radial gradients on `background-image` providing subtle warmth:

```css
background-image:
  radial-gradient(ellipse 80% 50% at 20% -10%, rgba(212,138,166,0.07), transparent 60%),
  radial-gradient(ellipse 60% 40% at 90% 15%, rgba(142,86,117,0.06), transparent 60%);
```

Always keep these at < 8% opacity. They're atmosphere, not decoration.

### Noise overlay

Body has a CSS-only SVG noise overlay at 6% opacity, `mix-blend-mode: overlay`. See any mockup's `body::before` rule. **Always keep this** — it's what kills the "clinical AI UI" look.

---

## Typography — three fonts, one job each

**This is a rule, not a guideline.** Each font has a categorical role. Mixing them is not allowed.

### 1. Instrument Serif — Display only

```css
--serif: "Instrument Serif", "Times New Roman", serif;
```

**Use for:** headlines (H1, H2), italic accent words inside headlines, large dek/lead paragraphs, editorial pull quotes, "metric value" numbers (e.g. `82%`), marginalia annotations, drop caps, "currently reading" book titles.

**Never use for:** body paragraphs, nav links, UI labels, captions, code.

**Size range:** 22px (smallest, for italic emphasis spans inside body text) to 160px (largest, for hero headlines). Almost always italic in the rose-accent color.

### 2. Geist — Body and UI

```css
--sans: "Geist", -apple-system, sans-serif;
```

**Use for:** all body paragraphs, dek text, navigation link items, the about-section copy, intro paragraphs, hero sub-text, contact section dek.

**Weight scale:** 300 (most body text), 400 (emphasized body), 500 (UI elements like nav active state), 600 (rare — only when bold genuinely needed).

**Default for body:** 300 weight, 15–16px, 1.6–1.7 line-height, `--ink-dim` color.

### 3. JetBrains Mono — Captions and metadata

```css
--mono: "JetBrains Mono", ui-monospace, monospace;
```

**Use for:** section eyebrows (`§ 02 · Selected Work`), dates (`2024 · Q3`), tier labels (`— Tier 01`), inline stack lists (`TYPESCRIPT · REACT · POSTGRES`), tag labels, the colophon, the logo (`<zr/>`), keyboard hints (`⌘K`), URL bars in mock screenshots, microcopy footers.

**Style:** 10–12px, letterspacing `0.05em` to `0.08em`, uppercase for labels, `--ink-faint` or `--ink-dim` for color.

**Never use for:** body paragraphs (you'd kill readability), large headlines (you'd kill elegance).

### Navigation font decision

**Decision: Geist for everything in the navbar, with one exception.**

- Logo (`<zr/>`) → Geist (was JetBrains Mono in early mockups; standardize to Geist)
- Nav links (Home, Work, Writing, etc.) → Geist 300, 13px
- Active link → Geist 300, 13px, `--ink` color (vs. `--ink-dim` for inactive)
- **Resume link → JetBrains Mono 11px** — this is the one mono moment. Resume is a "system action" (downloads a file, opens external) so it earns the mono treatment as a signal that it behaves differently from in-site navigation.
- Visual separator: 1px vertical rule between nav links and the resume link, reinforcing the categorical difference.

This is the **only** intentional mono-in-Geist-context exception across the site.

### Font loading

Use `next/font/google` with `display: 'swap'`. Subset only Latin (and `latin-ext` for accented Spanish characters). Example:

```ts
import { Geist, Instrument_Serif, JetBrains_Mono } from 'next/font/google'

export const geist = Geist({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500'],
  variable: '--font-geist',
  display: 'swap',
})

export const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})
```

Then in `globals.css`:

```css
:root {
  --serif: var(--font-serif), "Times New Roman", serif;
  --sans: var(--font-geist), -apple-system, sans-serif;
  --mono: var(--font-mono), ui-monospace, monospace;
}
```

---

## Spacing — modular scale

No Tailwind. Spacing tokens are minimal because layouts are dictated by content rhythm, not a strict grid.

| Token | Value | Use |
|---|---|---|
| `--space-1` | 8px | Tight icon/label gaps |
| `--space-2` | 16px | Standard inline gaps |
| `--space-3` | 24px | Section internal padding |
| `--space-4` | 32px | Component spacing |
| `--space-5` | 48px | Section header to content |
| `--space-6` | 64px | Major section breathing room |
| `--space-7` | 96px | Page-level vertical rhythm |
| `--space-8` | 128px | Hero-scale breathing room |

Most layouts use `--space-5` through `--space-7`. Don't be afraid of large numbers — editorial layouts breathe.

---

## Layout grammar

### Page container

```css
main, section.section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
}
```

On mobile (< 900px): `padding: 0 24px`.

### Left-rail spine

Many pages use a vertical hairline rule at 140px from the page edge, with content hanging off it. Year columns, diamond markers, and section eyebrows all align to this spine. See `experience-mockup.html`, `credentials-mockup.html`, `work-mockup.html`.

```css
.left-rail-spine::before {
  content: "";
  position: absolute;
  left: 140px;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--rule);
}
```

### Diamond markers

Small rotated squares attached to the left-rail spine, color-coded by tier:

- Flagship → `var(--accent)` (rose)
- Standard → `var(--ink-dim)` (dim ink)
- Archive → outline only (`border: 1px solid var(--ink-faint)`)

7px × 7px, `transform: rotate(45deg)`.

### Section eyebrows

Every page section starts with a monospace eyebrow:

```
§ 02 · Selected Work ━━━━━━━━━━━━━━━━━ All work →
```

Format: section number in `--accent`, section name in `--ink-dim`, then `flex: 1` divider, then optional view-all link or metadata caption.

---

## Component primitives (build once, use everywhere)

These five components live in `components/ui/` and are referenced across every page. **Do not re-implement them in feature folders.**

1. **`<Eyebrow>`** — section header with `§ NN`, title, optional right-aligned action
2. **`<Marginalia>`** — rotated annotation with arrow, used for the "← the piece I'd lead with" voice moments
3. **`<DiamondMarker>`** — left-rail marker, accepts `tier: 'flagship' | 'standard' | 'archive'`
4. **`<MonoCaption>`** — small monospace caption wrapper with optional accent prefix
5. **`<SectionRule>`** — horizontal divider with optional label

Build these in issue `[0.3]`. Every subsequent issue should import them.

---

## Don't ship anything that includes:

- Pink/cyan/purple gradient buttons
- Bento grid layouts (equal-sized cards in N×N matrices)
- Pill-tagged categories with icons
- Floating action bubbles (especially WhatsApp/chat widgets) on read paths
- Generic icon libraries (`lucide-react`, `react-icons`)
- Read-time estimates as pills
- "AS SEEN IN" / "FEATURED IN" / award badges
- Particle background animations
- Cursor-following blob effects
- Skeuomorphic phone/laptop frames around screenshots
- Centered hero text with two side-by-side CTA buttons
- Bento-style "feature highlight" grids

These are the AI-portfolio-template tells. If you find yourself wanting one, see `editorial-voice.md` for what to do instead.
