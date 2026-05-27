import { getAdminExperience } from "@/lib/adminApi";
import { getTranslations } from "next-intl/server";
import ExperienceClient from "./ExperienceClient";

export const revalidate = 0;

export default async function AdminExperiencePage() {
  const experiences = await getAdminExperience();
  const t = await getTranslations("adminExperience");

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary) mt-2">{t("pageDescription")}</p>
      </div>

      <ExperienceClient initialExperiences={experiences} />
    </div>
  );
}
