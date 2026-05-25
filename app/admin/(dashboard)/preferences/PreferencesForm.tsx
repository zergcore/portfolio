"use client";

import { useState } from "react";
import { updateApplicationPreferencesAction } from "@/app/actions/applicationPreferences";
import { FiSave, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

type Prefs = {
  gender: string;
  gender_other_text: string | null;
  ethnicity: string;
  veteran_status: string;
  disability_status: string;
  lgbtq_status: string;
  earliest_start_mode: string;
  earliest_start_date: string | null;
  notice_period_weeks: number | null;
  willing_to_relocate: boolean;
  work_authorizations: string[];
  requires_sponsorship: boolean;
  city: string | null;
  country: string | null;
  timezone: string | null;
  work_mode_preference: string;
  salary_currency: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_period: string | null;
  salary_adjust_to_posting: boolean;
  application_language: string;
  show_translations: boolean;
  admin_language: string;
};

interface Props {
  initialPrefs: Prefs | null;
}

const DECLINE = "decline_to_answer";

const labelFor = {
  gender: {
    male: "Male", female: "Female", non_binary: "Non-binary",
    other: "Self-describe", [DECLINE]: "Prefer not to answer",
  } as Record<string, string>,
  ethnicity: {
    hispanic_or_latino: "Hispanic or Latino",
    white: "White (not Hispanic or Latino)",
    black_or_african_american: "Black or African American",
    native_hawaiian_or_pacific_islander: "Native Hawaiian or Other Pacific Islander",
    asian: "Asian",
    american_indian_or_alaska_native: "American Indian or Alaska Native",
    two_or_more_races: "Two or More Races",
    [DECLINE]: "Prefer not to answer",
  } as Record<string, string>,
  veteran_status: {
    protected_veteran: "Protected Veteran",
    not_a_veteran: "Not a Veteran",
    [DECLINE]: "Prefer not to answer",
  } as Record<string, string>,
  disability_status: {
    yes: "Yes", no: "No", [DECLINE]: "Prefer not to answer",
  } as Record<string, string>,
  lgbtq_status: {
    yes: "Yes", no: "No", [DECLINE]: "Prefer not to answer",
  } as Record<string, string>,
};

function Section({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="p-8 border-b border-[var(--border-subtle)] last:border-b-0">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-[var(--text-primary)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-violet)]" />
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--text-secondary)] mt-1">{description}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function SelectField({ label, name, value, options }: {
  label: string;
  name: string;
  value: string;
  options: Record<string, string>;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <select
        name={name}
        defaultValue={value}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
      >
        {Object.entries(options).map(([k, v]) => (
          <option key={k} value={k}>{v}</option>
        ))}
      </select>
    </div>
  );
}

function TextField({ label, name, defaultValue, placeholder }: {
  label: string;
  name: string;
  defaultValue?: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
      />
    </div>
  );
}

function NumberField({ label, name, defaultValue, placeholder }: {
  label: string;
  name: string;
  defaultValue?: number | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-[var(--text-secondary)]">{label}</label>
      <input
        type="number"
        name={name}
        defaultValue={defaultValue ?? ""}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
      />
    </div>
  );
}

function CheckboxField({ label, name, defaultChecked, description }: {
  label: string;
  name: string;
  defaultChecked: boolean;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-4 w-4 rounded border-[var(--border-subtle)] text-[var(--accent-violet)]"
      />
      <div>
        <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
        {description && (
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function PreferencesForm({ initialPrefs }: Props) {
  const p = initialPrefs;
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startMode, setStartMode] = useState(p?.earliest_start_mode ?? "negotiable");
  const [gender, setGender] = useState(p?.gender ?? DECLINE);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);

    const fd = new FormData(e.currentTarget);

    const authCodes = (fd.get("work_authorizations") as string || "")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    const data: Record<string, unknown> = {
      gender: fd.get("gender"),
      gender_other_text: (fd.get("gender_other_text") as string) || null,
      ethnicity: fd.get("ethnicity"),
      veteran_status: fd.get("veteran_status"),
      disability_status: fd.get("disability_status"),
      lgbtq_status: fd.get("lgbtq_status"),
      earliest_start_mode: fd.get("earliest_start_mode"),
      earliest_start_date: (fd.get("earliest_start_date") as string) || null,
      notice_period_weeks: fd.get("notice_period_weeks")
        ? Number(fd.get("notice_period_weeks"))
        : null,
      willing_to_relocate: fd.has("willing_to_relocate"),
      work_authorizations: authCodes,
      requires_sponsorship: fd.has("requires_sponsorship"),
      city: (fd.get("city") as string) || null,
      country: (fd.get("country") as string) || null,
      timezone: (fd.get("timezone") as string) || null,
      work_mode_preference: fd.get("work_mode_preference"),
      salary_currency: (fd.get("salary_currency") as string) || null,
      salary_min: fd.get("salary_min") ? Number(fd.get("salary_min")) : null,
      salary_max: fd.get("salary_max") ? Number(fd.get("salary_max")) : null,
      salary_period: (fd.get("salary_period") as string) || null,
      salary_adjust_to_posting: fd.has("salary_adjust_to_posting"),
      application_language: fd.get("application_language"),
      show_translations: fd.has("show_translations"),
      admin_language: fd.get("admin_language"),
    };

    const res = await updateApplicationPreferencesAction(data);
    setSubmitting(false);

    if (res.error) {
      setStatus({ type: "error", message: res.error });
    } else {
      setStatus({ type: "success", message: "Preferences saved." });
      setTimeout(() => setStatus(null), 3000);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {status && (
        <div
          className={`mx-8 mt-8 p-4 rounded-xl flex items-center gap-3 ${
            status.type === "success"
              ? "bg-green-500/10 border border-green-500/20 text-green-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {status.type === "success" ? <FiCheckCircle /> : <FiAlertCircle />}
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* ── Job Search Intent ─────────────────────────────────────────── */}
      <Section
        title="Job Search Intent"
        description="Work mode and location preferences shown to employers."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField
            label="Work mode preference"
            name="work_mode_preference"
            value={p?.work_mode_preference ?? "flexible"}
            options={{ remote: "Remote", hybrid: "Hybrid", onsite: "On-site", flexible: "Flexible" }}
          />
          <div className="space-y-3">
            <CheckboxField
              label="Willing to relocate"
              name="willing_to_relocate"
              defaultChecked={p?.willing_to_relocate ?? false}
            />
          </div>
        </div>
      </Section>

      {/* ── Availability ──────────────────────────────────────────────── */}
      <Section title="Availability">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Earliest start
            </label>
            <select
              name="earliest_start_mode"
              defaultValue={p?.earliest_start_mode ?? "negotiable"}
              onChange={(e) => setStartMode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
            >
              <option value="immediate">Immediately</option>
              <option value="date">Specific date</option>
              <option value="negotiable">Negotiable</option>
            </select>
          </div>

          {startMode === "date" && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">
                Start date
              </label>
              <input
                type="date"
                name="earliest_start_date"
                defaultValue={p?.earliest_start_date ?? ""}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
              />
            </div>
          )}

          <NumberField
            label="Notice period (weeks)"
            name="notice_period_weeks"
            defaultValue={p?.notice_period_weeks}
            placeholder="e.g. 2"
          />
        </div>
      </Section>

      {/* ── Location & Work Authorization ─────────────────────────────── */}
      <Section
        title="Location & Work Authorization"
        description="Country codes use ISO 3166-1 alpha-2 (ES, US, DE…). Authorized countries: comma-separated list of codes where you can work without sponsorship."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField label="City" name="city" defaultValue={p?.city} placeholder="Madrid" />
          <TextField label="Country (ISO code)" name="country" defaultValue={p?.country} placeholder="ES" />
          <TextField label="Timezone (IANA)" name="timezone" defaultValue={p?.timezone} placeholder="Europe/Madrid" />
          <TextField
            label="Authorized countries (comma-separated)"
            name="work_authorizations"
            defaultValue={p?.work_authorizations?.join(", ") ?? ""}
            placeholder="ES, EU"
          />
          <div className="md:col-span-2 space-y-3">
            <CheckboxField
              label="Requires sponsorship"
              name="requires_sponsorship"
              defaultChecked={p?.requires_sponsorship ?? true}
            />
          </div>
        </div>
      </Section>

      {/* ── Salary ────────────────────────────────────────────────────── */}
      <Section
        title="Salary Expectations"
        description="These values are returned as-is when a form asks for compensation. Leave blank to respond with 'Decline to answer'."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TextField
            label="Currency (ISO code)"
            name="salary_currency"
            defaultValue={p?.salary_currency}
            placeholder="USD"
          />
          <SelectField
            label="Period"
            name="salary_period"
            value={p?.salary_period ?? "annual"}
            options={{ annual: "Annual", monthly: "Monthly", hourly: "Hourly" }}
          />
          <NumberField label="Minimum" name="salary_min" defaultValue={p?.salary_min} placeholder="80000" />
          <NumberField label="Maximum" name="salary_max" defaultValue={p?.salary_max} placeholder="120000" />
          <div className="md:col-span-2">
            <CheckboxField
              label="Adjust salary to job posting range"
              name="salary_adjust_to_posting"
              defaultChecked={p?.salary_adjust_to_posting ?? false}
              description={
                "When enabled, if the job description advertises a salary range higher than your saved maximum, " +
                "the extension will quote the posting's range instead of your stored figures. " +
                "Useful when you'd accept the posted range even if it exceeds your baseline — " +
                "prevents under-bidding on high-paying roles while keeping your minimum as a floor."
              }
            />
          </div>
        </div>
      </Section>

      {/* ── Demographics (EEOC) ───────────────────────────────────────── */}
      <Section
        title="Demographic Information (EEOC)"
        description='These fields correspond to Equal Employment Opportunity Commission categories. All default to "Prefer not to answer" and are only ever sent as-is to the form — the AI never infers or invents values here.'
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">Gender</label>
            <select
              name="gender"
              defaultValue={p?.gender ?? DECLINE}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
            >
              {Object.entries(labelFor.gender).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {gender === "other" && (
            <TextField
              label="Self-description"
              name="gender_other_text"
              defaultValue={p?.gender_other_text}
              placeholder="e.g. non-conforming"
            />
          )}

          <SelectField
            label="Ethnicity"
            name="ethnicity"
            value={p?.ethnicity ?? DECLINE}
            options={labelFor.ethnicity}
          />
          <SelectField
            label="Veteran status"
            name="veteran_status"
            value={p?.veteran_status ?? DECLINE}
            options={labelFor.veteran_status}
          />
          <SelectField
            label="Disability status"
            name="disability_status"
            value={p?.disability_status ?? DECLINE}
            options={labelFor.disability_status}
          />
          <SelectField
            label="LGBTQ+ status"
            name="lgbtq_status"
            value={p?.lgbtq_status ?? DECLINE}
            options={labelFor.lgbtq_status}
          />
        </div>
      </Section>

      {/* ── Language Preferences ─────────────────────────────────────── */}
      <Section
        title="Language Preferences"
        description="Controls what language is used for application documents and the platform UI."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Application language
            </label>
            <select
              name="application_language"
              defaultValue={p?.application_language ?? "auto"}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-violet)]/40"
            >
              <option value="auto">Auto (detect from job description)</option>
              <option value="en">English only</option>
              <option value="es">Spanish only</option>
            </select>
            <p className="text-xs text-[var(--text-secondary)]">
              When set to Auto, CV and cover-letter generation detect the language from the job description. Override to force one language for all applications.
            </p>
          </div>

          <div className="space-y-4">
            <CheckboxField
              label="Show translations"
              name="show_translations"
              defaultChecked={p?.show_translations ?? true}
              description="Enable bilingual (EN/ES) content on the public site. Uncheck to show everything in a single language."
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-secondary)]">
              Admin UI language{" "}
              <span className="text-xs font-normal text-[var(--text-secondary)] opacity-60">(coming soon)</span>
            </label>
            <select
              name="admin_language"
              defaultValue={p?.admin_language ?? "en"}
              disabled
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] text-[var(--text-primary)] text-sm opacity-50 cursor-not-allowed"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
            <p className="text-xs text-[var(--text-secondary)]">
              Admin interface language switching is planned for a future update. Currently English only.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Save ─────────────────────────────────────────────────────── */}
      <div className="px-8 py-6 flex justify-end border-t border-[var(--border-subtle)]">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[var(--accent-violet)] text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <FiSave className="w-4 h-4" />
          {submitting ? "Saving…" : "Save preferences"}
        </button>
      </div>
    </form>
  );
}
