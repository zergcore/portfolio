import { getApplicationPreferences } from "@/app/actions/applicationPreferences";
import PreferencesForm from "./PreferencesForm";

export default async function ApplicationPreferencesPage() {
  const prefs = await getApplicationPreferences();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
          Application Preferences
        </h1>
        <p className="text-[var(--text-secondary)]">
          The single source of truth for structured application fields — start dates, work
          authorization, salary expectations, and EEOC demographics. The browser extension
          reads this to fill dropdowns, date pickers, and radio groups automatically, so
          the AI never has to guess or infer protected information from your bio.
        </p>
      </div>

      <div className="bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] overflow-hidden">
        <PreferencesForm initialPrefs={prefs} />
      </div>
    </div>
  );
}
