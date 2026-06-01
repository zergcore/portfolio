import { Suspense } from "react";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import BlogPreview from "@/components/sections/BlogPreview";

import { getProfile } from "@/lib/api";
import { JsonLd, buildPersonSchema } from "@/lib/schema";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

// NEXT_PUBLIC_ prefix required — must match the name defined in .env.
const SHOW_BLOG = process.env.NEXT_PUBLIC_SHOW_BLOG === "true";

export default async function Home() {
  const locale = await getLocale();
  // Fetch high-priority data in parallel.
  // If profile is critical to the page, consider how to handle its absence.
  const profile = await getProfile();

  // Graceful degradation if the database fails to return the core profile
  if (!profile) {
    return notFound();
  }

  return (
    <>
      {/* SEO: Inject structured data instantly */}
      <JsonLd
        data={buildPersonSchema({
          ...profile,
          title: profile.title?.[locale as "en" | "es"] || profile.title?.en,
          bio: profile.bio?.[locale as "en" | "es"] || profile.bio?.en,
        })}
      />

      {/* Semantic grouping for the primary view */}
      <main className="flex w-full flex-1 flex-col isolate">

        {/* Above the fold: Streams instantly, no blocking data dependencies */}
        <Hero />
        <About profile={profile} />

        {/* Below the fold: Lazily streamed as data resolves */}
        <Suspense fallback={<SectionSkeleton />}>
          <Projects />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Skills />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Experience />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Education />
        </Suspense>

        {SHOW_BLOG && (
          <Suspense fallback={<SectionSkeleton />}>
            <BlogPreview />
          </Suspense>
        )}

        <div className="py-12 text-center">
          <Link
            href="/contact"
            className="text-sm text-[var(--text-secondary)] underline underline-offset-4 hover:text-[var(--text-primary)] transition-colors"
          >
            Contact
          </Link>
        </div>
      </main>
    </>
  );
}
