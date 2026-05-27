import { getTranslations } from "next-intl/server";
import { getTranslationQueue } from "@/app/actions/translations";
import TranslationQueue from "./TranslationQueue";

export default async function TranslationsPage() {
  const items = await getTranslationQueue();
  const t = await getTranslations("adminTranslations");

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("title")}</h1>
        <p className="text-sm text-(--text-muted) mt-1">
          {t("description", { count: items.length })}
        </p>
        <p className="text-xs text-(--text-muted) mt-2">
          {t.rich("instruction", {
            command: (chunks) => (
              <code className="text-(--accent-cyan)">{chunks}</code>
            ),
          })}
        </p>
      </div>

      <TranslationQueue initialItems={items} />
    </div>
  );
}
