import { getLocale, getTranslations } from "next-intl/server";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getExperience } from "@/lib/api";

export default async function Experience() {
  const locale = await getLocale();
  const [experiences, t] = await Promise.all([
    getExperience(locale),
    getTranslations("experience"),
  ]);
  return (
    <Section id="experience">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
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

      <div className="relative max-w-4xl mx-auto">
        {/* Central Vertical Line (Desktop Only) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-(--border-subtle) -translate-x-1/2" />

        <div className="flex flex-col gap-12">
          {experiences.map((exp, idx) => {
            // Alternate left/right for desktop
            const isEven = idx % 2 === 0;

            return (
              <ScrollReveal key={`exp-${exp.company}-${idx}-${exp.id}`} delay={0.1 * (idx + 1)}>
                <div
                  className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? "md:flex-row-reverse" : ""}`}
                >
                  {/* Timeline Dot (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-background border-2 border-(--accent-cyan) z-10" />

                  {/* Content Box */}
                  <div className="w-full md:w-[calc(50%-2rem)] bg-(--bg-elevated) p-6 md:p-8 rounded-xl border border-(--border-subtle) hover:border-(--accent-violet)/40 transition-colors shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-4 border-b border-(--border-subtle)">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {exp.role}
                        </h3>
                        <p className="text-(--accent-cyan) font-medium">
                          {exp.company}
                        </p>
                      </div>
                      <span className="text-sm font-mono text-(--text-muted) bg-(--bg-surface) px-3 py-1 rounded-full whitespace-nowrap self-start md:self-auto">
                        {exp.dateRange}
                      </span>
                    </div>

                    {/* Description List */}
                    <ul className="list-disc list-inside space-y-2 mb-6">
                      {exp.description.map((desc, i) => (
                        <li
                          key={`desc-${exp.id}-${i}`}
                          className="text-sm text-(--text-secondary) leading-relaxed"
                        >
                          <span className="-ml-2">{desc}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {exp.techStack.map((tech, i) => (
                        <span
                          key={`tech-${exp.id}-${tech}-${i}`}
                          className="text-xs font-medium text-foreground bg-(--bg-surface) px-2.5 py-1 rounded-md border border-(--border-default)"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
