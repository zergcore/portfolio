import { Suspense } from "react";
import { getTranslations, getLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import Experience from "@/components/sections/Experience";
import Education from "@/components/sections/Education";
import BlogPreview from "@/components/sections/BlogPreview";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";

import { getProfile } from "@/lib/api";
import { JsonLd, buildPersonSchema } from "@/lib/schema";
import { SectionSkeleton } from "@/components/ui/SectionSkeleton";

// 💡 Evaluated at runtime on the server. No NEXT_PUBLIC prefix needed.
const SHOW_BLOG = process.env.SHOW_BLOG === "true";

export default async function Home() {
  const locale = await getLocale();
  // Fetch high-priority data in parallel.
  // If profile is critical to the page, consider how to handle its absence.
  const [profile, tCta, tContact] = await Promise.all([
    getProfile(),
    getTranslations("cta"),
    getTranslations("contact"),
  ]);

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

        <Container className="py-12 md:py-16">
          <CTABanner
            headline={tCta("afterProjects.headline")}
            subtext={tCta("afterProjects.subtext")}
            buttonLabel={tCta("afterProjects.button")}
            href="/contact"
            variant="gradient"
          />
        </Container>

        <Suspense fallback={<SectionSkeleton />}>
          <Skills />
        </Suspense>

        <Suspense fallback={<SectionSkeleton />}>
          <Experience />
        </Suspense>

        <Container className="py-12 md:py-16">
          <CTABanner
            headline={profile.meetingUrl ? tCta("bookCall.headline") : tCta("afterExperience.headline")}
            subtext={profile.meetingUrl ? tCta("bookCall.subtext") : tCta("afterExperience.subtext")}
            buttonLabel={profile.meetingUrl ? tContact("bookACall") : tCta("afterExperience.button")}
            href={profile.meetingUrl ?? "/contact"}
            target={profile.meetingUrl ? "_blank" : undefined}
            variant="subtle"
          />
        </Container>

        <Suspense fallback={<SectionSkeleton />}>
          <Education />
        </Suspense>

        {SHOW_BLOG && (
          <Suspense fallback={<SectionSkeleton />}>
            <BlogPreview />
          </Suspense>
        )}
      </main>
    </>
  );
}
