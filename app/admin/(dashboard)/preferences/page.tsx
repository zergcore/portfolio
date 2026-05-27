import { getApplicationPreferences } from "@/app/actions/applicationPreferences";
import { getTranslations } from "next-intl/server";
import PreferencesForm from "./PreferencesForm";

export default async function ApplicationPreferencesPage() {
  const prefs = await getApplicationPreferences();
  const t = await getTranslations("adminPreferences");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-(--text-secondary)">
          {t("pageDescription")}
        </p>
      </div>

      <div className="bg-(--bg-surface) rounded-2xl border border-(--border-subtle) overflow-hidden">
        <PreferencesForm initialPrefs={prefs} />
      </div>
    </div>
  );
}
