import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import Section from "@/components/ui/Section";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";

import { getProjects, getProjectBySlug } from "@/lib/api";
import { buildMetadata, siteConfig } from "@/lib/metadata";
import { JsonLd, buildCreativeWorkSchema } from "@/lib/schema";
import ProjectGallery from "@/components/pages/Projects/ProjectGallery";
import ProjectHeader from "@/components/pages/Projects/ProjectHeader";
import ProjectHero from "@/components/pages/Projects/ProjectHero";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  // 💡 Graceful degradation prevents 500 errors on invalid slugs
  if (!project) {
    return buildMetadata({ title: "Project Not Found" });
  }

  return buildMetadata({
    title: `${project.title} — Case Study | ${siteConfig.name}`,
    description: project.description ?? `A case study by ${siteConfig.name}.`,
    image: project.imageUrl,
    path: `projects/${slug}`,
    ogType: "article",
  });
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const [project, t, tCta] = await Promise.all([
    getProjectBySlug(slug, locale),
    getTranslations("projects"),
    getTranslations("cta"),
  ]);

  if (!project) return notFound();

  return (
    <main className="isolate flex w-full flex-1 flex-col">
      <JsonLd data={buildCreativeWorkSchema(project)} />

      {/* 💡 Extracted Hero Section */}
      <ProjectHero imageUrl={project.imageUrl} title={project.title} />

      <Section id="case-study" className="relative z-10 -mt-16 pb-16">
        <article className="mx-auto w-full max-w-4xl">
          <Link
            href="/projects"
            className="group mb-8 inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-[--text-muted] transition-colors hover:text-[--accent-cyan] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-cyan] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label={t("backToProjects")}
          >
            <ArrowLeft
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:-translate-x-1"
            />
            {t("backToProjects")}
          </Link>

          {/* 💡 Extracted Header */}
          <ProjectHeader project={project} t={t} />

          {/* Problem Statement */}
          {project.problem && (
            <section className="mb-12">
              <h2 className="mb-4 text-2xl font-bold tracking-tight text-[--text-primary]">
                {t("challenge")}
              </h2>
              <div className="rounded-xl border-l-4 border-[--accent-violet] bg-[--bg-elevated] p-6 text-[--text-secondary] leading-relaxed shadow-sm">
                {project.problem}
              </div>
            </section>
          )}

          {/* Approach / Execution */}
          {project.approach && project.approach.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-[--text-primary]">
                {t("approach")}
              </h2>
              <div className="flex flex-col gap-6">
                {project.approach.map((step, i) => (
                  <div
                    key={i}
                    className="flex gap-5 rounded-xl border border-(--border-subtle) bg-(--bg-elevated) p-6 transition-colors hover:border-[--accent-cyan]/30"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[--accent-cyan]/30 bg-[--accent-cyan]/10 text-sm font-bold text-[--accent-cyan]">
                      {i + 1}
                    </div>
                    <div>
                      <h3 className="mb-2 font-bold text-[--text-primary]">
                        {step.heading}
                      </h3>
                      <p className="text-sm leading-relaxed text-[--text-secondary]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Outcomes / Results */}
          {project.outcomes && project.outcomes.length > 0 && (
            <section className="mb-12">
              <h2 className="mb-6 text-2xl font-bold tracking-tight text-[--text-primary]">
                {t("outcomes")}
              </h2>
              <ul className="flex flex-col gap-4">
                {project.outcomes.map((outcome, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2
                      size={20}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-[--accent-cyan)]"
                    />
                    <span className="leading-relaxed text-[--text-secondary]">
                      {outcome}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 💡 Extracted Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <ProjectGallery
              gallery={project.gallery}
              title={project.title}
              t={t}
            />
          )}

          {/* Footer Navigation */}
          <footer className="mt-12 border-t border-(--border-subtle) pt-8">
            <Link
              href="/#projects"
              className="group inline-flex w-fit items-center gap-2 rounded-md text-sm font-medium text-[--text-primary] transition-colors hover:text-[--accent-cyan] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--accent-cyan] focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <ArrowLeft
                size={16}
                aria-hidden="true"
                className="transition-transform group-hover:-translate-x-1"
              />
              {t("backToProjects")}
            </Link>
          </footer>
        </article>
      </Section>

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
