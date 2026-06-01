# Content — frontmatter contracts

All content is authored as `.mdx` files. Frontmatter is validated at build time via Zod schemas in `lib/content/schemas.ts`. Invalid frontmatter throws a descriptive error that names the file and field.

---

## projects/

**Loader:** `lib/content/projects.ts` — `getAllProjects()`, `getProject(slug)`

```yaml
title: string          # Display title
subtitle: string?      # Optional subtitle / tagline
slug: string           # URL segment, must match filename
year: number           # Year shipped
tier: flagship | standard | archive
order: number          # Sort order (ascending)
dek: string            # One-line description for cards
intro: string          # Paragraph-length intro for the project page
stack: string[]        # Tech stack labels (SCREAMING CASE on render)
hasCaseStudy: boolean  # Whether a /case-study subpage exists
metrics:               # Optional — key results
  - label: string
    value: string
links:                 # Optional — external links
  - label: string
    href: string
heroArtifact: string?  # Filename of the hero image/SVG in public/
```

---

## essays/

**Loader:** `lib/content/essays.ts` — `getAllEssays()`, `getEssay(slug)`

```yaml
title: string
slug: string           # Must match filename
publishedAt: string    # YYYY-MM-DD
dek: string            # One-line teaser for the essay card
status: draft | published | archived
featured: boolean      # Shown in the featured essays slot on the homepage
tags: string[]?        # Taxonomy tags (lowercase, hyphenated)
```

---

## experience/

**Loader:** `lib/content/experience.ts` — `getAllRoles()`

```yaml
slug: string           # Must match filename
title: string          # Job title
company: string
start: string          # YYYY-MM
end: string?           # YYYY-MM — omit for current role
tier: flagship | standard | archive
summary: string        # One-line summary for the timeline card
bullets: string[]      # Accomplishment bullets (rendered as-is)
stack: string[]
metrics:               # Optional
  - label: string
    value: string
```

---

## credentials/

**Loader:** `lib/content/credentials.ts` — `getAllCredentials()`

```yaml
tier: degree | notable | archive
title: string
institution: string
dates: string          # Free-form, e.g. "2016 — 2021"
summary: string
relatedProjects: string[]?   # slugs from projects/
```
