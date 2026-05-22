"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CataloguePlatform,
  DiscoveredSourceRow,
  DiscoveryCatalogue,
  dismissDiscoveredAction,
  getDiscoveryCatalogueAction,
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
  const [catalogue, setCatalogue] = useState<DiscoveryCatalogue | null>(null);
  const [error, setError] = useState("");
  const [harvestSummary, setHarvestSummary] = useState<string | null>(null);
  const [harvesting, setHarvesting] = useState(false);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [showCsePanel, setShowCsePanel] = useState(false);

  // Lookup tables built from the catalogue.
  const platformsByCode = useMemo(() => {
    const m = new Map<string, CataloguePlatform>();
    catalogue?.platforms.forEach((p) => m.set(p.code, p));
    return m;
  }, [catalogue]);

  const cseHostPatterns = useMemo(
    () =>
      catalogue?.platforms
        .filter((p) => p.kind === "company_slug" && p.host_pattern)
        .map((p) => ({ code: p.code, pattern: p.host_pattern as string, hasAdapter: p.has_adapter })) ?? [],
    [catalogue],
  );

  useEffect(() => {
    void refresh();
    void loadCatalogue();
  }, []);

  async function loadCatalogue() {
    const res = await getDiscoveryCatalogueAction();
    if ("error" in res) return;
    setCatalogue(res.data);
  }

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
      <div className="mb-4 flex items-center gap-3 flex-wrap">
        <button
          onClick={handleHarvest}
          disabled={harvesting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {harvesting ? "Harvesting…" : "Run Google CSE harvest"}
        </button>
        <button
          onClick={() => setShowCsePanel((v) => !v)}
          className="text-xs px-3 py-1.5 rounded border border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors"
        >
          {showCsePanel ? "Hide" : "Show"} CSE setup
        </button>
        {harvestSummary && (
          <span className="text-xs text-[var(--text-secondary)]">{harvestSummary}</span>
        )}
        {error && <span className="text-xs text-red-300">{error}</span>}
      </div>

      {showCsePanel && cseHostPatterns.length > 0 && (
        <div className="mb-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
            Google CSE setup
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mb-3">
            Paste these into your Programmable Search Engine&apos;s <strong>Sites to
            search</strong> list at{" "}
            <a
              href="https://programmablesearchengine.google.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-cyan)] hover:underline"
            >
              programmablesearchengine.google.com
            </a>
            . API key from{" "}
            <a
              href="https://console.cloud.google.com/apis/credentials"
              target="_blank"
              rel="noreferrer"
              className="text-[var(--accent-cyan)] hover:underline"
            >
              Google Cloud → Credentials
            </a>
            {" "}with the <em>Custom Search API</em> enabled. Free tier:
            100 queries / day.
          </p>
          <pre className="text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded p-3 whitespace-pre overflow-x-auto text-[var(--text-primary)]">
{cseHostPatterns.map((p) => p.pattern).join("\n")}
          </pre>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            <strong>{cseHostPatterns.filter((p) => p.hasAdapter).length}</strong> active +{" "}
            <strong>{cseHostPatterns.filter((p) => !p.hasAdapter).length}</strong> wishlist.
            Then set <code>GOOGLE_CSE_KEY</code> and <code>GOOGLE_CSE_CX</code> on
            the backend.
          </p>
        </div>
      )}

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
                const platformMeta = platformsByCode.get(r.platform);
                const isWishlist = platformMeta ? !platformMeta.has_adapter : false;
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
                      {isWishlist && (
                        <span
                          className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold uppercase tracking-wide"
                          title="No adapter yet — promotion disabled until support is added."
                        >
                          Wishlist
                        </span>
                      )}
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
                        disabled={busy || isWishlist}
                        title={isWishlist ? "No adapter for this platform yet" : undefined}
                        className="text-xs px-3 py-1 rounded border border-[var(--accent-cyan)] text-[var(--accent-cyan)] hover:bg-[var(--accent-cyan)]/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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
