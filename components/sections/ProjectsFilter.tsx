"use client";

import { useState } from "react";
import { useRouter, usePathname } from "@/lib/i18n/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/lib/i18n/navigation";
import type { Project } from "@/lib/mockData";
import type { ApiSkill, ApiProjectGroup, LocalizedText } from "@/lib/api";
import { ArrowRight, ExternalLink, X } from "lucide-react";

type GroupMode = "none" | "category" | "primary_skill";

const CHIP_LIMIT = 12;

interface Props {
  allSkills: ApiSkill[];
  projects: Project[];
  groups: ApiProjectGroup[];
  selectedSkillIds: string[];
  groupMode: GroupMode;
  locale: string;
}

function getLocalizedLabel(label: LocalizedText | string, locale: string): string {
  if (typeof label === "string") return label;
  return label[locale as keyof LocalizedText] || label.en || "";
}

function ProjectArticle({ project, t }: { project: Project; t: ReturnType<typeof useTranslations> }) {
  return (
    <article className="group flex flex-col rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/40 transition-all duration-300 overflow-hidden">
      <div className="relative h-48 bg-[var(--bg-surface)] overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="absolute top-0 left-0 right-0 h-1 bg-[image:var(--gradient-brand)] opacity-60 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-default)]"
            >
              {tag}
            </span>
          ))}
        </div>

        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-cyan)] transition-colors">
          {project.title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed flex-1 mb-6 line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-auto">
          {project.caseStudyUrl && (
            <Link
              href={project.caseStudyUrl as `/projects/${string}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--accent-cyan)] hover:underline"
            >
              {t("caseStudy")}
              <ArrowRight size={14} />
            </Link>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <ExternalLink size={13} />
              {t("liveDemo")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function ProjectsFilter({
  allSkills,
  projects,
  groups,
  selectedSkillIds,
  groupMode,
  locale,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("projects");
  const [showAllChips, setShowAllChips] = useState(false);

  function buildUrl(skillIds: string[], mode: GroupMode) {
    const params = new URLSearchParams();
    if (skillIds.length) params.set("skills", skillIds.join(","));
    if (mode !== "none") params.set("group", mode);
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function toggleSkill(id: string) {
    const next = selectedSkillIds.includes(id)
      ? selectedSkillIds.filter(x => x !== id)
      : [...selectedSkillIds, id];
    router.push(buildUrl(next, groupMode));
  }

  function setGroupMode(mode: GroupMode) {
    router.push(buildUrl(selectedSkillIds, mode));
  }

  function clearFilters() {
    setShowAllChips(false);
    router.push(pathname);
  }

  const hasFilters = selectedSkillIds.length > 0;

  // Ensure selected chips are always visible even if beyond CHIP_LIMIT
  const hasHiddenSelected =
    !showAllChips &&
    allSkills.slice(CHIP_LIMIT).some(s => selectedSkillIds.includes(s.id));
  const expanded = showAllChips || hasHiddenSelected;
  const visibleSkills = expanded ? allSkills : allSkills.slice(0, CHIP_LIMIT);
  const hiddenCount = allSkills.length - visibleSkills.length;

  const GROUP_MODES: { value: GroupMode; labelKey: string }[] = [
    { value: "none", labelKey: "groupByNone" },
    { value: "category", labelKey: "groupByCategory" },
    { value: "primary_skill", labelKey: "groupByPrimarySkill" },
  ];

  const isEmpty = groupMode === "none" ? projects.length === 0 : groups.length === 0;

  return (
    <div className="space-y-8">
      {/* Filter bar */}
      <div className="flex flex-col gap-4">
        {allSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {t("filterBySkills")}
            </span>
            {visibleSkills.map(s => {
              const active = selectedSkillIds.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className={[
                    "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-all",
                    active
                      ? "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/40"
                      : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--accent-cyan)]/30",
                  ].join(" ")}
                >
                  {s.name.en || s.name.es || ""}
                  {active && <X size={10} />}
                </button>
              );
            })}
            {hiddenCount > 0 && (
              <button
                onClick={() => setShowAllChips(true)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors px-2 py-1 rounded-full border border-dashed border-[var(--border-default)]"
              >
                +{hiddenCount} {t("moreFilters")}
              </button>
            )}
            {showAllChips && allSkills.length > CHIP_LIMIT && (
              <button
                onClick={() => setShowAllChips(false)}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors underline"
              >
                {t("showFewer")}
              </button>
            )}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--color-error)] transition-colors underline"
              >
                {t("clearFilters")}
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
            {t("groupBy")}
          </span>
          <div className="flex rounded-lg border border-[var(--border-default)] overflow-hidden">
            {GROUP_MODES.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setGroupMode(value)}
                className={[
                  "px-3 py-1.5 text-xs font-medium transition-colors",
                  groupMode === value
                    ? "bg-[var(--accent-violet)]/15 text-[var(--accent-violet)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]",
                ].join(" ")}
              >
                {t(labelKey as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {isEmpty ? (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-[var(--text-secondary)]">{t("noProjectsMatch")}</p>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-[var(--accent-cyan)] hover:underline"
            >
              {t("clearFilters")}
            </button>
          )}
        </div>
      ) : groupMode === "none" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {projects.map(p => <ProjectArticle key={p.id} project={p} t={t} />)}
        </div>
      ) : (
        <div className="space-y-12">
          {groups.map(group => (
            <section key={group.key}>
              <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                <span className="w-8 h-0.5 bg-[var(--accent-cyan)] inline-block" />
                {getLocalizedLabel(group.label, locale)}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                {group.items.map(p => {
                  const primaryImage =
                    p.images?.find(img => img.is_primary)?.url || p.image_url || "/placeholder-project.svg";
                  const displayProject: Project = {
                    id: p.id,
                    slug: p.slug,
                    title: typeof p.title === "string" ? p.title : p.title.en || "",
                    description: typeof p.description === "string" ? p.description : p.description.en || "",
                    imageUrl: primaryImage,
                    images: p.images || [],
                    tags: p.tags || [],
                    githubUrl: p.github_url || undefined,
                    liveUrl: p.live_url || undefined,
                    caseStudyUrl: p.problem || p.role ? `/projects/${p.slug}` : undefined,
                    is_featured: p.is_featured,
                    sort_order: p.sort_order,
                  };
                  return <ProjectArticle key={p.id} project={displayProject} t={t} />;
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
