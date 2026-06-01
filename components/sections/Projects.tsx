import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProjectCard from "@/components/cards/ProjectCard";
import { getProjects } from "@/lib/api";
import { ArrowRight } from "lucide-react";

export default async function Projects() {
  const [locale, t] = await Promise.all([
    getLocale(),
    getTranslations("projects"),
  ]);

  const projects = await getProjects({ featured: true, locale });

  return (
    <Section id="projects">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("sectionLabel")}{" "}
            <span className="text-transparent bg-clip-text bg-(image:--gradient-brand)">
              {t("sectionHighlight")}
            </span>
          </h2>
          <p className="text-(--text-secondary) max-w-2xl">
            {t("sectionDescription")}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {projects.map((project, index) => (
          <ScrollReveal key={project.id} delay={0.1 * (index + 1)}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.5}>
        <div className="flex justify-center mt-12">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-foreground border border-(--border-strong) rounded-full hover:border-(--accent-cyan) hover:text-(--accent-cyan) transition-colors"
          >
            {t("seeAll")}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
        </div>
      </ScrollReveal>
    </Section>
  );
}
