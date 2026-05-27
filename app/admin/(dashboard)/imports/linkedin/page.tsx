import LinkedInImportClient from "./LinkedInImportClient";
import { getTranslations } from "next-intl/server";

export default async function LinkedInImportPage() {
  const t = await getTranslations("adminImports");

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary)">
          {t("pageTitle")}
        </h1>
        <p className="text-sm text-(--text-muted) mt-1">
          {t("pageDescription")}
        </p>
      </div>

      {/* How-to instructions */}
      <div className="rounded-xl border border-(--border-subtle) bg-(--bg-surface) p-6 space-y-4">
        <h2 className="text-base font-semibold text-(--text-primary)">
          {t("howToGet")}
        </h2>
        <ol className="space-y-3 text-sm text-(--text-secondary)">
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              1
            </span>
            <span>{t("step1")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              2
            </span>
            <span>{t("step2")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              3
            </span>
            <span>{t("step3")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              4
            </span>
            <span>{t("step4")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              5
            </span>
            <span>{t("step5")}</span>
          </li>
          <li className="flex gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-(--accent-violet)/15 text-(--accent-violet) text-xs font-bold flex items-center justify-center">
              6
            </span>
            <span>{t("step6")}</span>
          </li>
        </ol>

        <div className="mt-4 rounded-lg bg-(--bg-elevated) border border-(--border-subtle) px-4 py-3 text-xs text-(--text-muted)">
          {t("privacyNote")}
        </div>
      </div>

      {/* Upload + preview client component */}
      <LinkedInImportClient />
    </div>
  );
}
