import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/navigation";
import Section from "@/components/ui/Section";
import CTABanner from "@/components/ui/CTABanner";
import Container from "@/components/ui/Container";
import ProjectsFilter from "@/components/sections/ProjectsFilter";
import { getProjectsRaw, getProjectsGrouped, getSkillsFlat, mapApiProject } from "@/lib/api";
import { buildMetadata } from "@/lib/metadata";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata() {
  const t = await getTranslations("projects");
  return buildMetadata({
    title: "Projects | Zergcore.dev",
    description: t("pageDescription"),
    path: "projects",
  });
}

type GroupMode = "none" | "category" | "primary_skill";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ skills?: string; group?: string }>;
}

export default async function ProjectsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { skills: rawSkills, group: rawGroup } = await searchParams;

  const selectedSkillIds = rawSkills ? rawSkills.split(",").filter(Boolean) : [];
  const groupMode: GroupMode =
    rawGroup === "category" || rawGroup === "primary_skill" ? rawGroup : "none";

  const [t, tCta, allSkills, allProjectsRaw, filteredRaw, groups] = await Promise.all([
    getTranslations("projects"),
    getTranslations("cta"),
    getSkillsFlat(),
    // Fetch all projects (no skill filter) to compute which skills are actually linked
    getProjectsRaw(),
    groupMode === "none"
      ? getProjectsRaw({ skills: selectedSkillIds })
      : Promise.resolve([]),
    groupMode !== "none"
      ? getProjectsGrouped({ skills: selectedSkillIds, group: groupMode })
      : Promise.resolve([]),
  ]);

  // Only show chips for skills that are actually linked to at least one project
  const usedSkillIds = new Set(allProjectsRaw.flatMap(p => p.skills.map(s => s.id)));
  const chipSkills = allSkills.filter(s => usedSkillIds.has(s.id));
  const projects = filteredRaw.map(mapApiProject);

  return (
    <>

      <main className="flex-1 flex flex-col">
        <Section id="projects-listing" className="pt-32">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors mb-12"
          >
            <ArrowLeft size={14} />
            {t("backToProjects")}
          </Link>

          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">
              {t("pageTitle")}{" "}
              <span className="text-transparent bg-clip-text bg-[image:var(--gradient-brand)]">
                {t("pageTitleHighlight")}
              </span>
            </h1>
            <p className="text-[var(--text-secondary)] max-w-2xl">
              {t("pageDescription")}
            </p>
          </div>

          <ProjectsFilter
            allSkills={chipSkills}
            projects={projects}
            groups={groups}
            selectedSkillIds={selectedSkillIds}
            groupMode={groupMode}
            locale={locale}
          />
        </Section>

        <Container className="py-8">
          <CTABanner
            headline={tCta("afterProjects.headline")}
            subtext={tCta("afterProjects.subtext")}
            buttonLabel={tCta("afterProjects.button")}
            href="/contact"
            variant="gradient"
          />
        </Container>
      </main>

    </>
  );
}
