"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJob, JOB_STATUSES, JobStatus } from "@/lib/api";
import {
  generateJobCoverLetterAction,
  generateJobCvAction,
  updateJobAction,
} from "@/app/actions/jobs";

export default function JobDetailClient({ initialJob }: { initialJob: ApiJob }) {
  const router = useRouter();
  const [job, setJob] = useState<ApiJob>(initialJob);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [notes, setNotes] = useState(job.notes ?? "");
  const [coverLetter, setCoverLetter] = useState(job.cover_letter_text ?? "");
  const [followUpAt, setFollowUpAt] = useState(job.follow_up_at ?? "");

  async function save(data: Parameters<typeof updateJobAction>[1]) {
    setBusy("save");
    setError(null);
    setInfo(null);
    const res = await updateJobAction(job.id, data);
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setJob(res.data as ApiJob);
      setInfo("Saved.");
      router.refresh();
    }
  }

  async function runGenerateCv() {
    setBusy("cv");
    setError(null);
    setInfo(null);
    const res = await generateJobCvAction(job.id, { locale: "auto" });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setInfo(`CV generated. cv_version_id: ${res.data?.cv_version_id}`);
    router.refresh();
  }

  async function runGenerateCoverLetter() {
    setBusy("cl");
    setError(null);
    setInfo(null);
    const res = await generateJobCoverLetterAction(job.id, { locale: "auto" });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      // Backend mirrors the rendered cover letter onto job.cover_letter_text;
      // re-fetch is unnecessary because the next router.refresh() repaints,
      // but populate the textarea so the admin can edit immediately.
      setInfo(`Cover letter generated. cv_version_id: ${res.data.cv_version_id}`);
    }
    router.refresh();
  }

  return (
    <div className="mt-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{job.title}</h1>
        <p className="text-[var(--text-secondary)]">
          {job.company}
          {job.location ? ` · ${job.location}` : ""}
        </p>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[var(--accent-cyan)] hover:underline"
        >
          Open posting ↗
        </a>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-1">
            Match score
          </div>
          <div className="text-2xl font-bold text-[var(--text-primary)]">
            {(job.match_score * 100).toFixed(0)}%
          </div>
          {job.match_explanation && (
            <p className="mt-2 text-xs italic text-[var(--text-secondary)]">
              {job.match_explanation}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <label className="block text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Status
          </label>
          <select
            value={job.status}
            onChange={(e) => save({ status: e.target.value as JobStatus })}
            disabled={busy === "save"}
            className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {job.applied_at && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">
              Applied {new Date(job.applied_at).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <div className="text-xs uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Generate
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={runGenerateCv}
              disabled={busy === "cv"}
              className="px-3 py-2 rounded-md border border-[var(--border-strong)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] disabled:opacity-50"
            >
              {busy === "cv" ? "Generating CV…" : "Generate tailored CV"}
            </button>
            <button
              onClick={runGenerateCoverLetter}
              disabled={busy === "cl"}
              className="px-3 py-2 rounded-md border border-[var(--border-strong)] text-sm text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] disabled:opacity-50"
            >
              {busy === "cl" ? "Generating cover letter…" : "Generate cover letter"}
            </button>
          </div>
        </div>
      </section>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
          {info}
        </div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
            Follow-up date
          </label>
          <input
            type="date"
            value={followUpAt}
            onChange={(e) => setFollowUpAt(e.target.value)}
            onBlur={() => {
              const val = followUpAt || null;
              if (val !== (job.follow_up_at ?? null)) save({ follow_up_at: val });
            }}
            className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
          />
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Leave blank for no reminder. Shown as overdue in the kanban if past today.
          </p>
        </div>
        {job.applied_at && (
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">Applied</p>
            <p className="text-sm text-[var(--text-primary)]">
              {new Date(job.applied_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
          Notes
        </h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={() => {
            if (notes !== (job.notes ?? "")) save({ notes });
          }}
          rows={4}
          className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
          placeholder="Private notes — recruiter contact, interview prep, follow-up dates…"
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
          Cover letter
        </h2>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          onBlur={() => {
            if (coverLetter !== (job.cover_letter_text ?? ""))
              save({ cover_letter_text: coverLetter });
          }}
          rows={12}
          className="w-full px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm font-mono"
          placeholder="Generate one with the button above, then edit before sending."
        />
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-2">
          Job description
        </h2>
        <pre className="whitespace-pre-wrap text-sm text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded-md p-4 border border-[var(--border-subtle)] max-h-96 overflow-y-auto">
          {job.jd_text}
        </pre>
      </section>
    </div>
  );
}
