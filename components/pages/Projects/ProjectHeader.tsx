import { Clock, ExternalLink, GitBranch, User } from "lucide-react";
import { ServerTranslation } from "@/lib/i18n/navigation";
import { Project } from "@/lib/mockData";

export default function ProjectHeader({
  project,
  t,
}: {
  project: Project;
  t: ServerTranslation;
}) {
  return (
    <header className="mb-12">
      <div
        className="mb-5 flex flex-wrap gap-2"
        aria-label={t("tags") || "Tags"}
      >
        {project.tags.map((tag: string) => (
          <span
            key={tag}
            className="rounded-md border border-(--border-default) bg-(--bg-elevated) px-2.5 py-1 font-mono text-xs text-(--text-secondary)"
          >
            {tag}
          </span>
        ))}
      </div>

      <h1 className="mb-6 text-3xl font-black leading-tight tracking-tight text-foreground md:text-5xl">
        {project.title}
      </h1>

      {project.description && (
        <p className="mb-6 text-lg leading-relaxed text-(--text-secondary) text-justify">
          {project.description}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-6 border-b border-(--border-subtle) pb-6 text-sm text-(--text-muted)">
        {project.role && (
          <span className="flex items-center gap-2">
            <User
              size={16}
              aria-hidden="true"
              className="text-(--accent-cyan)"
            />
            {project.role}
          </span>
        )}
        {project.timeline && (
          <span className="flex items-center gap-2">
            <Clock
              size={16}
              aria-hidden="true"
              className="text-(--accent-cyan)]"
            />
            {project.timeline}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-4">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-(image:--gradient-brand) px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <ExternalLink size={16} aria-hidden="true" />
            {t("liveDemo")}
          </a>
        )}
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-(--border-strong) bg-(--bg-elevated) px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-(--accent-cyan) hover:bg-(--accent-cyan)/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--accent-cyan) focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <GitBranch size={16} aria-hidden="true" />
            {t("viewCode")}
          </a>
        )}
      </div>
    </header>
  );
}
