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

const LAST_HARVEST_LS_KEY = "discovery_last_harvest_ts";
const LOCAL_COOLDOWN_HOURS = 22;

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

  const [lastHarvestTs, setLastHarvestTs] = useState<number | null>(null);

  useEffect(() => {
    void refresh();
    void loadCatalogue();
    const raw = localStorage.getItem(LAST_HARVEST_LS_KEY);
    if (raw) setLastHarvestTs(Number(raw));
  }, []);

  const hoursSinceLastHarvest = useMemo(() => {
    if (!lastHarvestTs) return null;
    return (Date.now() - lastHarvestTs) / 3_600_000;
  }, [lastHarvestTs]);

  const inLocalCooldown =
    hoursSinceLastHarvest !== null && hoursSinceLastHarvest < LOCAL_COOLDOWN_HOURS;

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

  async function handleHarvest(force = false) {
    if (inLocalCooldown && !force) {
      // Surface a confirmation step; the user can hit "Run anyway" which
      // sets force=true and sends force=true to the backend.
      setError(
        `Last harvest ran ${Math.floor(hoursSinceLastHarvest!)}h ago. ` +
          "Running again may exceed the 100 q/day free tier.",
      );
      return;
    }
    setHarvesting(true);
    setError("");
    setHarvestSummary(null);
    const res = await harvestInboxAction(force);
    setHarvesting(false);
    if ("cooldown" in res && res.cooldown) {
      setError(res.error);
      return;
    }
    if ("error" in res) {
      setError(res.error);
      return;
    }
    // Successful harvest — record locally so the next run hits the guard.
    const now = Date.now();
    localStorage.setItem(LAST_HARVEST_LS_KEY, String(now));
    setLastHarvestTs(now);
    const data = res.data;
    if (data.skipped === "no_search_provider_configured" || data.skipped === "google_cse_creds_missing") {
      setHarvestSummary(
        "Skipped: no search provider configured. Expand the setup panel below for instructions.",
      );
      setShowCsePanel(true);
      return;
    }
    const parts: string[] = [];
    const provider = data.provider as string | undefined;
    for (const [k, v] of Object.entries(data)) {
      if (k === "provider") continue;
      const s = v as { seen: number; new: number };
      parts.push(`${k}: ${s.new} new (${s.seen} seen)`);
    }
    setHarvestSummary(
      (provider ? `[${provider}] ` : "") + parts.join(" · "),
    );
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
      <div className="mb-2 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => handleHarvest(false)}
          disabled={harvesting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {harvesting ? "Harvesting…" : "Run Google CSE harvest"}
        </button>
        {inLocalCooldown && (
          <button
            onClick={() => handleHarvest(true)}
            disabled={harvesting}
            className="text-xs px-3 py-1.5 rounded border border-amber-500/60 text-amber-300 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
            title="Override the 22 h cooldown — may exceed the free 100 q/day tier"
          >
            Run anyway
          </button>
        )}
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

      {catalogue?.active_provider ? (
        <p className="mb-4 text-xs text-[var(--text-secondary)]">
          Active provider: <strong>{catalogue.active_provider}</strong> · one
          harvest spends <strong>{catalogue.harvest_query_budget}</strong> of your{" "}
          <strong>{catalogue.active_free_tier_per_day}</strong> daily free
          queries.{" "}
          {hoursSinceLastHarvest !== null
            ? `Last run ${Math.floor(hoursSinceLastHarvest)}h ago.`
            : "No harvest yet today."}
        </p>
      ) : (
        <p className="mb-4 text-xs text-amber-300">
          No search provider configured. Click <strong>Show CSE setup</strong> for
          step-by-step setup instructions for Brave Search (no card) or Google
          CSE.
        </p>
      )}

      {showCsePanel && (
        <div className="mb-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-5">
          {cseHostPatterns.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">
                Step 1 — Host patterns (only needed for Google CSE)
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mb-2">
                If you use Google CSE, paste these into your Programmable Search
                Engine&apos;s <strong>Sites to search</strong> list. Brave Search
                doesn&apos;t need them — it indexes the whole web.
              </p>
              <pre className="text-xs font-mono bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded p-3 whitespace-pre overflow-x-auto text-[var(--text-primary)]">
{cseHostPatterns.map((p) => p.pattern).join("\n")}
              </pre>
              <p className="text-xs text-[var(--text-secondary)] mt-2">
                <strong>{cseHostPatterns.filter((p) => p.hasAdapter).length}</strong>{" "}
                active + <strong>{cseHostPatterns.filter((p) => !p.hasAdapter).length}</strong>{" "}
                wishlist.
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
              Step 2 — Configure a search provider
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mb-3">
              Pick whichever fits your privacy / quota preference. The harvester
              auto-uses the first one configured (Brave wins if both are set).
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {catalogue?.providers?.map((p) => (
                <div
                  key={p.name}
                  className={`rounded-md border p-3 ${
                    p.configured
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50"
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-1.5 gap-2">
                    <strong className="text-sm text-[var(--text-primary)]">
                      {p.display_name}
                    </strong>
                    {p.configured ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wide">
                        Configured
                      </span>
                    ) : p.requires_billing ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-semibold uppercase tracking-wide">
                        Card required
                      </span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-semibold uppercase tracking-wide">
                        No card
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">
                    Free tier: <strong>{p.free_tier_per_day}/day</strong> · this
                    harvester spends <strong>{p.query_budget_per_run}</strong> per
                    run.
                  </p>
                  <ol className="text-xs text-[var(--text-secondary)] list-decimal pl-4 space-y-1 mb-2">
                    {p.setup_steps.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {p.setup_links.map((l) => (
                      <a
                        key={l.url}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] px-2 py-0.5 rounded border border-[var(--border-subtle)] text-[var(--accent-cyan)] hover:border-[var(--accent-cyan)]"
                      >
                        {l.label} ↗
                      </a>
                    ))}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    Env vars:{" "}
                    {p.env_vars.map((v, i) => (
                      <span key={v}>
                        <code className="font-mono">{v}</code>
                        {i < p.env_vars.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>
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
