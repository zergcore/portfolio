import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppFAB from "@/components/layout/WhatsAppFAB";
import Section from "@/components/ui/Section";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";
import { getProjects, getProjectBySlug } from "@/lib/api";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Clock,
  User,
  CheckCircle2,
} from "lucide-react";

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
  const title = project ? `${project.title} — Case Study` : "Case Study";
  const description = project?.description ?? "A project case study by Zaidibeth Ramos.";
  const image = project?.imageUrl ?? "/zr.jpg";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article" as const,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image" as const, title, description, images: [image] },
  };
}

export default async function ProjectCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, t, tCta] = await Promise.all([
    getProjectBySlug(slug),
    getTranslations("projects"),
    getTranslations("cta"),
  ]);

  if (!project) notFound();

  const creativeWorkSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `https://zergcore.dev/projects/${project.slug}`,
    image: project.imageUrl,
    author: { "@type": "Person", name: "Zaidibeth Ramos", url: "https://zergcore.dev" },
    ...(project.tags?.length && { keywords: project.tags.join(", ") }),
    ...(project.githubUrl && { codeRepository: project.githubUrl }),
    ...(project.liveUrl && { sameAs: project.liveUrl }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(creativeWorkSchema).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar />

      <main className="flex-1 flex flex-col">
        <div className="relative w-full h-64 md:h-96 bg-[var(--bg-elevated)] overflow-hidden">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover opacity-40"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/60 to-transparent" />
        </div>

        <Section id="case-study" className="-mt-16 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-8"
            >
              <ArrowLeft size={14} />
              {t("backToProjects")}
            </Link>

            <header className="mb-12">
              <div className="flex flex-wrap gap-2 mb-4">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-[var(--text-primary)] mb-6 leading-tight">
                {project.title}
              </h1>

              <div className="flex flex-wrap gap-6 text-sm text-[var(--text-muted)] mb-6 pb-6 border-b border-[var(--border-subtle)]">
                {project.role && (
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-[var(--accent-cyan)]" />
                    {project.role}
                  </span>
                )}
                {project.timeline && (
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-[var(--accent-cyan)]" />
                    {project.timeline}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[image:var(--gradient-brand)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <ExternalLink size={14} />
                    {t("liveDemo")}
                  </a>
                )}
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-primary)] text-sm font-semibold hover:border-[var(--accent-cyan)] transition-colors"
                  >
                    <GitBranch size={14} />
                    {t("viewCode")}
                  </a>
                )}
              </div>
            </header>

            {project.problem && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                  {t("challenge")}
                </h2>
                <div className="p-6 rounded-xl bg-[var(--bg-elevated)] border-l-4 border-[var(--accent-violet)] text-[var(--text-secondary)] leading-relaxed">
                  {project.problem}
                </div>
              </section>
            )}

            {project.approach && project.approach.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {t("approach")}
                </h2>
                <div className="flex flex-col gap-6">
                  {project.approach.map((step, i) => (
                    <div
                      key={i}
                      className="flex gap-5 p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/30 flex items-center justify-center text-[var(--accent-cyan)] text-sm font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-primary)] mb-2">{step.heading}</h3>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {project.outcomes && project.outcomes.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  {t("outcomes")}
                </h2>
                <ul className="flex flex-col gap-3">
                  {project.outcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 size={18} className="text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
                      <span className="text-[var(--text-secondary)] leading-relaxed">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.gallery && project.gallery.length > 0 && (
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Gallery</h2>
                <div className={`grid gap-4 ${project.gallery.length === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"}`}>
                  {project.gallery.map((src, i) => (
                    <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                      <Image src={src} alt={`${project.title} screenshot ${i + 1}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="pt-8 border-t border-[var(--border-subtle)]">
              <Link
                href="/#projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors"
              >
                <ArrowLeft size={14} />
                {t("backToProjects")}
              </Link>
            </div>
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
