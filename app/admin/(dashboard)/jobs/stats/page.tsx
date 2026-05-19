import Link from "next/link";
import { getJobStats } from "@/lib/adminApi";
import { ApiJobStats, JOB_STATUSES, JobStatus } from "@/lib/api";

export const revalidate = 0;

const STATUS_LABELS: Record<JobStatus, string> = {
  prospected: "Prospected",
  tailored: "Tailored",
  applied: "Applied",
  interviewing: "Interviewing",
  offer: "Offer",
  rejected: "Rejected",
};

const STATUS_COLOR: Record<JobStatus, string> = {
  prospected: "bg-[var(--border-strong)]",
  tailored: "bg-[var(--accent-violet)]",
  applied: "bg-[var(--accent-cyan)]",
  interviewing: "bg-yellow-500",
  offer: "bg-emerald-500",
  rejected: "bg-red-500",
};

export default async function JobStatsPage() {
  const stats = (await getJobStats()) as ApiJobStats | null;

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/jobs" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
          ← Back to pipeline
        </Link>
        <p className="mt-8 text-[var(--text-secondary)]">Could not load stats. Make sure the backend is running.</p>
      </div>
    );
  }

  const maxStatusCount = Math.max(...JOB_STATUSES.map((s) => stats.by_status[s] ?? 0), 1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <Link href="/admin/jobs" className="text-sm text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] transition-colors">
          ← Back to pipeline
        </Link>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mt-4">Pipeline analytics</h1>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total jobs", value: stats.total },
          { label: "Avg match score", value: `${(stats.avg_match_score * 100).toFixed(0)}%` },
          { label: "Interview rate", value: stats.applied_to_interview_rate > 0 ? `${(stats.applied_to_interview_rate * 100).toFixed(0)}%` : "—" },
          { label: "Overdue follow-ups", value: stats.overdue_followups, warn: stats.overdue_followups > 0 },
        ].map(({ label, value, warn }) => (
          <div key={label} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${warn ? "text-orange-300" : "text-[var(--text-primary)]"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Status bar chart */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-4">By status</h2>
        <div className="space-y-3">
          {JOB_STATUSES.map((status) => {
            const count = stats.by_status[status] ?? 0;
            const pct = maxStatusCount > 0 ? (count / maxStatusCount) * 100 : 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-xs text-[var(--text-secondary)] text-right shrink-0">
                  {STATUS_LABELS[status]}
                </span>
                <div className="flex-1 h-5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
                  <div
                    className={`h-full rounded-full ${STATUS_COLOR[status]} opacity-70 transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-6 text-xs text-[var(--text-primary)] font-medium">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top sources */}
      {stats.top_sources.length > 0 && (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-4">Top sources</h2>
          <div className="space-y-2">
            {stats.top_sources.map(({ source, count }) => (
              <div key={source} className="flex items-center justify-between text-sm">
                <span className="font-mono text-[var(--text-primary)]">{source}</span>
                <span className="text-[var(--text-secondary)]">{count} job{count !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
