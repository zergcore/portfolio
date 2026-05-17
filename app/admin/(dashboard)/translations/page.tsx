import { getTranslationQueue } from "@/app/actions/translations";
import TranslationQueue from "./TranslationQueue";

export default async function TranslationsPage() {
  const items = await getTranslationQueue();

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Translation Queue</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Fields missing a Spanish translation.{" "}
          {items.length > 0
            ? `${items.length} field${items.length !== 1 ? "s" : ""} need attention.`
            : "Everything is translated."}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-2">
          Run <code className="text-[var(--accent-cyan)]">python -m app.tools.translate_seed</code> to
          pre-populate AI drafts for all missing fields, then review and publish each one here.
        </p>
      </div>

      <TranslationQueue initialItems={items} />
    </div>
  );
}
