import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft } from "lucide-react";

import Section from "@/components/ui/Section";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";

import { buildMetadata, siteConfig } from "@/lib/metadata";
import { JsonLd } from "@/lib/schema";
import { ProjectsDirectory } from "@/components/pages/Projects/ProjectsDirectory";
import { ProjectsDirectorySkeleton } from "@/components/pages/Projects/ProjectsDirectorySkeleton";


interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ skills?: string; group?: string }>;
}

export async function generateMetadata() {
  const t = await getTranslations("projects");
  return buildMetadata({
    title: `Projects | ${siteConfig.name}`,
    description: t("pageDescription"),
    path: "projects",
  });
}

export default async function ProjectsPage({ params, searchParams }: PageProps) {
  // 💡 Await only critical path data here so the shell streams instantly
  const [{ locale }, t, tCta] = await Promise.all([
    params,
    getTranslations("projects"),
    getTranslations("cta"),
  ]);

  return (
    <main className="isolate flex w-full flex-1 flex-col">
      {/* SEO: Explicitly define this route as a collection directory */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Projects | ${siteConfig.name}`,
          description: t("pageDescription"),
          url: `${siteConfig.domain}/projects`
        }}
      />

      <Section id="projects-listing" className="pb-16 pt-32">

        {/* Above the Fold Shell: Renders instantly */}
        <Link
          href="/"
          className="group mb-12 inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-[var(--accent-cyan)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label={t("backToHome")}
        >
          <ArrowLeft size={16} aria-hidden="true" className="transition-transform group-hover:-translate-x-1" />
          {t("backToHome")}
        </Link>

        <header className="mb-16 flex flex-col items-center text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl">
            {t("pageTitle")}{" "}
            <span className="select-none bg-[image:var(--gradient-brand)] bg-clip-text text-transparent">
              {t("pageTitleHighlight")}
            </span>
          </h1>
          <p className="max-w-2xl text-base text-[var(--text-secondary)] md:text-lg">
            {t("pageDescription")}
          </p>
        </header>

        {/* 💡 Data fetching is delegated and wrapped in Suspense */}
        <Suspense fallback={<ProjectsDirectorySkeleton />}>
          <ProjectsDirectory searchParamsPromise={searchParams} locale={locale} />
        </Suspense>

      </Section>

      {/* CTA Streams instantly with the shell */}
      <Container className="py-12 md:py-16">
        <CTABanner
          headline={tCta("afterProjects.headline")}
          subtext={tCta("afterProjects.subtext")}
          buttonLabel={tCta("afterProjects.button")}
          href="/contact"
          variant="gradient"
        />
      </Container>
    </main>
  );
}
