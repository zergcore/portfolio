import { getAdminExperience } from "@/lib/adminApi";
import ExperienceClient from "./ExperienceClient";

export const revalidate = 0;

export default async function AdminExperiencePage() {
  const experiences = await getAdminExperience();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Manage Experience
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Keep your professional timeline up to date.
        </p>
      </div>

      <ExperienceClient initialExperiences={experiences} />
    </div>
  );
}
