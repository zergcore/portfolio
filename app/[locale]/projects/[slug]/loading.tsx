/**
 * Streaming skeleton for /[locale]/projects/[slug]
 *
 * Next.js automatically renders this file while the async Server Component
 * (`page.tsx`) is fetching data. It replaces the blank-screen flash users
 * would otherwise see before the first byte of HTML arrives.
 *
 * Structure mirrors the real page:
 *  1. Hero image placeholder
 *  2. Back-link + title block
 *  3. Tags row
 *  4. Body content blocks (challenge, approach steps, outcomes)
 */
export default function ProjectCaseStudyLoading() {
  return (
    <main
      className="isolate flex w-full flex-1 flex-col"
      aria-busy="true"
      aria-label="Loading project…"
    >
      {/* ── Hero placeholder ──────────────────────────────────────── */}
      <div className="relative h-64 w-full animate-pulse bg-(--bg-elevated) md:h-96">
        <div className="absolute inset-0 bg-linear-to-t from-(--background) via-(--background)/60 to-transparent" />
      </div>

      {/* ── Content shell ─────────────────────────────────────────── */}
      <section className="relative z-10 -mt-16 pb-16 px-4 md:px-8 lg:px-16">
        <article className="mx-auto w-full max-w-4xl">
          {/* Back link */}
          <div className="mb-8 h-5 w-32 animate-pulse rounded-md bg-(--bg-elevated)" />

          {/* Title */}
          <div className="mb-3 h-10 w-3/4 animate-pulse rounded-lg bg-(--bg-elevated)" />

          {/* Subtitle / role + timeline row */}
          <div className="mb-6 flex flex-wrap gap-3">
            <div className="h-5 w-28 animate-pulse rounded-md bg-(--bg-elevated)" />
            <div className="h-5 w-20 animate-pulse rounded-md bg-(--bg-elevated)" />
          </div>

          {/* Tag chips */}
          <div className="mb-10 flex flex-wrap gap-2">
            {[80, 60, 100, 72].map((w, i) => (
              <div
                key={i}
                style={{ width: w }}
                className="h-6 animate-pulse rounded-full bg-(--bg-elevated)"
              />
            ))}
          </div>

          {/* Challenge block */}
          <div className="mb-12">
            <div className="mb-4 h-7 w-36 animate-pulse rounded-lg bg-(--bg-elevated)" />
            <div className="space-y-2 rounded-xl border-l-4 border-(--accent-violet) bg-(--bg-elevated) p-6">
              <div className="h-4 w-full animate-pulse rounded bg-(--bg-surface)" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-(--bg-surface)" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-(--bg-surface)" />
            </div>
          </div>

          {/* Approach steps */}
          <div className="mb-12">
            <div className="mb-6 h-7 w-28 animate-pulse rounded-lg bg-(--bg-elevated)" />
            <div className="flex flex-col gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex gap-5 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-6"
                >
                  <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-(--bg-surface)" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 animate-pulse rounded bg-(--bg-surface)" />
                    <div className="h-3 w-full animate-pulse rounded bg-(--bg-surface)" />
                    <div className="h-3 w-5/6 animate-pulse rounded bg-(--bg-surface)" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outcomes */}
          <div className="mb-12">
            <div className="mb-6 h-7 w-24 animate-pulse rounded-lg bg-(--bg-elevated)" />
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 h-5 w-5 shrink-0 animate-pulse rounded-full bg-(--bg-elevated)" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-(--bg-elevated)" />
                </div>
              ))}
            </div>
          </div>

          {/* Footer back link */}
          <div className="mt-12 border-t border-(--border-subtle) pt-8">
            <div className="h-5 w-36 animate-pulse rounded-md bg-(--bg-elevated)" />
          </div>
        </article>
      </section>
    </main>
  );
}
