"use client";

import { useEffect, useMemo, useState } from "react";
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

const STATUS_COLOR: Record<JobStatus, string> = {
  prospected: "bg-[var(--border-strong)]/20 text-[var(--text-secondary)]",
  tailored:   "bg-violet-500/15 text-violet-300",
  applied:    "bg-cyan-500/15 text-cyan-300",
  interviewing: "bg-yellow-500/15 text-yellow-300",
  offer:      "bg-emerald-500/15 text-emerald-300",
  rejected:   "bg-red-500/15 text-red-300",
};

const HISTORY_STATUSES: JobStatus[] = ["tailored", "applied", "interviewing", "offer", "rejected"];

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function scoreColor(score: number): string {
  if (score >= 0.7) return "text-emerald-300";
  if (score >= 0.4) return "text-yellow-300";
  return "text-red-300";
}

export default function HistoryClient({ initialJobs }: { initialJobs: ApiJob[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs);
  const [statusFilter, setStatusFilter] = useState<JobStatus | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resync when the server re-fetches (e.g. after a status change triggers refresh).
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  const filtered = useMemo(
    () => statusFilter === "all" ? jobs : jobs.filter((j) => j.status === statusFilter),
    [jobs, statusFilter],
  );

  const counts = useMemo(() => {
    const out: Partial<Record<JobStatus | "all", number>> = { all: jobs.length };
    for (const s of HISTORY_STATUSES) {
      out[s] = jobs.filter((j) => j.status === s).length;
    }
    return out;
  }, [jobs]);

  async function handleStatusChange(job: ApiJob, next: JobStatus) {
    if (next === job.status) return;
    setBusyId(job.id);
    setError(null);
    const res = await updateJobAction(job.id, { status: next });
    setBusyId(null);
    if (res.error) { setError(res.error); return; }
    setJobs((prev) => prev.map((j) => j.id === job.id ? { ...j, status: next } : j));
    router.refresh();
  }

  return (
    <>
      {/* Status filter tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...HISTORY_STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              statusFilter === s
                ? "border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[var(--accent-cyan)]/10"
                : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)]/50"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
            <span className="ml-1.5 opacity-60">{counts[s] ?? 0}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2.5 text-left">Job</th>
              <th className="px-4 py-2.5 text-left">Source</th>
              <th className="px-4 py-2.5 text-left">Score</th>
              <th className="px-4 py-2.5 text-left">Status</th>
              <th className="px-4 py-2.5 text-left">Applied</th>
              <th className="px-4 py-2.5 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-secondary)] italic">
                  No jobs here yet. Generate a CV or answer a question for any pipeline job to start tracking.
                </td>
              </tr>
            ) : (
              filtered.map((job) => (
                <tr
                  key={job.id}
                  className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50"
                >
                  {/* Title + company */}
                  <td className="px-4 py-3 max-w-xs">
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[var(--text-primary)] hover:text-[var(--accent-cyan)] transition-colors leading-snug block"
                    >
                      {job.title}
                    </a>
                    <span className="text-xs text-[var(--text-secondary)]">{job.company}</span>
                    {job.location && (
                      <span className="text-xs text-[var(--text-secondary)]"> · {job.location}</span>
                    )}
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] font-mono whitespace-nowrap">
                    {job.source}
                  </td>

                  {/* Match score */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold ${scoreColor(job.match_score)}`}>
                      {(job.match_score * 100).toFixed(0)}%
                    </span>
                  </td>

                  {/* Status selector */}
                  <td className="px-4 py-3">
                    <select
                      value={job.status}
                      disabled={busyId === job.id}
                      onChange={(e) => handleStatusChange(job, e.target.value as JobStatus)}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer disabled:opacity-50 ${STATUS_COLOR[job.status]}`}
                    >
                      {JOB_STATUSES.map((s) => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>

                  {/* Applied at */}
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {formatDate(job.applied_at)}
                  </td>

                  {/* Updated at */}
                  <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                    {formatDate(job.updated_at)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
