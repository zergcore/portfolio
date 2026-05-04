import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt, FaArrowRight } from "react-icons/fa";
import type { Project } from "@/lib/mockData";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-violet)]/50 transition-all duration-300 hover:shadow-glow-violet hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-overlay)]">
        {/* Placeholder gradient just in case image fails or is loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)]" />
        
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Overlay gradient for text readability if we want overlay styles, but we are doing stacked layout */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/80 to-transparent opacity-0 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors">
          {project.title}
        </h3>
        
        <p className="text-sm text-[var(--text-secondary)] line-clamp-3 mb-4 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium rounded-md bg-[var(--bg-surface)] text-[var(--accent-cyan)] border border-[var(--border-default)]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-[var(--border-subtle)]">
          {project.caseStudyUrl ? (
            <Link
              href={project.caseStudyUrl}
              className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-cyan)] flex items-center gap-1.5 group/link"
            >
              Case Study
              <FaArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
            </Link>
          ) : null}

          <div className="flex-1" />

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="View source code on GitHub"
            >
              <FaGithub size={20} />
            </a>
          )}
          
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors"
              aria-label="View live demo"
            >
              <FaExternalLinkAlt size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
