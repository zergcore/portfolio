import { getAdminEducation } from "@/lib/adminApi";
import { getTranslations } from "next-intl/server";
import EducationClient from "./EducationClient";

export const revalidate = 0;

export default async function AdminEducationPage() {
  const education = await getAdminEducation();
  const t = await getTranslations("adminEducation");

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

      <EducationClient initialEducation={education} />
    </div>
  );
}
