"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ApiJob, JOB_STATUSES, JobStatus } from "@/lib/api";
import {
  getPollStatusAction,
  pollJobsAction,
  stopPollAction,
  updateJobAction,
  rescoreAllJobsAction,
  getRescoreStatusAction,
  stopRescoreAction,
  PollSourceStat,
} from "@/app/actions/jobs";
import { useQueryState, parseAsInteger } from "nuqs";

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

function scoreBadge(score: number): string {
  if (score >= 0.7) return "bg-emerald-500/15 text-emerald-300";
  if (score >= 0.4) return "bg-yellow-500/15 text-yellow-300";
  return "bg-red-500/15 text-red-300";
}

function isOverdue(followUpAt: string | null, status: JobStatus): boolean {
  if (!followUpAt || status === "offer" || status === "rejected") return false;
  return new Date(followUpAt) < new Date(new Date().toDateString());
}

export default function JobsClient({
  initialJobs,
  totalJobs,
  currentPage,
  limit,
}: {
  initialJobs: ApiJob[];
  totalJobs: number;
  currentPage: number;
  limit: number;
}) {
  const router = useRouter();
  const t = useTranslations("adminJobs");
  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Polling states
  const [pollInfo, setPollInfo] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState<PollSourceStat[] | null>(null);
  const [isPollPending, startPollTransition] = useTransition();
  const [pollCooldownMs, setPollCooldownMs] = useState(0);
  const [pollRunning, setPollRunning] = useState(false);
  const [spendPromptVisible, setSpendPromptVisible] = useState(false);
  const spendPromptShownRef = useRef(false);

  // Rescore states
  const [isRescorePending, startRescoreTransition] = useTransition();
  const [rescoreRunning, setRescoreRunning] = useState(false);
  const [rescoreInfo, setRescoreInfo] = useState<string | null>(null);

  // Pagination with nuqs
  const [, setPageParam] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false }),
  );

  // Hydrate cooldown from localStorage on mount.
  useEffect(() => {
    const raw = localStorage.getItem(POLL_LS_KEY);
    if (raw) {
      const remaining = POLL_COOLDOWN_MS - (Date.now() - Number(raw));
      if (remaining > 0) setPollCooldownMs(remaining);
    }
  }, []);

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

  const overdueCount = jobs.filter((j) =>
    isOverdue(j.follow_up_at, j.status),
  ).length;

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
    setJobs((prev) =>
      prev.map((j) => (j.id === job.id ? { ...j, status: next } : j)),
    );
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
      if (res.error) {
        setError(res.error);
        return;
      }
      setPollRunning(true);
      setPollInfo("Poll running — 0 jobs processed so far…");
      localStorage.setItem(POLL_LS_KEY, String(Date.now()));
      setPollCooldownMs(POLL_COOLDOWN_MS);

      const checkStatus = async () => {
        const statusRes = await getPollStatusAction();
        if ("error" in statusRes || !statusRes.data) {
          setPollRunning(false);
          router.refresh();
          setPollInfo("Poll started — check for new jobs.");
          return;
        }
        const data = statusRes.data;
        if (data.running) {
          const n = data.jobs_found_so_far;
          setPollInfo(
            `Poll running — ${n} job${n !== 1 ? "s" : ""} processed so far…`,
          );
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
            setPollInfo("Poll complete — check for new jobs.");
          } else if (
            "failures" in result &&
            Array.isArray(result.failures) &&
            result.failures.length > 0 &&
            result.new_jobs === 0
          ) {
            setError(`Poll finished with errors: ${result.failures[0]}`);
          } else {
            const skipped = result.sources_skipped_today ?? 0;
            const skipNote =
              skipped > 0 ? ` (${skipped} already polled today, skipped)` : "";
            setPollInfo(
              `Poll complete — ${result.new_jobs} new job(s) from ${result.sources_polled} source(s)${skipNote}.`,
            );
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
  async function handleStopRescore() {
    const res = await stopRescoreAction();
    if ("error" in res) {
      setError(res.error);
    } else {
      setRescoreInfo("Stop requested — rescoring will halt after the current job.");
    }
  }

  function handleRescoreAll() {
    if (isRescorePending) return;
    setError(null);
    setRescoreInfo(null);
    startRescoreTransition(async () => {
      const res = await rescoreAllJobsAction();
      if (res.error) {
        setError(res.error);
        return;
      }
      setRescoreRunning(true);
      setRescoreInfo("Rescoring started...");

      const checkStatus = async () => {
        const statusRes = await getRescoreStatusAction();
        if ("error" in statusRes || !statusRes.data) {
          setRescoreRunning(false);
          router.refresh();
          setRescoreInfo("Rescoring finished or unknown status.");
          return;
        }
        const data = statusRes.data;
        if (data.running) {
          setRescoreInfo(
            `Rescoring... ${data.evaluated}/${data.total} evaluated (updated ${data.updated}, skipped ${data.skipped})`,
          );
          setTimeout(checkStatus, 3000);
        } else {
          setRescoreRunning(false);
          if (data.error) {
            setError(`Rescoring failed: ${data.error}`);
          } else {
            setRescoreInfo(
              `Rescoring complete: ${data.evaluated} evaluated, ${data.updated} updated, ${data.skipped} skipped.`,
            );
          }
          router.refresh();
        }
      };
      setTimeout(checkStatus, 3000);
    });
  }

  const totalPages = Math.ceil(totalJobs / limit);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="ml-auto flex items-center gap-3">
          {overdueCount > 0 && (
            <span className="text-xs px-2 py-1 rounded-full bg-orange-500/15 text-orange-300">
              {overdueCount} follow-up{overdueCount > 1 ? "s" : ""} overdue
            </span>
          )}
          <span className="text-sm text-(--text-secondary)">
            {totalJobs.toLocaleString()} jobs found
          </span>
          <Link
            href="/admin/jobs/stats"
            className="text-xs px-3 py-1.5 rounded-md border border-(--border-subtle) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan) transition-colors"
          >
            {t("stats")}
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
            title={
              pollCooldownMs > 0
                ? `Available again in ${msToHuman(pollCooldownMs)}`
                : "Fetch new jobs from all sources"
            }
            className="text-xs px-3 py-1.5 rounded-md bg-(--accent-violet) text-white hover:bg-(--accent-violet)/90 disabled:opacity-50 transition-colors"
          >
            {isPollPending
              ? "Polling…"
              : pollCooldownMs > 0
                ? `Poll (${msToHuman(pollCooldownMs)})`
                : t("pollNow")}
          </button>
          {rescoreRunning && (
            <button
              onClick={handleStopRescore}
              className="text-xs px-3 py-1.5 rounded-md border border-red-500/60 text-red-400 hover:bg-red-500/10 transition-colors"
              title="Stop the running rescore after the current job"
            >
              Stop rescore
            </button>
          )}
          <button
            onClick={handleRescoreAll}
            disabled={isRescorePending || rescoreRunning}
            title="Re-run matching score and explanation for all prospected jobs"
            className="text-xs px-3 py-1.5 rounded-md border border-(--border-subtle) bg-(--bg-elevated) text-foreground hover:border-(--accent-violet) disabled:opacity-50 transition-colors"
          >
            {isRescorePending || rescoreRunning
              ? "Rescoring..."
              : "Rescore all"}
          </button>
        </span>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      {rescoreInfo && !error && (
        <div className="mb-4 rounded-lg bg-blue-500/10 border border-blue-500/40 text-sm text-blue-300 px-4 py-3">
          {rescoreInfo}
        </div>
      )}

      {pollInfo && !error && (
        <div className="mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-sm text-emerald-300">
          <details className="group">
            <summary className="px-4 py-3 font-medium cursor-pointer list-none flex items-center justify-between">
              <span>{pollInfo}</span>
              {pollStats && pollStats.length > 0 && (
                <span className="text-emerald-500/60 group-open:rotate-180 transition-transform">
                  ▼
                </span>
              )}
            </summary>
            {pollStats && pollStats.length > 0 && (
              <div className="px-4 pb-3 space-y-0.5 border-t border-emerald-500/20 pt-2 -mt-1">
                {pollStats.map((s) => (
                  <p key={s.source} className="text-xs font-mono">
                    <span
                      className={
                        s.error
                          ? "text-red-400"
                          : s.new > 0
                            ? "text-emerald-300"
                            : "text-emerald-300/50"
                      }
                    >
                      {s.error ? "✗" : s.skipped ? "–" : "✓"}
                    </span>{" "}
                    <span className="text-emerald-200/70">{s.source}</span>
                    {" — "}
                    {s.error
                      ? "error"
                      : s.skipped &&
                          (s as { skip_reason?: string }).skip_reason ===
                            "polled_today_zero"
                        ? "skipped — already polled today (0 new)"
                        : s.skipped
                          ? `${s.fetched} fetched (budget exhausted)`
                          : `${s.fetched} fetched, ${s.new} new`}
                  </p>
                ))}
              </div>
            )}
          </details>
        </div>
      )}

      {spendPromptVisible && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/40 text-sm text-yellow-300 flex items-center justify-between gap-4">
          <span>
            {SPEND_PROMPT_THRESHOLD}+ jobs processed — keep going or stop to
            save API quota?
          </span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {jobs.length === 0 ? (
          <p className="text-sm text-(--text-secondary) col-span-full">
            No jobs found. Try adjusting your filters or polling for new jobs.
          </p>
        ) : (
          jobs.map((job) => {
            const overdue = isOverdue(job.follow_up_at, job.status);
            return (
              <article
                key={job.id}
                className={`flex flex-col rounded-xl border bg-(--bg-surface) p-4 ${
                  overdue ? "border-orange-500/50" : "border-(--border-subtle)"
                }`}
              >
                <div className="flex-1">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="block group mb-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-(--accent-cyan) transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <span
                        className={`shrink-0 inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium ${scoreBadge(job.match_score)}`}
                      >
                        {(job.match_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-sm text-(--text-secondary) mt-1">
                      {job.company}
                      {job.location ? ` · ${job.location}` : ""}
                    </p>
                    <p className="text-xs text-(--text-secondary) mt-1 opacity-70">
                      {job.source}
                    </p>
                    {job.match_explanation && (
                      <p className="text-sm text-(--text-secondary) mt-3 italic line-clamp-3">
                        {job.match_explanation}
                      </p>
                    )}
                    {overdue && (
                      <p className="text-sm text-orange-300 mt-2">
                        Follow-up overdue ·{" "}
                        {new Date(job.follow_up_at!).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-(--border-subtle) flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <select
                      value={job.status}
                      onChange={(e) =>
                        handleStatusChange(job, e.target.value as JobStatus)
                      }
                      disabled={busyId === job.id}
                      className="w-full text-sm px-2 py-1.5 rounded-md bg-background border border-(--border-subtle) text-foreground disabled:opacity-50"
                    >
                      {JOB_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-sm px-3 py-1.5 rounded-md border border-(--border-subtle) text-(--text-secondary) hover:text-(--accent-cyan) hover:border-(--accent-cyan) transition-colors"
                    title="Open job posting"
                  >
                    View
                  </a>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-(--border-subtle) pt-6">
          <p className="text-sm text-(--text-secondary)">
            Showing {Math.min(limit, jobs.length)} of {totalJobs} jobs
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageParam(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-strong) text-foreground hover:bg-background disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-medium px-4">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPageParam(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-(--border-strong) text-foreground hover:bg-background disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
