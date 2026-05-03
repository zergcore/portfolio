import Section from "@/components/ui/Section";
import ScrollReveal from "@/components/ui/ScrollReveal";
import ProjectCard from "@/components/cards/ProjectCard";
import { mockProjects } from "@/lib/mockData";

export default function Projects() {
  return (
    <Section id="projects">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-4">
            Featured <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">Projects</span>
          </h2>
          <p className="text-[var(--text-secondary)] max-w-2xl">
            A selection of my recent work, focusing on scalable architecture, AI integrations, and high-performance interfaces.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {mockProjects.map((project, index) => (
          <ScrollReveal key={project.id} delay={0.1 * (index + 1)}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </Section>
  );
}
