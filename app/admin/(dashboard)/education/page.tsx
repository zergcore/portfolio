import { getAdminEducation } from "@/lib/adminApi";
import EducationClient from "./EducationClient";

export const revalidate = 0;

export default async function AdminEducationPage() {
  const education = await getAdminEducation();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Education & Certifications
        </h1>
        <p className="text-[var(--text-secondary)] mt-2">
          Manage your academic background and professional certifications.
        </p>
      </div>

      <EducationClient initialEducation={education} />
    </div>
  );
}
