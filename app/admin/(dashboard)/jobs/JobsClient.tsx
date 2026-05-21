"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiJob, JOB_STATUSES, JobStatus } from "@/lib/api";
import { getPollStatusAction, pollJobsAction, stopPollAction, updateJobAction, PollSourceStat } from "@/app/actions/jobs";

// How long (ms) the "Poll now" button stays disabled after a successful poll.
const POLL_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const POLL_LS_KEY = "jobs_last_poll_ts";
// Show "stop spending?" banner after this many jobs enriched in one poll.
const SPEND_PROMPT_THRESHOLD = 10;

function msToHuman(ms: number): string {
  const m = Math.ceil(ms / 60_000);
  return m >= 60 ? `${Math.ceil(m / 60)}h` : `${m}m`;
}

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

function isOverdue(followUpAt: string | null, status: JobStatus): boolean {
  if (!followUpAt || status === "offer" || status === "rejected") return false;
  return new Date(followUpAt) < new Date(new Date().toDateString());
}

export default function JobsClient({ initialJobs }: { initialJobs: ApiJob[] }) {
  const router = useRouter();
  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs);
  const [minScore, setMinScore] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollInfo, setPollInfo] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState<PollSourceStat[] | null>(null);
  const [isPollPending, startPollTransition] = useTransition();
  const [pollCooldownMs, setPollCooldownMs] = useState(0);
  const [pollRunning, setPollRunning] = useState(false);
  const [spendPromptVisible, setSpendPromptVisible] = useState(false);
  const spendPromptShownRef = useRef(false);

  // Hydrate cooldown from localStorage on mount.
  useEffect(() => {
    const raw = localStorage.getItem(POLL_LS_KEY);
    if (raw) {
      const remaining = POLL_COOLDOWN_MS - (Date.now() - Number(raw));
      if (remaining > 0) setPollCooldownMs(remaining);
    }
  }, []);

  // Sync local jobs state when the server re-fetches (e.g. after router.refresh()
  // following a poll). useState only reads its initial value on mount, so
  // without this the kanban shows stale counts even after a successful refresh.
  useEffect(() => {
    setJobs(initialJobs);
  }, [initialJobs]);

  // Tick down the cooldown every 30 s.
  useEffect(() => {
    if (pollCooldownMs <= 0) return;
    const id = setInterval(() => {
      setPollCooldownMs((prev) => {
        const next = prev - 30_000;
        return next > 0 ? next : 0;
      });
    }, 30_000);
    return () => clearInterval(id);
  }, [pollCooldownMs]);

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

  const overdueCount = useMemo(
    () => jobs.filter((j) => isOverdue(j.follow_up_at, j.status)).length,
    [jobs],
  );

  async function handleStatusChange(job: ApiJob, next: JobStatus) {
    if (next === job.status) return;
    setBusyId(job.id);
    setError(null);
    const res = await updateJobAction(job.id, { status: next });
    setBusyId(null);
    if (res.error) { setError(res.error); return; }
    setJobs(prev => prev.map(j => (j.id === job.id ? { ...j, status: next } : j)));
    router.refresh();
  }

  function handlePollNow() {
    if (pollCooldownMs > 0 || isPollPending) return;
    setError(null);
    setPollInfo(null);
    setPollStats(null);
    spendPromptShownRef.current = false;
    setSpendPromptVisible(false);
    startPollTransition(async () => {
      const res = await pollJobsAction();
      if (res.error) { setError(res.error); return; }
      setPollRunning(true);
      setPollInfo("Poll running — 0 jobs processed so far…");
      localStorage.setItem(POLL_LS_KEY, String(Date.now()));
      setPollCooldownMs(POLL_COOLDOWN_MS);

      const checkStatus = async () => {
        const statusRes = await getPollStatusAction();
        if ("error" in statusRes || !statusRes.data) {
          setPollRunning(false);
          router.refresh();
          setPollInfo("Poll started — check the kanban for new jobs.");
          return;
        }
        const data = statusRes.data;
        if (data.running) {
          const n = data.jobs_found_so_far;
          setPollInfo(`Poll running — ${n} job${n !== 1 ? "s" : ""} processed so far…`);
          if (n >= SPEND_PROMPT_THRESHOLD && !spendPromptShownRef.current) {
            spendPromptShownRef.current = true;
            setSpendPromptVisible(true);
          }
          setTimeout(checkStatus, 3_000);
        } else {
          setPollRunning(false);
          setSpendPromptVisible(false);
          const result = data.result;
          if (!result) {
            setPollInfo("Poll complete — check the kanban for new jobs.");
          } else if ("failures" in result && Array.isArray(result.failures) && result.failures.length > 0 && result.new_jobs === 0) {
            setError(`Poll finished with errors: ${result.failures[0]}`);
          } else {
            const skipped = result.sources_skipped_today ?? 0;
            const skipNote = skipped > 0 ? ` (${skipped} already polled today, skipped)` : "";
            setPollInfo(`Poll complete — ${result.new_jobs} new job(s) from ${result.sources_polled} source(s)${skipNote}.`);
            if (result.source_stats && result.source_stats.length > 0) {
              setPollStats(result.source_stats);
            }
          }
          router.refresh();
        }
      };

      setTimeout(checkStatus, 3_000);
    });
  }

  async function handleStopPoll() {
    setSpendPromptVisible(false);
    const res = await stopPollAction();
    if ("error" in res) {
      setError(res.error);
    } else {
      setPollInfo("Stop requested — poll will halt after the current job.");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-sm text-[var(--text-secondary)]">
          Min match score:&nbsp;
          <span className="text-[var(--text-primary)] font-medium">{minScore.toFixed(2)}</span>
        </label>
        <input
          type="range" min={0} max={1} step={0.05} value={minScore}
          onChange={(e) => setMinScore(parseFloat(e.target.value))}
          className="w-48"
        />

        <span className="ml-auto flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-300">
              {overdueCount} follow-up{overdueCount > 1 ? "s" : ""} overdue
            </span>
          )}
          <span className="text-sm text-[var(--text-secondary)]">{jobs.length} total</span>
          <Link
            href="/admin/jobs/stats"
            className="text-xs px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)] transition-colors"
          >
            Stats →
          </Link>
          {pollRunning && (
            <button
              onClick={handleStopPoll}
              className="text-xs px-3 py-1.5 rounded-md border border-red-500/60 text-red-400 hover:bg-red-500/10 transition-colors"
              title="Stop the running poll after the current job"
            >
              Stop poll
            </button>
          )}
          <button
            onClick={handlePollNow}
            disabled={isPollPending || pollCooldownMs > 0}
            title={pollCooldownMs > 0 ? `Available again in ${msToHuman(pollCooldownMs)}` : "Fetch new jobs from all sources"}
            className="text-xs px-3 py-1.5 rounded-md bg-[var(--accent-violet)] text-white hover:bg-[var(--accent-violet)]/90 disabled:opacity-50 transition-colors"
          >
            {isPollPending
              ? "Polling…"
              : pollCooldownMs > 0
              ? `Poll (${msToHuman(pollCooldownMs)})`
              : "Poll now"}
          </button>
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}
      {pollInfo && !error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
          <p className="font-medium">{pollInfo}</p>
          {pollStats && pollStats.length > 0 && (
            <div className="mt-2 space-y-0.5">
              {pollStats.map((s) => (
                <p key={s.source} className="text-xs font-mono">
                  <span className={s.error ? "text-red-400" : s.new > 0 ? "text-emerald-300" : "text-emerald-300/50"}>
                    {s.error ? "✗" : s.skipped ? "–" : "✓"}
                  </span>
                  {" "}<span className="text-emerald-200/70">{s.source}</span>
                  {" — "}
                  {s.error
                    ? "error"
                    : s.skipped && (s as { skip_reason?: string }).skip_reason === "polled_today"
                    ? "skipped — already polled today"
                    : s.skipped
                    ? `${s.fetched} fetched (budget exhausted)`
                    : `${s.fetched} fetched, ${s.new} new`}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {spendPromptVisible && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-sm text-yellow-300 flex items-center justify-between gap-4">
          <span>{SPEND_PROMPT_THRESHOLD}+ jobs processed — keep going or stop to save API quota?</span>
          <span className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSpendPromptVisible(false)}
              className="px-3 py-1 rounded-md border border-yellow-500/40 hover:bg-yellow-500/10 transition-colors"
            >
              Keep going
            </button>
            <button
              onClick={handleStopPoll}
              className="px-3 py-1 rounded-md bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 transition-colors"
            >
              Stop poll
            </button>
          </span>
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
              <span className="text-xs text-[var(--text-secondary)]">{grouped[status].length}</span>
            </header>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {grouped[status].length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] italic">No jobs in this column.</p>
              ) : (
                grouped[status].map((job) => {
                  const overdue = isOverdue(job.follow_up_at, job.status);
                  return (
                    <article
                      key={job.id}
                      className={`rounded-lg border bg-[var(--bg-elevated)] p-3 ${
                        overdue ? "border-orange-500/50" : "border-[var(--border-subtle)]"
                      }`}
                    >
                      <Link href={`/admin/jobs/${job.id}`} className="block group">
                        <div className="flex items-start gap-2">
                          <h3 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-cyan)] transition-colors flex-1 line-clamp-2">
                            {job.title}
                          </h3>
                          <span className={`shrink-0 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${scoreBadge(job.match_score)}`}>
                            {(job.match_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          {job.company}{job.location ? ` · ${job.location}` : ""}
                        </p>
                        {job.match_explanation && (
                          <p className="text-xs text-[var(--text-secondary)] mt-2 italic line-clamp-2">
                            {job.match_explanation}
                          </p>
                        )}
                        {overdue && (
                          <p className="text-xs text-orange-300 mt-1">
                            Follow-up overdue · {new Date(job.follow_up_at!).toLocaleDateString()}
                          </p>
                        )}
                      </Link>

                      <div className="mt-3 flex items-center gap-2">
                        <select
                          value={job.status}
                          onChange={(e) => handleStatusChange(job, e.target.value as JobStatus)}
                          disabled={busyId === job.id}
                          className="flex-1 text-xs px-2 py-1 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-primary)] disabled:opacity-50"
                        >
                          {JOB_STATUSES.map((s) => (
                            <option key={s} value={s}>→ {STATUS_LABELS[s]}</option>
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
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
