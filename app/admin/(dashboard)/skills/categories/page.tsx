import { getAdminSkillCategories } from "@/lib/adminApi";
import CategoriesClient from "./CategoriesClient";

export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getAdminSkillCategories();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Skill Categories
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Manage the groups used to organize your technical expertise.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} />
    </div>
  );
}
