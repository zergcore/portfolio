import { getProfile } from "@/lib/api";
import { getTranslations } from "next-intl/server";
import ProfileForm from "./ProfileForm";

export default async function AdminProfilePage() {
  const profile = await getProfile();
  const t = await getTranslations("adminProfile");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary)">{t("pageDescription")}</p>
      </div>

      <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) overflow-hidden">
        <ProfileForm initialProfile={profile} />
      </div>
    </div>
  );
}
