"use client";

import { Fragment, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FiAward, FiDownloadCloud, FiPlus, FiTrash2 } from "react-icons/fi";
import {
  bulkToggleModels,
  createAiModel,
  deleteAiModel,
  fetchAiModelRankings,
  syncAiModels,
  updateAiModel,
} from "@/app/actions/ai";
import { useTranslations } from "next-intl";
import type { AiKnownModel } from "@/lib/types/ai";

interface Props {
  models: AiKnownModel[];
}

const isFreeModel = (m: AiKnownModel) =>
  (m.notes?.toLowerCase() ?? "").includes("free tier");

export default function AiModelsManager({ models }: Props) {
  const router = useRouter();
  const t = useTranslations("adminAiConfig");
  const [, startTransition] = useTransition();
  const [localModels, setLocalModels] = useState<AiKnownModel[]>(models);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [rankingResult, setRankingResult] = useState<string | null>(null);
  const [fetchingRankings, setFetchingRankings] = useState(false);
  const [bulkLoading, setBulkLoading] = useState<string | null>(null);

  useEffect(() => {
    setLocalModels(models);
  }, [models]);

  // Add form state
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [notes, setNotes] = useState("");

  const handleAdd = () => {
    const p = provider.trim();
    const m = model.trim();
    if (!p || !m) { setError("Provider and model are required."); return; }
    setError(null);
    startTransition(async () => {
      const res = await createAiModel({
        provider: p,
        model: m,
        display_name: displayName.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      if (res.ok) {
        setProvider(""); setModel(""); setDisplayName(""); setNotes("");
        router.refresh();
      } else {
        setError(res.error ?? "Failed to add model");
      }
    });
  };

  const handleToggle = (m: AiKnownModel) => {
    setLocalModels((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, enabled: !item.enabled } : item))
    );
    startTransition(async () => {
      const res = await updateAiModel(m.id, { enabled: !m.enabled });
      if (!res.ok) {
        setLocalModels((prev) =>
          prev.map((item) => (item.id === m.id ? { ...item, enabled: m.enabled } : item))
        );
        setError(res.error ?? "Update failed");
      }
    });
  };

  const handleDelete = (id: number) => {
    startTransition(async () => {
      const res = await deleteAiModel(id);
      if (!res.ok) setError(res.error ?? "Delete failed");
      else setLocalModels((prev) => prev.filter((item) => item.id !== id));
    });
  };

  const handleBulkToggle = async (
    enabled: boolean,
    tier: "free" | "paid" | "all",
    prov?: string,
  ) => {
    const key = `${enabled ? "en" : "dis"}_${tier}${prov ? `_${prov}` : ""}`;
    setBulkLoading(key);
    setError(null);
    // Optimistic
    setLocalModels((prev) =>
      prev.map((m) => {
        if (prov && m.provider !== prov) return m;
        const free = isFreeModel(m);
        if (tier === "paid" && free) return m;
        if (tier === "free" && !free) return m;
        return { ...m, enabled };
      })
    );
    const res = await bulkToggleModels({ enabled, tier, provider: prov });
    setBulkLoading(null);
    if (!res.ok) {
      setLocalModels(models); // full revert on failure
      setError(res.error ?? "Bulk toggle failed");
    }
  };

  const handleFetchRankings = async () => {
    setFetchingRankings(true);
    setRankingResult(null);
    setError(null);
    const res = await fetchAiModelRankings();
    setFetchingRankings(false);
    if (!res.ok) {
      setError(res.error ?? "Fetch rankings failed");
      return;
    }
    const parts: string[] = [];
    if ((res.updated_elo ?? 0) > 0) parts.push(`${res.updated_elo} ELO scores`);
    if ((res.updated_benchmark ?? 0) > 0) parts.push(`${res.updated_benchmark} benchmark scores`);
    if ((res.updated_notes ?? 0) > 0) parts.push(`${res.updated_notes} notes`);
    const scored = parts.length ? `Updated ${parts.join(" + ")}.` : "No new scores matched.";
    const reordered = (res.reordered_features?.length ?? 0) > 0
      ? ` Auto-reordered ${res.reordered_features!.length} chain(s): ${res.reordered_features!.join(", ")}.`
      : "";
    const srcs = res.sources?.length ? ` Sources: ${res.sources.join("; ")}.` : "";
    const fetched = res.fetched_rows && Object.keys(res.fetched_rows).length
      ? ` Fetched: ${Object.entries(res.fetched_rows).map(([k, v]) => `${k.split("/").pop()}: ${v} rows`).join(", ")}.`
      : "";
    const errs = res.errors?.length ? ` Errors: ${res.errors.join("; ")}` : "";
    setRankingResult(scored + reordered + srcs + fetched + errs);
    if ((res.updated_elo ?? 0) + (res.updated_benchmark ?? 0) > 0) router.refresh();
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    const res = await syncAiModels();
    setSyncing(false);
    if (!res.ok) {
      setError(res.error ?? "Sync failed");
      return;
    }
    const parts = Object.entries(res.added ?? {})
      .filter(([, n]) => n > 0)
      .map(([p, n]) => `${p}: +${n}`);
    const summary = res.total_added === 0
      ? "Already up to date — no new models found."
      : `Added ${res.total_added} model${res.total_added === 1 ? "" : "s"}${parts.length ? ` (${parts.join(", ")})` : ""}.`;
    const errNote = res.errors?.length ? ` Errors: ${res.errors.join("; ")}` : "";
    setSyncResult(summary + errNote);
    if ((res.total_added ?? 0) > 0) router.refresh();
  };

  const providers = [...new Set(localModels.map((m) => m.provider))].sort();
  const globalPaidCount = localModels.filter((m) => !isFreeModel(m)).length;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-(--text-secondary) uppercase tracking-wide">
            {t("manager.title")}
          </h2>
          <p className="text-xs text-(--text-muted) mt-0.5">
            {t("manager.description")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {globalPaidCount > 0 && (
            <>
              <button
                onClick={() => handleBulkToggle(false, "paid")}
                disabled={bulkLoading !== null}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-(--border-default) text-(--text-muted) hover:border-orange-500/50 hover:text-orange-400 disabled:opacity-40 transition-colors"
                title={`Disable all ${globalPaidCount} paid models`}
              >
                {t("manager.disablePaid")}
              </button>
              <button
                onClick={() => handleBulkToggle(true, "paid")}
                disabled={bulkLoading !== null}
                className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-(--border-default) text-(--text-muted) hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-40 transition-colors"
                title={`Enable all ${globalPaidCount} paid models`}
              >
                {t("manager.enablePaid")}
              </button>
            </>
          )}
          <button
            onClick={handleFetchRankings}
            disabled={fetchingRankings}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-(--border-default) text-(--text-secondary) hover:border-(--accent-violet) hover:text-(--accent-violet) disabled:opacity-50 transition-colors"
            title="Fetch ELO and benchmark scores from public leaderboards and auto-reorder chains"
          >
            <FiAward className="w-3.5 h-3.5" />
            {fetchingRankings ? t("manager.fetchingRankings") : t("manager.fetchRankings")}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-(--border-default) text-(--text-secondary) hover:border-(--accent-cyan) hover:text-(--accent-cyan) disabled:opacity-50 transition-colors"
            title="Fetch current model lists from Groq, OpenRouter, and Google and add any new ones"
          >
            <FiDownloadCloud className="w-3.5 h-3.5" />
            {syncing ? t("manager.syncing") : t("manager.syncProviders")}
          </button>
        </div>
      </div>

      {rankingResult && (
        <div className="px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/30 text-xs text-violet-300 space-y-1">
          <p>{rankingResult}</p>
          {rankingResult.includes("No new scores") && (
            <p className="text-violet-400/70">
              <strong>Chatbot Arena</strong> (lmarena-ai) and{" "}
              <strong>open-llm-leaderboard/contents</strong> are public — no token needed.
              The HuggingFace-hosted variants{" "}
              <a href="https://huggingface.co/datasets/HuggingFaceH4/open_llm_leaderboard" target="_blank" rel="noreferrer" className="underline hover:text-violet-300">HuggingFaceH4/open_llm_leaderboard</a>
              {" and "}
              <a href="https://huggingface.co/datasets/open-llm-leaderboard-v2/contents" target="_blank" rel="noreferrer" className="underline hover:text-violet-300">open-llm-leaderboard-v2</a>
              {" "}are <strong>gated</strong>: accept terms on their pages, then set{" "}
              <code className="bg-violet-500/20 px-1 rounded">HUGGINGFACE_API_TOKEN</code> in{" "}
              <code className="bg-violet-500/20 px-1 rounded">backend/.env</code>.
            </p>
          )}
        </div>
      )}
      {syncResult && (
        <div className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
          {syncResult}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-(--border-default) bg-(--bg-elevated)">
        <table className="w-full text-sm">
          <thead className="border-b border-(--border-default)">
            <tr>
              {[
                t("manager.table.model"),
                t("manager.table.displayName"),
                t("manager.table.notes"),
                t("manager.table.elo"),
                t("manager.table.bench"),
                t("manager.table.enabled"),
                ""
              ].map((h, idx) => (
                <th key={idx} className="px-4 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {providers.map((prov) => {
              const provModels = localModels
                .filter((m) => m.provider === prov)
                .sort((a, b) => {
                  if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
                  const eloA = a.elo_score ?? -1;
                  const eloB = b.elo_score ?? -1;
                  if (eloA !== eloB) return eloB - eloA;
                  return (b.avg_benchmark ?? -1) - (a.avg_benchmark ?? -1);
                });
              const paidCount = provModels.filter((m) => !isFreeModel(m)).length;
              return (
                <Fragment key={prov}>
                  {/* Provider group header */}
                  <tr className="border-b border-(--border-default) bg-(--bg-base)/60">
                    <td colSpan={7} className="px-4 py-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-(--text-muted)">
                          {prov}
                          <span className="ml-2 font-normal normal-case">
                            {provModels.length} model{provModels.length !== 1 ? "s" : ""}
                            {paidCount > 0 && ` · ${paidCount} paid`}
                          </span>
                        </span>
                        {paidCount > 0 && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleBulkToggle(false, "paid", prov)}
                              disabled={bulkLoading !== null}
                              className="text-[10px] px-2 py-0.5 rounded border border-(--border-default) text-(--text-muted) hover:border-orange-500/50 hover:text-orange-400 disabled:opacity-40 transition-colors"
                            >
                              {t("manager.table.disablePaidModels")}
                            </button>
                            <button
                              onClick={() => handleBulkToggle(true, "paid", prov)}
                              disabled={bulkLoading !== null}
                              className="text-[10px] px-2 py-0.5 rounded border border-(--border-default) text-(--text-muted) hover:border-emerald-500/50 hover:text-emerald-400 disabled:opacity-40 transition-colors"
                            >
                              {t("manager.table.enablePaidModels")}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                  {/* Model rows */}
                  {provModels.map((m) => (
                    <tr
                      key={m.id}
                      className={`border-b border-(--border-subtle) last:border-0 hover:bg-(--bg-base) ${
                        !m.enabled ? "opacity-50" : ""
                      }`}
                    >
                      <td className="px-4 py-2 font-mono text-xs text-(--text-primary) max-w-xs truncate" title={m.model}>
                        {m.model}
                      </td>
                      <td className="px-4 py-2 text-(--text-secondary)">{m.display_name ?? "—"}</td>
                      <td className="px-4 py-2 text-xs text-(--text-muted)">{m.notes ?? "—"}</td>
                      <td className="px-4 py-2 text-xs tabular-nums text-(--text-secondary)">
                        {m.elo_score ?? "—"}
                      </td>
                      <td className="px-4 py-2 text-xs tabular-nums text-(--text-secondary)">
                        {m.avg_benchmark != null ? `${m.avg_benchmark.toFixed(1)}%` : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleToggle(m)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                            m.enabled ? "bg-(--accent-violet)" : "bg-(--border-strong)"
                          }`}
                          title={m.enabled ? "Disable" : "Enable"}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                              m.enabled ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="text-(--text-muted) hover:text-(--color-error) transition-colors"
                          title="Delete permanently"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              );
            })}
            {localModels.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-(--text-muted)">
                  {t("manager.table.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add form */}
      <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-4 space-y-3">
        <p className="text-xs font-semibold text-(--text-secondary) uppercase tracking-wide">{t("manager.addModel")}</p>
        <div className="flex flex-wrap gap-2">
          <input
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            placeholder="provider  (e.g. groq)"
            className="w-36 px-3 py-1.5 text-xs rounded-md border border-(--border-default) bg-(--bg-base) text-(--text-primary) focus:outline-none focus:border-(--accent-violet)"
          />
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="model string  (e.g. llama-3.3-70b-versatile)"
            className="flex-1 min-w-48 px-3 py-1.5 text-xs rounded-md border border-(--border-default) bg-(--bg-base) text-(--text-primary) focus:outline-none focus:border-(--accent-violet)"
          />
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="display name  (optional)"
            className="w-44 px-3 py-1.5 text-xs rounded-md border border-(--border-default) bg-(--bg-base) text-(--text-primary) focus:outline-none focus:border-(--accent-violet)"
          />
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="notes  (optional, e.g. free tier)"
            className="w-44 px-3 py-1.5 text-xs rounded-md border border-(--border-default) bg-(--bg-base) text-(--text-primary) focus:outline-none focus:border-(--accent-violet)"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-(--accent-violet) text-white hover:bg-(--accent-violet)/80 transition-colors"
          >
            <FiPlus className="w-3.5 h-3.5" />
            {t("manager.add")}
          </button>
        </div>
        {error && <p className="text-xs text-(--color-error)">{error}</p>}
      </div>
    </section>
  );
}
