import ProjectsFilter from "@/components/sections/ProjectsFilter";

import { getProjectsRaw, getProjectsGrouped, getSkillsFlat, mapApiProject } from "@/lib/api";

type GroupMode = "none" | "category" | "primary_skill";

export async function ProjectsDirectory({
    searchParamsPromise,
    locale,
}: {
    searchParamsPromise: Promise<{ skills?: string; group?: string }>;
    locale: string;
}) {
    // Await the search parameters inside the suspense boundary
    const { skills: rawSkills, group: rawGroup } = await searchParamsPromise;

    const selectedSkillIds = rawSkills ? rawSkills.split(",").filter(Boolean) : [];
    const groupMode: GroupMode =
        rawGroup === "category" || rawGroup === "primary_skill" ? rawGroup : "none";

    // Parallel fetch all required data
    const [allSkills, allProjectsRaw, filteredRaw, groups] = await Promise.all([
        getSkillsFlat(),
        getProjectsRaw(), // Required to compute which skills exist in the dataset
        groupMode === "none" ? getProjectsRaw({ skills: selectedSkillIds }) : Promise.resolve([]),
        groupMode !== "none" ? getProjectsGrouped({ skills: selectedSkillIds, group: groupMode }) : Promise.resolve([]),
    ]);

    // Derive used skills securely
    const usedSkillIds = new Set(allProjectsRaw.flatMap((p) => p.skills.map((s) => s.id)));
    const chipSkills = allSkills.filter((s) => usedSkillIds.has(s.id));
    // Map with the active locale so titles/descriptions are in the right language
    const projects = filteredRaw.map((p) => mapApiProject(p, locale));

    return (
        <ProjectsFilter
            allSkills={chipSkills}
            projects={projects}
            groups={groups}
            selectedSkillIds={selectedSkillIds}
            groupMode={groupMode}
            locale={locale}
        />
    );
}
