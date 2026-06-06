import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import type { Project } from "@/lib/mockData";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl bg-(--bg-elevated) border border-(--border-subtle) hover:border-(--accent-violet)/50 transition-all duration-300 hover:shadow-glow-violet hover:-translate-y-1">
      {/* Stretched card link — makes the entire card surface clickable */}
      <Link
        href={`/projects/${project.slug}` as `/projects/${string}`}
        className="absolute inset-0 z-0 rounded-xl"
        aria-label={project.title}
      />
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-(--bg-overlay)">
        {/* Placeholder gradient just in case image fails or is loading */}
        <div className="absolute inset-0 bg-linear-to-br from-(--bg-surface) to-(--bg-elevated)" />

        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Overlay gradient for text readability if we want overlay styles, but we are doing stacked layout */}
        <div className="absolute inset-0 bg-linear-to-t from-(--bg-base)/80 to-transparent opacity-0 transition-opacity duration-300" />
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 p-6">
        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-(--accent-cyan) transition-colors">
          {project.title}
        </h3>

        <p className="text-sm text-(--text-secondary) line-clamp-3 mb-4 flex-1">
          {project.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium rounded-md bg-(--bg-surface) text-(--accent-cyan) border border-(--border-default)"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions — icon links sit above the card-level stretched link */}
        <div className="flex items-center gap-4 mt-auto pt-4 border-t border-(--border-subtle)">
          <div className="flex-1" />

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 text-(--text-secondary) hover:text-foreground transition-colors"
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
              className="relative z-10 text-(--text-secondary) hover:text-(--accent-cyan) transition-colors"
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
