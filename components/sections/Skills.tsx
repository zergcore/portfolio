import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { getSkills } from "@/lib/api";

export default async function Skills() {
  const skills = await getSkills();
  return (
    <Section id="skills" className="bg-[var(--bg-elevated)]/30 border-y border-[var(--border-subtle)]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Technical <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">Skills</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            A comprehensive overview of my technical stack and expertise acquired over 6+ years of professional development.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {skills.map((category, idx) => (
          <ScrollReveal key={category.title} delay={0.1 * (idx + 1)}>
            <div className="flex flex-col h-full bg-[var(--bg-surface)] rounded-xl p-6 border border-[var(--border-subtle)] shadow-sm hover:border-[var(--accent-cyan)]/30 transition-colors duration-300">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 pb-4 border-b border-[var(--border-subtle)]">
                {category.title}
              </h3>
              
              <div className="flex flex-col gap-4 flex-1">
                {category.skills.map((skill) => (
                  <div key={skill.name} className="flex flex-col gap-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-medium text-[var(--text-primary)]">{skill.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">{skill.years} yrs</span>
                    </div>
                    
                    {skill.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {skill.tags.map(tag => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-secondary)] bg-[var(--bg-base)] px-2 py-0.5 rounded-sm border border-[var(--border-default)]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
