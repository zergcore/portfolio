"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJobSource } from "@/lib/api";
import {
  DiscoveryHit,
  discoverSourcesAction,
  createJobSourceAction,
} from "@/app/actions/jobs";
import categories from "@/data/discover_categories.json";

const PLATFORM_COLOR: Record<string, string> = {
  greenhouse:      "bg-emerald-500/15 text-emerald-300",
  lever:           "bg-violet-500/15 text-violet-300",
  ashby:           "bg-cyan-500/15 text-cyan-300",
  recruitee:       "bg-yellow-500/15 text-yellow-300",
  smartrecruiters: "bg-pink-500/15 text-pink-300",
};

type AddState = "idle" | "adding" | "added" | "error";

interface Category {
  label: string;
  description: string;
  companies: string[];
}
type CategoryMap = Record<string, Category>;
const CATEGORIES = categories as CategoryMap;

export default function DiscoverClient({
  existingSources,
}: {
  existingSources: ApiJobSource[];
}) {
  const router = useRouter();
  const [input, setInput] = useState("Anthropic\nStripe\nLinear\nFrisbii\nContinental");
  const [categoryKey, setCategoryKey] = useState<string>("");
  const [hits, setHits] = useState<DiscoveryHit[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [addState, setAddState] = useState<Record<string, AddState>>({});
  const [addError, setAddError] = useState<Record<string, string>>({});

  const existingKeys = useMemo(
    () => new Set(existingSources.map((s) => `${s.platform}:${s.identifier.toLowerCase()}`)),
    [existingSources],
  );

  const isAlreadyTracked = (hit: DiscoveryHit) =>
    existingKeys.has(`${hit.platform}:${hit.slug.toLowerCase()}`);

  async function handleDiscover() {
    const names = input
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) {
      setError("Paste at least one company name.");
      return;
    }
    setLoading(true);
    setError("");
    setHits(null);
    setAddState({});
    setAddError({});
    const res = await discoverSourcesAction(names);
    setLoading(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setHits(res.data);
  }

  async function handleAdd(hit: DiscoveryHit) {
    const key = `${hit.platform}:${hit.slug}`;
    setAddState((s) => ({ ...s, [key]: "adding" }));
    setAddError((e) => ({ ...e, [key]: "" }));
    const res = await createJobSourceAction({
      platform: hit.platform,
      identifier: hit.slug,
      enabled: true,
    });
    if ("error" in res) {
      setAddState((s) => ({ ...s, [key]: "error" }));
      setAddError((e) => ({ ...e, [key]: res.error }));
      return;
    }
    setAddState((s) => ({ ...s, [key]: "added" }));
    router.refresh();
  }

  return (
    <>
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5">
        <div className="flex items-baseline justify-between mb-2 gap-3">
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            Company names (one per line)
          </label>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-secondary)]" htmlFor="discover-category">
              Quick-fill
            </label>
            <select
              id="discover-category"
              value={categoryKey}
              onChange={(e) => {
                const k = e.target.value;
                setCategoryKey(k);
                if (k && CATEGORIES[k]) setInput(CATEGORIES[k].companies.join("\n"));
              }}
              className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded px-2 py-1 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
            >
              <option value="">— pick a category —</option>
              {Object.entries(CATEGORIES).map(([k, c]) => (
                <option key={k} value={k} title={c.description}>
                  {c.label} ({c.companies.length})
                </option>
              ))}
            </select>
          </div>
        </div>
        {categoryKey && CATEGORIES[categoryKey] && (
          <p className="mb-2 text-xs text-[var(--text-secondary)] italic">
            {CATEGORIES[categoryKey].description}
          </p>
        )}
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          spellCheck={false}
          className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-md px-3 py-2 text-sm font-mono text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
          placeholder="Anthropic&#10;Stripe&#10;Linear"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleDiscover}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--accent-cyan)] text-black font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Probing…" : "Discover"}
          </button>
          {error && <span className="text-sm text-red-300">{error}</span>}
        </div>
      </div>

      {hits && (
        <div className="mt-6">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Results
            </h2>
            <span className="text-sm text-[var(--text-secondary)]">
              {hits.length} match{hits.length === 1 ? "" : "es"}
            </span>
          </div>

          {hits.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] italic">
              No matches on any known platform. Try alternate spellings or check
              the company&apos;s careers page URL manually.
            </p>
          ) : (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Company</th>
                    <th className="px-4 py-2.5 text-left">Platform</th>
                    <th className="px-4 py-2.5 text-left">Slug</th>
                    <th className="px-4 py-2.5 text-right">Open jobs</th>
                    <th className="px-4 py-2.5 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hits.map((hit) => {
                    const key = `${hit.platform}:${hit.slug}`;
                    const state = addState[key] ?? "idle";
                    const tracked = isAlreadyTracked(hit);
                    return (
                      <tr
                        key={key + ":" + hit.name}
                        className="border-t border-[var(--border-subtle)] hover:bg-[var(--bg-elevated)]/50"
                      >
                        <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                          {hit.name}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PLATFORM_COLOR[hit.platform] ?? "bg-[var(--border-strong)]/20 text-[var(--text-secondary)]"}`}
                          >
                            {hit.platform}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-[var(--text-secondary)]">
                          <a
                            href={hit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-[var(--accent-cyan)]"
                          >
                            {hit.slug}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-[var(--text-secondary)]">
                          {hit.jobs_count}
                        </td>
                        <td className="px-4 py-3">
                          {tracked ? (
                            <span className="text-xs text-[var(--text-secondary)] italic">
                              Already tracked
                            </span>
                          ) : state === "added" ? (
                            <span className="text-xs text-emerald-300">✓ Added</span>
                          ) : (
                            <button
                              onClick={() => handleAdd(hit)}
                              disabled={state === "adding"}
                              className="text-xs px-3 py-1 rounded border border-[var(--border-strong)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-colors disabled:opacity-50"
                            >
                              {state === "adding" ? "Adding…" : "Add as source"}
                            </button>
                          )}
                          {state === "error" && addError[key] && (
                            <div className="text-xs text-red-300 mt-1">
                              {addError[key]}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
