import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";
import { getProjects } from "@/lib/api";
import { ArrowLeft, ExternalLink, ArrowRight } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("projects");
  return {
    title: "Projects | Zergcore.dev",
    description: t("pageDescription"),
  };
}

export default async function ProjectsPage() {
  const [projects, t, tCta] = await Promise.all([
    getProjects(),
    getTranslations("projects"),
    getTranslations("cta"),
  ]);

  return (
    <>
      <Navbar />

      <main className="flex-1 flex flex-col">
        <Section id="projects-listing" className="pt-32">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12"
          >
            <ArrowLeft size={14} />
            {t("backToProjects")}
          </Link>

          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              {t("pageTitle")}{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
                {t("pageTitleHighlight")}
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl">
              {t("pageDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {projects.map((project) => (
              <article
                key={project.id}
                className="group flex flex-col rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-all duration-300 overflow-hidden"
              >
                <div className="relative h-48 bg-[var(--bg-surface)] overflow-hidden">
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[image:var(--gradient-brand)] opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-6">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-auto">
                    {project.caseStudyUrl && (
                      <Link
                        href={project.caseStudyUrl as `/projects/${string}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-cyan)] hover:underline"
                      >
                        {t("caseStudy")}
                        <ArrowRight size={14} />
                      </Link>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        <ExternalLink size={13} />
                        {t("liveDemo")}
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Section>

        <Container className="py-8">
          <CTABanner
            headline={tCta("afterProjects.headline")}
            subtext={tCta("afterProjects.subtext")}
            buttonLabel={tCta("afterProjects.button")}
            href="/contact"
            variant="gradient"
          />
        </Container>
      </main>

      <WhatsAppFAB />
      <Footer />
    </>
  );
}
