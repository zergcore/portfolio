import { getAdminSkills, getAdminSkillCategories } from "@/lib/adminApi";
import { getTranslations } from "next-intl/server";
import SkillsClient from "./SkillsClient";

export const revalidate = 0;

export default async function AdminSkillsPage() {
  const [skills, categories] = await Promise.all([
    getAdminSkills(),
    getAdminSkillCategories()
  ]);
  const t = await getTranslations("adminSkills");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary) mt-2">
          {t("pageDescription")}
        </p>
      </div>

      <SkillsClient initialSkills={skills} categories={categories} />
    </div>
  );
}
