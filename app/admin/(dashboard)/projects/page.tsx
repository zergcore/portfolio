import { getProjects, getSkillsFlat } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import ProjectsClient from "./ProjectsClient";

export const revalidate = 0;

export default async function AdminProjectsPage() {
  const [projects, allSkills] = await Promise.all([
    getProjects(),
    getSkillsFlat(),
  ]);
  const t = await getTranslations("adminProjects");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary) mt-2">{t("pageDescription")}</p>
      </div>

      <ProjectsClient initialProjects={projects} allSkills={allSkills} />
    </div>
  );
}
