"use client";

import { useEffect, useState, useTransition } from "react";
import { Clock, RefreshCcw, Save, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import {
  getPollScheduleAction,
  updatePollScheduleAction,
  clearPollScheduleOverrideAction,
  PollScheduleInfo,
} from "@/app/actions/jobs";

function Tooltip({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative flex items-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2.5 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
        {text}
        <div className="absolute left-1/2 top-full -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-slate-800"></div>
      </div>
    </div>
  );
}

export function PollScheduleCard() {
  const [schedule, setSchedule] = useState<PollScheduleInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Local state for the override slider
  const [intervalInput, setIntervalInput] = useState<number>(30);
  const [isOpen, setIsOpen] = useState(false);

  const fetchSchedule = async () => {
    startTransition(async () => {
      const res = await getPollScheduleAction();
      if ("error" in res) {
        setError(res.error);
      } else {
        setSchedule(res.data);
        setIntervalInput(res.data.interval_minutes);
      }
    });
  };

  useEffect(() => {
    fetchSchedule();
    // Auto-refresh schedule info every minute
    const timer = setInterval(fetchSchedule, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSaveOverride = () => {
    if (intervalInput < 20 || intervalInput > 180) {
      setError("Interval must be between 20 and 180 minutes.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await updatePollScheduleAction(intervalInput);
      if ("error" in res) {
        setError(res.error);
      } else {
        await fetchSchedule();
      }
    });
  };

  const handleClearOverride = () => {
    setError(null);
    startTransition(async () => {
      const res = await clearPollScheduleOverrideAction();
      if ("error" in res) {
        setError(res.error);
      } else {
        await fetchSchedule();
      }
    });
  };

  if (!schedule && isPending) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50">
        <RefreshCcw className="h-5 w-5 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!schedule) {
    return null;
  }

  const nextFireDate = schedule.next_fire_time
    ? new Date(schedule.next_fire_time).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "N/A";

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/50 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-6 focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
            <Clock className="h-5 w-5 text-indigo-500" />
            Poll Scheduler
          </h3>
          {schedule.admin_override ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
              Manual Override
            </span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              Adaptive Mode
            </span>
          )}
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </button>

      {isOpen && (
        <div className="px-6 pb-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/50">
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Current Interval
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">
                {schedule.interval_minutes}{" "}
                <span className="text-sm font-normal text-slate-500">min</span>
              </div>
              {!schedule.admin_override && (
                <div className="mt-1 text-xs text-slate-500">
                  Empty runs: {schedule.consecutive_empty_runs}/3
                </div>
              )}
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-500">
                Next Poll
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-700 dark:text-slate-300">
                {nextFireDate}
              </div>
              <button
                onClick={fetchSchedule}
                disabled={isPending}
                className="mt-1 flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                <RefreshCcw
                  className={`h-3 w-3 ${isPending ? "animate-spin" : ""}`}
                />
                Refresh status
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Force Interval Override</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">
                  {intervalInput} min
                </span>
              </label>
              <input
                type="range"
                min="20"
                max="180"
                step="5"
                value={intervalInput}
                onChange={(e) => setIntervalInput(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-indigo-600 dark:bg-slate-700 dark:accent-indigo-500"
              />
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>20m</span>
                <span>1h</span>
                <span>2h</span>
                <span>3h</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Tooltip text="Force the scheduler to run at exactly this interval, pausing the adaptive speed-up/slow-down logic.">
                <button
                  onClick={handleSaveOverride}
                  disabled={
                    isPending ||
                    (schedule.admin_override &&
                      intervalInput === schedule.interval_minutes)
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  <Save className="h-4 w-4" />
                  Save Override
                </button>
              </Tooltip>

              {schedule.admin_override && (
                <Tooltip text="Clear the override and allow the scheduler to automatically adjust its interval based on job activity.">
                  <button
                    onClick={handleClearOverride}
                    disabled={isPending}
                    className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
