# Component Patterns — zergcore.dev

Reusable visual patterns referenced across the codebase. Each pattern lives as a component in `components/ui/` and is **imported, never re-implemented.**

---

## Section Eyebrow

The small monospace header above every major section.

**Visual structure:**
```
§ 02 · Selected Work ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ All work →
```

**Component:** `<Eyebrow num="02" title="Selected Work" rightAction={{ href: '/work', label: 'All work →' }} />`

**Styling:**
- Font: JetBrains Mono, 11px, letter-spacing 0.08em, uppercase
- Section number (`§ 02`): `--accent`
- Title: `--ink-dim`
- Divider: `flex: 1; height: 1px; background: var(--rule)`
- Right action: `--ink-dim`, underline on hover transitions to `--accent`
- Top border: 1px `--rule` with 16px padding-top

**Reference in mockups:** every mockup has `.eyebrow` block at the top.

---

## Marginalia

Rotated mono-italic annotation hanging off a title or image. The "voice" moments.

**Visual structure:**
```
       ← currently writing my thesis between sprints
```

**Component:** `<Marginalia>currently writing my thesis between sprints</Marginalia>`

**Styling:**
- Font: JetBrains Mono italic, 11px
- Color: `--accent-soft` (the softer rose, more handwritten feel)
- Rotation: `transform: rotate(-1.2deg)`
- Position: absolute, hanging off the right side of the parent
- Arrow: drawn via CSS borders, not a font glyph
- Hidden below 1100px viewport (responsive concession)
- `pointer-events: none` (decoration, not interactive)

**Reference:** `mockups/skills-mockup.html` and `mockups/credentials-mockup.html` both have `.marginalia` blocks.

---

## Diamond Marker

Small rotated square attached to the left-rail spine. Color-coded by tier.

**Component:** `<DiamondMarker tier="flagship" />` — tiers: `flagship | standard | archive`

**Styling:**
- 7px × 7px square
- `transform: rotate(45deg)` (becomes a diamond)
- Color:
  - `flagship`: `background: var(--accent)` (rose)
  - `standard`: `background: var(--ink-dim)`
  - `archive`: `border: 1px solid var(--ink-faint)` with transparent fill
- Position: absolute, aligned to `left: 137px` (3px before the 140px spine) at the title baseline

**Reference:** `experience-mockup.html` `.role::before` rule.

---

## Mono Caption

Small monospace caption block. Used for "context strips" beneath titles, status indicators, meta info.

**Visual structure:**
```
— Tier 01 · 5 months
```

**Component:** `<MonoCaption prefix="—">Tier 01 · 5 months</MonoCaption>`

**Styling:**
- Font: JetBrains Mono, 10–11px, letter-spacing 0.05em, uppercase
- Color: `--ink-faint` for the prefix, `--ink-dim` for the value text
- Separator: `·` with 8px margin on either side, opacity 0.5
- Optional accent prefix: small dot or arrow in `--accent`

---

## Typographic Index Row

The single-line scannable row used for archive listings (writing, work, anywhere a long-form list needs to be dense). Replaces card-based listings.

**Visual structure:**
```
2024 · Q3    →    Arkano — AI-powered esoteric platform                      ↗
```

**Component:** `<IndexRow date="2024 · Q3" title="Arkano — ..." href="/work/arkano" />`

**Grid:** `grid-template-columns: 120px 1fr 32px; gap: 32px`
- Date column: mono 11px, `--ink-faint` for year, `--ink-dim` for date suffix
- Title column: Instrument Serif italic, 22-30px responsive, `--ink`
- Arrow column: serif 22px, `--ink-faint`

**Hover state (CSS-only):**
- A small 8px horizontal manicule slides in from `left: -16px` to `left: -8px`, colored `--accent`, transition `width 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)`
- Title color shifts to `--accent-soft`
- Arrow translates 4px right + color shifts to `--accent`

**Reference:** `writing-mockup.html` `.index-row`, `work-mockup.html` `.archive-row`.

This is the **single most reused pattern** on the site. Build it as a generic `<IndexRow>` in `components/ui/` and parameterize.

---

## Editorial Footnote / Pull Quote

The italic-serif statement block with a left-rule in `--accent`. Used at the bottom of every long section for the editorial "framing" voice.

**Visual structure:**
```
│ — A note on this section
│
│ I list courses I finished, not courses I started.
│ The Ms.C. is the only credential here I'd defend
│ in a viva...
│
│ — ZR, May 2026
```

**Component:**
```tsx
<EditorialNote eyebrow="A note on this section" signature="ZR, May 2026">
  I list courses I <em>finished</em>, not courses I started...
</EditorialNote>
```

**Styling:**
- Left border: 2px solid `--accent`
- Padding: 48px 32px
- Max-width: 760px
- Eyebrow: mono 11px, `--ink-faint`
- Body: Instrument Serif italic, 20–22px, `--ink`
- Signature: mono 10px, `--ink-faint`, uppercase
- Emphasized phrases inside (via `<em>`): keep italic, shift color to `--accent`

**Reference:** `credentials-mockup.html` `.philosophy`, `work-mockup.html` `.work-footnote`, `writing-mockup.html` `.editorial-note`.

---

## Metric Emphasis

Inline typographic treatment for numerical metrics inside body prose. The single highest-ROI typographic decision on the site.

**Visual structure (inline within a paragraph):**
> reduced production deployment errors by **30%** and streamlined developer-to-community workflows

**Component:** `<Metric>30%</Metric>` — used inside any prose component

**Styling:**
- Font: Instrument Serif italic
- Size: `1.2em` of surrounding text (relative, so it scales with context)
- Color: `--accent`
- Font weight: 400

**Implementation rule:**
- Do not hardcode `<Metric>` tags inside MDX
- Instead, MDX frontmatter declares structured `metrics: [{value, label}]`
- Server-side interpolation function wraps numerical occurrences in body prose with `<Metric>`
- This keeps content authoring clean and styling centralized

---

## Hero CTA Pattern

The single primary call-to-action used on hero sections. Text link with rose underline, never a button.

**Visual structure:**
```
See selected work  →
```

**Component:** `<HeroCTA href="/work" arrow>See selected work</HeroCTA>`

**Styling:**
- Font: Instrument Serif italic, 24–36px responsive
- Color: `--ink`
- Underline: `text-decoration: underline; text-decoration-color: var(--accent); text-decoration-thickness: 1.5px; text-underline-offset: 8px`
- Arrow: separate `<span>`, color `--accent`, transition `transform 0.25s`
- Hover: color shifts to `--accent`, arrow translates 6px right

**Secondary action below (mono caption):**
> — 3 case studies · 6 essays · or grab the ↗ resume PDF

---

## Archive Disclosure

The "+ N more items" expand pattern. Native `<details>`/`<summary>` with CSS-only animation.

**Visual structure:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[+] + 21 more courses · grouped by topic                  click to expand
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Styling:**
- Top and bottom borders: 1px dashed `--rule-bright`
- Marker: 10×10 square with `+` (CSS-drawn), flips to `-` on expand
- Label: mono 11px uppercase, `--ink-dim`
- Right-aligned aside in italic serif, `--ink-faint`
- Modern expand animation: `interpolate-size: allow-keywords` + `transition-behavior: allow-discrete`
- Fallback: native `<details>` works without JS

**URL state:** wrap in `nuqs` `?all=1` for shareable expanded state.

---

## Browser Frame Mock

For project screenshots that don't have real images yet. A styled HTML frame demonstrating the product.

**Visual structure:**
```
┌─────────────────────────────────────────────┐
│ ● ● ●   fin.zergcore.dev — currency demo    │  ← url bar
├─────────────────────────────────────────────┤
│                                             │
│   [mock product content goes here]          │
│                                             │
└─────────────────────────────────────────────┘
```

**Component:** `<BrowserFrame url="fin.zergcore.dev — currency demo">{children}</BrowserFrame>`

**Styling:**
- Aspect ratio: 16/10
- 1px `--rule` border
- 22px top bar with 3 dots and mock URL in mono
- No browser chrome beyond the bar (no back/forward, no extra widgets)

Used for Fin and Auto Parts ID screenshots until real images replace them.

---

## When to NOT use these patterns

If you find yourself needing a pattern not in this list, **don't invent one in a feature folder.** Add it here first, then build it in `components/ui/`, then import. The whole point of this system is that consistency emerges from disciplined reuse.

If a feature genuinely needs something new, open a discussion in the PR for the issue. We'll add it here.
