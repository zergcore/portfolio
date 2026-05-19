"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiJob, JOB_STATUSES, JobStatus } from "@/lib/api";
import { updateJobAction } from "@/app/actions/jobs";

const STATUS_LABELS: Record<JobStatus, string> = {
  prospected: "Prospected",
  tailored: "Tailored",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_ACCENT: Record<JobStatus, string> = {
  prospected: "border-[var(--border-strong)]",
  tailored: "border-[var(--accent-violet)]/60",
  applied: "border-[var(--accent-cyan)]/60",
  interviewing: "border-yellow-500/60",
  offer: "border-emerald-500/60",
  rejected: "border-red-500/60",
};

function scoreBadge(score: number): string {
  if (score >= 0.7) return "bg-emerald-500/15 text-emerald-300";
  if (score >= 0.4) return "bg-yellow-500/15 text-yellow-300";
  return "bg-red-500/15 text-red-300";
}

export default function JobsClient({ initialJobs }: { initialJobs: ApiJob[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs);
  const [minScore, setMinScore] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const out: Record<JobStatus, ApiJob[]> = {
      prospected: [], tailored: [], applied: [],
      interviewing: [], offer: [], rejected: [],
    };
    for (const j of jobs) {
      if (j.match_score < minScore) continue;
      out[j.status]?.push(j);
    }
    return out;
  }, [jobs, minScore]);

  async function handleStatusChange(job: ApiJob, next: JobStatus) {
    if (next === job.status) return;
    setBusyId(job.id);
    setError(null);
    const res = await updateJobAction(job.id, { status: next });
    setBusyId(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setJobs(prev => prev.map(j => (j.id === job.id ? { ...j, status: next } : j)));
    router.refresh();
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <label className="text-sm text-[var(--text-secondary)]">
          Min match score:&nbsp;
          <span className="text-[var(--text-primary)] font-medium">
            {minScore.toFixed(2)}
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={minScore}
          onChange={(e) => setMinScore(parseFloat(e.target.value))}
          className="w-64"
        />
        <span className="ml-auto text-sm text-[var(--text-secondary)]">
          {jobs.length} total
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {JOB_STATUSES.map((status) => (
          <section
            key={status}
            className={`rounded-xl border ${STATUS_ACCENT[status]} bg-[var(--bg-surface)] p-4`}
          >
            <header className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-primary)]">
                {STATUS_LABELS[status]}
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">
                {grouped[status].length}
              </span>
            </header>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {grouped[status].length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic">
                  No jobs in this column.
                </p>
              ) : (
                grouped[status].map((job) => (
                  <article
                    key={job.id}
                    className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-3"
                  >
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="block group"
                    >
                      <div className="flex items-start gap-2">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors flex-1 line-clamp-2">
                          {job.title}
                        </h3>
                        <span
                          className={`shrink-0 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${scoreBadge(
                            job.match_score
                          )}`}
                        >
                          {(job.match_score * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">
                        {job.company}
                        {job.location ? ` · ${job.location}` : ""}
                      </p>
                      {job.match_explanation && (
                        <p className="text-xs text-[var(--text-secondary)] mt-2 italic line-clamp-2">
                          {job.match_explanation}
                        </p>
                      )}
                    </Link>

                    <div className="mt-3 flex items-center gap-2">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          handleStatusChange(job, e.target.value as JobStatus)
                        }
                        disabled={busyId === job.id}
                        className="flex-1 text-xs px-2 py-1 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] disabled:opacity-50"
                      >
                        {JOB_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            → {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-colors"
                        title="Open job posting"
                      >
                        ↗
                      </a>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
