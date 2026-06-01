import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getEducation, getProjects } from "@/lib/api";
import { GraduationCap, Award, ExternalLink } from "lucide-react";
import type { Project } from "@/lib/mockData";

function getRelatedProjects(ids: string[] | undefined, projects: Project[]) {
  if (!ids || ids.length === 0) return [];
  return projects.filter((p) => ids.includes(p.id) || ids.includes(p.slug));
}

export default async function Education() {
  const locale = await getLocale();
  const [eduData, projects, t] = await Promise.all([
    getEducation(locale),
    getProjects({ locale }),
    getTranslations("education"),
  ]);
  const { degrees: education, certifications } = eduData;
  return (
    <Section
      id="education"
      className="bg-background border-y border-(--border-subtle)"
    >
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("sectionTitle")}{" "}
            <span className="text-transparent bg-clip-text bg-[image:--gradient-brand]">
              {t("sectionHighlight")}
            </span>
          </h2>
          <p className="text-(--text-secondary) max-w-2xl">
            {t("sectionDescription")}
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        {/* Left Column: Formal Education */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-(--accent-violet)/10 text-(--accent-violet) border border-(--accent-violet)/20">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {t("formalEducation")}
              </h3>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-6">
            {education.map((edu, idx) => {
              const related = getRelatedProjects(
                edu.relatedProjectIds,
                projects,
              );
              return (
                <ScrollReveal key={edu.id} delay={0.2 + idx * 0.1}>
                  <div className="group flex flex-col p-6 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) hover:border-(--accent-violet)/40 hover:shadow-sm transition-all">
                    {/* Optional badge image */}
                    {edu.imageUrl && (
                      <div className="relative w-16 h-16 mb-4 rounded-lg overflow-hidden bg-(--bg-surface)">
                        <Image
                          src={edu.imageUrl}
                          alt={edu.degree}
                          fill
                          className="object-contain"
                          sizes="64px"
                        />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-lg font-bold text-foreground group-hover:text-(--accent-violet) transition-colors">
                        {edu.degree}
                      </h4>
                      {edu.status && (
                        <span
                          className={`shrink-0 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full border ${
                            edu.status === "graduated"
                              ? "bg-(--accent-cyan)/10 text-(--accent-cyan) border-(--accent-cyan)/30"
                              : edu.status === "in_course"
                                ? "bg-(--accent-violet)/10 text-(--accent-violet) border-(--accent-violet)/30"
                                : "bg-(--bg-surface) text-(--text-muted) border-(--border-default)"
                          }`}
                        >
                          {edu.status === "graduated"
                            ? t("status.graduated")
                            : edu.status === "in_course"
                              ? t("status.inCourse")
                              : t("status.unfinished")}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2 mb-4">
                      <span className="text-(--text-secondary) font-medium">
                        {edu.institution}
                      </span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-(--bg-surface) text-(--text-muted) border border-(--border-default)">
                        {edu.dateRange}
                      </span>
                    </div>
                    <p className="text-sm text-(--text-secondary) leading-relaxed">
                      {edu.description}
                    </p>

                    {/* Related Projects */}
                    {related.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-(--border-subtle)">
                        <span className="text-xs uppercase tracking-wider font-semibold text-(--text-muted) mb-2 block">
                          {t("relatedProjects")}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {related.map((proj) => (
                            <Link
                              key={proj.id}
                              href={`#projects`}
                              className="text-xs font-medium px-2.5 py-1 rounded-md bg-(--accent-violet)/10 text-(--accent-violet) border border-(--accent-violet)/20 hover:bg-(--accent-violet)/20 transition-colors"
                            >
                              {proj.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>

        {/* Right Column: Certifications */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.3}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-(--accent-cyan)/10 text-(--accent-cyan) border border-(--accent-cyan)/20">
                <Award size={24} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {t("certifications")}
              </h3>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            {certifications.map((cert, idx) => {
              const related = getRelatedProjects(
                cert.relatedProjectIds,
                projects,
              );
              return (
                <ScrollReveal key={cert.id} delay={0.4 + idx * 0.1}>
                  <div className="group flex flex-col p-5 rounded-xl bg-(--bg-elevated) border border-(--border-subtle) hover:border-(--accent-cyan)/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Optional cert badge image */}
                        {cert.imageUrl && (
                          <div className="relative w-10 h-10 shrink-0 rounded-md overflow-hidden bg-(--bg-surface)">
                            <Image
                              src={cert.imageUrl}
                              alt={cert.name}
                              fill
                              className="object-contain"
                              sizes="40px"
                            />
                          </div>
                        )}

                        <div className="flex flex-col gap-1 min-w-0">
                          <h4 className="font-bold text-foreground group-hover:text-(--accent-cyan) transition-colors truncate">
                            {cert.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-(--text-secondary)">
                            <span className="font-medium">{cert.issuer}</span>
                            <span className="w-1 h-1 rounded-full bg-(--border-strong)" />
                            <span className="text-(--text-muted)">
                              {cert.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {cert.url && (
                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 p-2 rounded-full text-(--text-muted) hover:text-(--accent-cyan) hover:bg-(--accent-cyan)/10 transition-colors"
                          aria-label={`View certification for ${cert.name}`}
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>

                    {/* Related Projects */}
                    {related.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-(--border-subtle)">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-(--text-muted) mb-1.5 block">
                          {t("appliedIn")}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {related.map((proj) => (
                            <Link
                              key={proj.id}
                              href={`#projects`}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-(--accent-cyan)/10 text-(--accent-cyan) border border-(--accent-cyan)/20 hover:bg-(--accent-cyan)/20 transition-colors"
                            >
                              {proj.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}
