import Image from "next/image";
import Link from "next/link";
import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { mockEducation, mockCertifications, mockProjects } from "@/lib/mockData";
import { GraduationCap, Award, ExternalLink } from "lucide-react";

/** Resolve an array of project IDs into their project objects */
function getRelatedProjects(ids?: string[]) {
  if (!ids || ids.length === 0) return [];
  return mockProjects.filter((p) => ids.includes(p.id));
}

export default function Education() {
  return (
    <Section id="education" className="bg-[var(--bg-base)] border-y border-[var(--border-subtle)]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Education & <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">Certifications</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            My academic background and continuous learning achievements.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
        
        {/* Left Column: Formal Education */}
        <div className="flex flex-col gap-6">
          <ScrollReveal delay={0.1}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-lg bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] border border-[var(--accent-violet)]/20">
                <GraduationCap size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Formal Education</h3>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-6">
            {mockEducation.map((edu, idx) => {
              const related = getRelatedProjects(edu.relatedProjectIds);
              return (
                <ScrollReveal key={edu.id} delay={0.2 + (idx * 0.1)}>
                  <div className="group flex flex-col p-6 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-violet)]/40 hover:shadow-sm transition-all">
                    
                    {/* Optional badge image */}
                    {edu.imageUrl && (
                      <div className="relative w-16 h-16 mb-4 rounded-lg overflow-hidden bg-[var(--bg-surface)]">
                        <Image src={edu.imageUrl} alt={edu.degree} fill className="object-contain" sizes="64px" />
                      </div>
                    )}

                    <h4 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-violet)] transition-colors">
                      {edu.degree}
                    </h4>
                    <div className="flex justify-between items-center mt-2 mb-4">
                      <span className="text-[var(--text-secondary)] font-medium">{edu.institution}</span>
                      <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]">
                        {edu.dateRange}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {edu.description}
                    </p>

                    {/* Related Projects */}
                    {related.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-[var(--border-subtle)]">
                        <span className="text-xs uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-2 block">Related Projects</span>
                        <div className="flex flex-wrap gap-2">
                          {related.map((proj) => (
                            <Link
                              key={proj.id}
                              href={`#projects`}
                              className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] border border-[var(--accent-violet)]/20 hover:bg-[var(--accent-violet)]/20 transition-colors"
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
              <div className="p-2.5 rounded-lg bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20">
                <Award size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Certifications</h3>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-4">
            {mockCertifications.map((cert, idx) => {
              const related = getRelatedProjects(cert.relatedProjectIds);
              return (
                <ScrollReveal key={cert.id} delay={0.4 + (idx * 0.1)}>
                  <div className="group flex flex-col p-5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-all">
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Optional cert badge image */}
                        {cert.imageUrl && (
                          <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-[var(--bg-surface)]">
                            <Image src={cert.imageUrl} alt={cert.name} fill className="object-contain" sizes="40px" />
                          </div>
                        )}
                        
                        <div className="flex flex-col gap-1 min-w-0">
                          <h4 className="font-bold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors truncate">
                            {cert.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                            <span className="font-medium">{cert.issuer}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]" />
                            <span className="text-[var(--text-muted)]">{cert.date}</span>
                          </div>
                        </div>
                      </div>
                      
                      {cert.url && (
                        <a 
                          href={cert.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors"
                          aria-label={`View certification for ${cert.name}`}
                        >
                          <ExternalLink size={18} />
                        </a>
                      )}
                    </div>

                    {/* Related Projects */}
                    {related.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)]">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--text-muted)] mb-1.5 block">Applied In</span>
                        <div className="flex flex-wrap gap-1.5">
                          {related.map((proj) => (
                            <Link
                              key={proj.id}
                              href={`#projects`}
                              className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20 hover:bg-[var(--accent-cyan)]/20 transition-colors"
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
