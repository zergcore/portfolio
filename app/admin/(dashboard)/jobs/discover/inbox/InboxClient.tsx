"use client";

import { useEffect, useState } from "react";
import {
  DiscoveredSourceRow,
  dismissDiscoveredAction,
  harvestInboxAction,
  listDiscoveryInboxAction,
  promoteDiscoveredAction,
} from "@/app/actions/jobs";

const PLATFORM_COLOR: Record<string, string> = {
  greenhouse:      "bg-emerald-500/15 text-emerald-300",
  lever:           "bg-violet-500/15 text-violet-300",
  ashby:           "bg-cyan-500/15 text-cyan-300",
  recruitee:       "bg-yellow-500/15 text-yellow-300",
  smartrecruiters: "bg-pink-500/15 text-pink-300",
};

type RowState = "idle" | "promoting" | "dismissing" | "done";

export default function InboxClient() {
  const [rows, setRows] = useState<DiscoveredSourceRow[] | null>(null);
  const [error, setError] = useState("");
  const [harvestSummary, setHarvestSummary] = useState<string | null>(null);
  const [harvesting, setHarvesting] = useState(false);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  useEffect(() => {
    void refresh();
  }, []);

  async function refresh() {
    const res = await listDiscoveryInboxAction();
    if ("error" in res) {
      setError(res.error);
      setRows([]);
      return;
    }
    setRows(res.data);
  }

  async function handleHarvest() {
    setHarvesting(true);
    setError("");
    setHarvestSummary(null);
    const res = await harvestInboxAction();
    setHarvesting(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    const data = res.data;
    if (data.skipped === "google_cse_creds_missing") {
      setHarvestSummary(
        "Skipped: set GOOGLE_CSE_KEY and GOOGLE_CSE_CX on the backend to enable bulk harvest.",
      );
      return;
    }
    const parts: string[] = [];
    for (const [platform, stats] of Object.entries(data)) {
      const s = stats as { seen: number; new: number };
      parts.push(`${platform}: ${s.new} new (${s.seen} seen)`);
    }
    setHarvestSummary(parts.join(" · "));
    await refresh();
  }

  async function handlePromote(id: string) {
    setRowState((m) => ({ ...m, [id]: "promoting" }));
    const res = await promoteDiscoveredAction(id);
    if ("error" in res) {
      setError(res.error);
      setRowState((m) => ({ ...m, [id]: "idle" }));
      return;
    }
    setRowState((m) => ({ ...m, [id]: "done" }));
    setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  async function handleDismiss(id: string) {
    setRowState((m) => ({ ...m, [id]: "dismissing" }));
    const res = await dismissDiscoveredAction(id);
    if ("error" in res) {
      setError(res.error);
      setRowState((m) => ({ ...m, [id]: "idle" }));
      return;
    }
    setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handleHarvest}
          disabled={harvesting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {harvesting ? "Harvesting…" : "Run Google CSE harvest"}
        </button>
        {harvestSummary && (
          <span className="text-xs text-[var(--text-secondary)]">{harvestSummary}</span>
        )}
        {error && <span className="text-xs text-red-300">{error}</span>}
      </div>

      {rows === null ? (
        <p className="text-sm text-[var(--text-secondary)] italic">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-[var(--text-secondary)] italic">
          Inbox empty — click <strong>Run Google CSE harvest</strong> to populate (requires
          GOOGLE_CSE_KEY + GOOGLE_CSE_CX on the backend).
        </p>
      ) : (
        <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left">Platform</th>
                <th className="px-4 py-2.5 text-left">Slug</th>
                <th className="px-4 py-2.5 text-right">Seen</th>
                <th className="px-4 py-2.5 text-left">First seen</th>
                <th className="px-4 py-2.5 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const state = rowState[r.id] ?? "idle";
                const busy = state === "promoting" || state === "dismissing";
                return (
                  <tr
                    key={r.id}
                    className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50"
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PLATFORM_COLOR[r.platform] ?? "bg-[var(--border-strong)]/20 text-[var(--text-secondary)]"}`}
                      >
                        {r.platform}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{r.slug}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                      {r.times_seen}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">
                      {new Date(r.discovered_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button
                        onClick={() => handlePromote(r.id)}
                        disabled={busy}
                        className="text-xs px-3 py-1 rounded border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors disabled:opacity-50"
                      >
                        {state === "promoting" ? "Promoting…" : "Promote"}
                      </button>
                      <button
                        onClick={() => handleDismiss(r.id)}
                        disabled={busy}
                        className="text-xs px-3 py-1 rounded border border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-red-400/60 hover:text-red-300 transition-colors disabled:opacity-50"
                      >
                        {state === "dismissing" ? "…" : "Dismiss"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
