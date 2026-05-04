import { getAdminSkills, getAdminSkillCategories } from "@/lib/adminApi";
import SkillsClient from "./SkillsClient";
export const revalidate = 0;

export default async function AdminSkillsPage() {
  const [skills, categories] = await Promise.all([
    getAdminSkills(),
    getAdminSkillCategories()
  ]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Manage Skills
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Showcase your expertise and technical toolkit.
        </p>
      </div>

      <SkillsClient initialSkills={skills} categories={categories} />
    </div>
  );
}
