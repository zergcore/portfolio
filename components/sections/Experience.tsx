import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getExperience } from "@/lib/api";

export default async function Experience() {
  const experiences = await getExperience();
  return (
    <Section id="experience">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Professional <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">Experience</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            My career journey, highlighting roles where I led architecture, optimized performance, and shipped scalable products.
          </p>
        </div>
      </ScrollReveal>

      <div className="relative max-w-4xl mx-auto">
        {/* Central Vertical Line (Desktop Only) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-[var(--border-subtle)] -translate-x-1/2" />

        <div className="flex flex-col gap-12">
          {experiences.map((exp, idx) => {
            // Alternate left/right for desktop
            const isEven = idx % 2 === 0;

            return (
              <ScrollReveal key={exp.id} delay={0.1 * (idx + 1)}>
                <div className={`relative flex flex-col md:flex-row items-center gap-8 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                  
                  {/* Timeline Dot (Desktop) */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--bg-base)] border-2 border-[var(--accent-cyan)] z-10" />

                  {/* Content Box */}
                  <div className="w-full md:w-[calc(50%-2rem)] bg-[var(--bg-elevated)] p-6 md:p-8 rounded-xl border border-[var(--border-subtle)] hover:border-[var(--accent-violet)]/40 transition-colors shadow-sm">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-4 border-b border-[var(--border-subtle)]">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{exp.role}</h3>
                        <p className="text-[var(--accent-cyan)] font-medium">{exp.company}</p>
                      </div>
                      <span className="text-sm font-mono text-[var(--text-muted)] bg-[var(--bg-surface)] px-3 py-1 rounded-full whitespace-nowrap self-start md:self-auto">
                        {exp.dateRange}
                      </span>
                    </div>

                    {/* Description List */}
                    <ul className="list-disc list-inside space-y-2 mb-6">
                      {exp.description.map((desc, i) => (
                        <li key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          <span className="-ml-2">{desc}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2">
                      {exp.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-medium text-[var(--text-primary)] bg-[var(--bg-surface)] px-2.5 py-1 rounded-md border border-[var(--border-default)]"
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
