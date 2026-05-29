"use client";

import { Fragment, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FiMenu, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import {
  testAiFeature,
  setFeatureChain,
  resetFeatureChain,
} from "@/app/actions/ai";
import type {
  AiChainEntry,
  AiConfigData,
  AiKnownModel,
  AiModelEntry,
  AiTestResult,
} from "@/lib/types/ai";
import AiModelsManager from "./AiModelsManager";

interface Props {
  config: AiConfigData;
  knownModels: AiKnownModel[];
}

function ModelBadge({ entry }: { entry: AiModelEntry }) {
  const t = useTranslations("adminAiConfig");
  const shortModel = entry.model.split("/").pop() ?? entry.model;

  if (!entry.skipped) {
    return (
      <div className="rounded border border-green-500/40 bg-green-500/10 px-2 py-1 text-xs min-w-0">
        <div className="font-medium text-green-400 truncate">
          {entry.provider}
        </div>
        <div className="text-green-600 truncate" title={entry.model}>
          {shortModel}
        </div>
      </div>
    );
  }

  if (entry.reason === "rate_limited") {
    const remaining = entry.until
      ? Math.max(0, entry.until - Math.floor(Date.now() / 1000))
      : 0;
    const mins = Math.ceil(remaining / 60);
    return (
      <div className="rounded border border-orange-500/40 bg-orange-500/10 px-2 py-1 text-xs min-w-0">
        <div className="font-medium text-orange-400 truncate">
          {entry.provider}
        </div>
        <div className="text-orange-600 truncate" title={entry.model}>
          {shortModel}
        </div>
        <div className="text-orange-500 text-[10px]">
          {t("badges.rateLimited")} {mins}m
        </div>
      </div>
    );
  }

  const label =
    entry.reason === "missing_key" ? t("badges.noKey") : t("badges.badModel");
  return (
    <div className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs min-w-0">
      <div className="font-medium text-red-400 truncate">{entry.provider}</div>
      <div className="text-red-600 truncate" title={entry.model}>
        {shortModel}
      </div>
      <div className="text-red-500 text-[10px]">{label}</div>
    </div>
  );
}

interface EditPanelProps {
  feature: string;
  initial: AiChainEntry[];
  knownModels: AiKnownModel[];
  onClose: () => void;
  onSaved: () => void;
}

const CUSTOM_SENTINEL = "__custom__";

const FEATURE_META: Record<
  string,
  { type: "generation" | "embed"; description: string }
> = {
  rewrite: { type: "generation", description: "AI-enhance CMS text fields" },
  translate: { type: "generation", description: "Translate content EN ↔ ES" },
  suggest: {
    type: "generation",
    description: "Suggest content for CMS fields",
  },
  suggest_tags: {
    type: "generation",
    description: "Suggest tags for blog posts",
  },
  suggest_skills: {
    type: "generation",
    description: "Suggest skills from job descriptions",
  },
  jd_parse: {
    type: "generation",
    description: "Parse job descriptions into structured data",
  },
  cv_select: {
    type: "generation",
    description: "Select relevant CV sections for a job",
  },
  cover_letter: {
    type: "generation",
    description: "Generate cover letters from CV + JD",
  },
  qa_responder: {
    type: "generation",
    description: "Answer application form questions",
  },
  job_explain: {
    type: "generation",
    description: "Explain job match scores in plain language",
  },
  detect_language: {
    type: "generation",
    description: "Detect language of job descriptions",
  },
  embed: {
    type: "embed",
    description:
      "Vector embeddings for job match scoring — embedding models only",
  },
};

function isEmbeddingModel(m: AiKnownModel): boolean {
  return (
    m.model.toLowerCase().includes("embed") ||
    (m.notes ?? "").toLowerCase().includes("embeddings only")
  );
}

function EditPanel({
  feature,
  initial,
  knownModels,
  onClose,
  onSaved,
}: EditPanelProps) {
  const t = useTranslations("adminAiConfig");
  const [chain, setChain] = useState<AiChainEntry[]>(
    initial.map((e) => ({ ...e })),
  );
  const [selected, setSelected] = useState("");
  const [customProvider, setCustomProvider] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const dragIdx = useRef<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const isEmbedFeature = FEATURE_META[feature]?.type === "embed";
  const compatibleModels = knownModels
    .filter(
      (m) =>
        m.enabled &&
        (isEmbedFeature ? isEmbeddingModel(m) : !isEmbeddingModel(m)),
    )
    .sort((a, b) => {
      const eloA = a.elo_score ?? -1;
      const eloB = b.elo_score ?? -1;
      if (eloA !== eloB) return eloB - eloA;
      return (b.avg_benchmark ?? -1) - (a.avg_benchmark ?? -1);
    });
  const providerGroups = compatibleModels.reduce<
    Record<string, AiKnownModel[]>
  >((acc, m) => {
    (acc[m.provider] ??= []).push(m);
    return acc;
  }, {});
  const modelLookup = new Map(
    knownModels.map((m) => [`${m.provider}|${m.model}`, m]),
  );
  const isCustom = selected === CUSTOM_SENTINEL;

  const addEntry = () => {
    if (compatibleModels.length > 0 && !isCustom) {
      if (!selected) return;
      const [p, ...rest] = selected.split("|");
      const m = rest.join("|");
      setChain((prev) => [...prev, { provider: p, model: m }]);
      setSelected("");
    } else {
      const p = customProvider.trim();
      const m = customModel.trim();
      if (!p || !m) return;
      setChain((prev) => [...prev, { provider: p, model: m }]);
      setCustomProvider("");
      setCustomModel("");
      setSelected("");
    }
  };

  const removeEntry = (i: number) =>
    setChain((prev) => prev.filter((_, idx) => idx !== i));

  const updateEntry = (
    i: number,
    field: "provider" | "model",
    value: string,
  ) => {
    setChain((prev) =>
      prev.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)),
    );
  };

  const handleSave = () => {
    if (chain.length === 0) {
      setError("Chain must have at least one entry.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await setFeatureChain(feature, chain);
      if (result.ok) {
        onSaved();
        onClose();
      } else setError(result.error ?? "Save failed");
    });
  };

  const handleReset = () => {
    startTransition(async () => {
      const result = await resetFeatureChain(feature);
      if (result.ok) {
        onSaved();
        onClose();
      } else setError(result.error ?? "Reset failed");
    });
  };

  return (
    <tr>
      <td
        colSpan={999}
        className="px-4 py-4 bg-background border-b border-(--border-default)"
      >
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {t("editPanel.editChain")} —{" "}
              <code className="text-(--accent-cyan)">{feature}</code>
            </span>
            <button
              onClick={onClose}
              className="text-(--text-muted) hover:text-foreground"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>

          {/* Current entries — draggable to reorder */}
          <div className="space-y-1.5">
            {chain.map((entry, i) => (
              <div
                key={i}
                draggable
                onDragStart={() => {
                  dragIdx.current = i;
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIdx(i);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const from = dragIdx.current;
                  if (from === null || from === i) return;
                  setChain((prev) => {
                    const next = [...prev];
                    const [moved] = next.splice(from, 1);
                    next.splice(i, 0, moved);
                    return next;
                  });
                  dragIdx.current = null;
                  setDragOverIdx(null);
                }}
                onDragEnd={() => {
                  dragIdx.current = null;
                  setDragOverIdx(null);
                }}
                className={`flex items-center gap-2 rounded transition-colors ${
                  dragOverIdx === i && dragIdx.current !== i
                    ? "ring-1 ring-(--accent-violet) bg-(--accent-violet)/5"
                    : ""
                } ${dragIdx.current === i ? "opacity-40" : ""}`}
              >
                <FiMenu className="w-3 h-3 text-[--text-muted] shrink-0 cursor-grab active:cursor-grabbing" />
                <span className="text-xs text-[--text-muted] w-4 text-right shrink-0">
                  {i + 1}
                </span>
                <input
                  value={entry.provider}
                  onChange={(e) => updateEntry(i, "provider", e.target.value)}
                  placeholder={t("editPanel.providerPlaceholder")}
                  className="w-28 px-2 py-1 text-xs rounded border border-(--border-default) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                />
                <input
                  value={entry.model}
                  onChange={(e) => updateEntry(i, "model", e.target.value)}
                  placeholder={t("editPanel.modelPlaceholder")}
                  className="flex-1 px-2 py-1 text-xs rounded border border-(--border-default) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                />
                {(() => {
                  const cm = modelLookup.get(
                    `${entry.provider}|${entry.model}`,
                  );
                  const parts = [
                    cm?.elo_score != null ? `ELO ${cm.elo_score}` : null,
                    cm?.avg_benchmark != null
                      ? `${cm.avg_benchmark.toFixed(1)}%`
                      : null,
                  ].filter(Boolean);
                  return parts.length > 0 ? (
                    <span className="text-[10px] tabular-nums text-(--text-muted) shrink-0 whitespace-nowrap">
                      {parts.join(" · ")}
                    </span>
                  ) : null;
                })()}
                <button
                  onClick={() => removeEntry(i)}
                  className="text-(--text-muted) hover:text-(--color-error) transition-colors shrink-0"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add row */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[--text-muted] w-4 text-right shrink-0">
              +
            </span>
            {compatibleModels.length > 0 ? (
              <>
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="flex-1 px-2 py-1 text-xs rounded border border-(--border-subtle) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                >
                  <option value="">{t("editPanel.selectModel")}</option>
                  {Object.entries(providerGroups).map(([prov, ms]) => (
                    <optgroup key={prov} label={prov}>
                      {ms.map((m) => {
                        const scoreParts = [
                          m.elo_score != null ? `ELO ${m.elo_score}` : null,
                          m.avg_benchmark != null
                            ? `${m.avg_benchmark.toFixed(1)}%`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" · ");
                        const label = m.display_name ?? m.model;
                        const suffix = [scoreParts, m.notes]
                          .filter(Boolean)
                          .join(" — ");
                        return (
                          <option key={m.id} value={`${m.provider}|${m.model}`}>
                            {label}
                            {suffix ? `  ·  ${suffix}` : ""}
                          </option>
                        );
                      })}
                    </optgroup>
                  ))}
                  <option value={CUSTOM_SENTINEL}>
                    {t("editPanel.custom")}
                  </option>
                </select>
                {isCustom && (
                  <>
                    <input
                      value={customProvider}
                      onChange={(e) => setCustomProvider(e.target.value)}
                      placeholder={t("editPanel.providerPlaceholder")}
                      className="w-24 px-2 py-1 text-xs rounded border border-(--border-subtle) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                    />
                    <input
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addEntry()}
                      placeholder={t("editPanel.modelPlaceholder")}
                      className="w-40 px-2 py-1 text-xs rounded border border-(--border-subtle) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <input
                  value={customProvider}
                  onChange={(e) => setCustomProvider(e.target.value)}
                  placeholder={t("editPanel.providerPlaceholder")}
                  className="w-28 px-2 py-1 text-xs rounded border border-(--border-subtle) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                />
                <input
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEntry()}
                  placeholder={t("editPanel.modelPlaceholder")}
                  className="flex-1 px-2 py-1 text-xs rounded border border-(--border-subtle) bg-(--bg-elevated) text-foreground focus:outline-none focus:border-(--accent-violet)"
                />
              </>
            )}
            <button
              onClick={addEntry}
              className="text-(--accent-violet) hover:text-(--accent-violet)/80 transition-colors shrink-0"
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          {error && <p className="text-xs text-(--color-error)">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-xs rounded-md bg-(--accent-violet) text-white hover:bg-(--accent-violet)/80 transition-colors"
            >
              {t("editPanel.save")}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs rounded-md border border-(--border-default) text-(--text-secondary) hover:border-(--color-error) hover:text-(--color-error) transition-colors"
            >
              {t("editPanel.reset")}
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AiConfigClient({ config, knownModels }: Props) {
  const router = useRouter();
  const t = useTranslations("adminAiConfig");
  const features = Object.keys(config);
  const maxChain =
    features.length > 0
      ? Math.max(...features.map((f) => config[f].length))
      : 0;

  const [testResults, setTestResults] = useState<
    Record<string, AiTestResult | "loading">
  >({});
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTest = (feature: string) => {
    setTestResults((prev) => ({ ...prev, [feature]: "loading" }));
    startTransition(async () => {
      const result = await testAiFeature(feature);
      setTestResults((prev) => ({ ...prev, [feature]: result }));
    });
  };

  if (features.length === 0) {
    return (
      <div className="rounded-xl border border-(--border-default) bg-(--bg-elevated) p-8 text-center text-sm text-(--text-muted)">
        {t("emptyConfig")}
      </div>
    );
  }

  const bgCell = "bg-(--bg-elevated) group-hover:bg-(--bg-base)";

  return (
    <div className="space-y-10">
      <div className="overflow-x-auto rounded-xl border border-(--border-default) bg-(--bg-elevated)">
        <table className="w-full text-sm">
          <thead className="border-b border-(--border-default)">
            <tr>
              <th className="px-4 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap sticky left-0 z-10 bg-(--bg-elevated)">
                {t("table.feature")}
              </th>
              {Array.from({ length: maxChain }, (_, i) => (
                <th
                  key={i}
                  className="px-3 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap"
                >
                  #{i + 1}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-(--text-muted) font-medium whitespace-nowrap">
                {t("table.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature) => {
              const chain = config[feature];
              const testResult = testResults[feature];
              const isEditing = editingFeature === feature;

              return (
                <Fragment key={feature}>
                  <tr className="group border-b border-[--border-subtle] last:border-0">
                    <td className={`px-4 py-3 sticky left-0 z-10 ${bgCell}`}>
                      <span className="font-medium text-[--text-primary] whitespace-nowrap">
                        {feature}
                      </span>
                      {FEATURE_META[feature] && (
                        <p className="text-[10px] text-[--text-muted] mt-0.5 max-w-[160px]">
                          {FEATURE_META[feature].description}
                        </p>
                      )}
                    </td>
                    {Array.from({ length: maxChain }, (_, i) => (
                      <td key={i} className="px-3 py-2 align-top">
                        {chain[i] ? <ModelBadge entry={chain[i]} /> : null}
                      </td>
                    ))}
                    <td className="px-4 py-3 align-middle">
                      <div className="flex items-center gap-2 flex-wrap min-w-[220px]">
                        <button
                          onClick={() => handleTest(feature)}
                          disabled={testResult === "loading"}
                          className="px-2.5 py-1 text-xs rounded-md bg-(--accent-violet)/10 text-(--accent-violet) border border-(--accent-violet)/30 hover:bg-(--accent-violet)/20 disabled:opacity-50 transition-colors"
                        >
                          {testResult === "loading" ? "…" : t("table.test")}
                        </button>
                        <button
                          onClick={() =>
                            setEditingFeature(isEditing ? null : feature)
                          }
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                            isEditing
                              ? "border-(--accent-cyan) text-(--accent-cyan) bg-(--accent-cyan)/10"
                              : "border-(--border-default) text-(--text-secondary) hover:border-(--accent-cyan) hover:text-(--accent-cyan)"
                          }`}
                        >
                          {t("table.edit")}
                        </button>
                        {testResult &&
                          testResult !== "loading" &&
                          (testResult.ok ? (
                            <span className="text-xs text-green-400 whitespace-nowrap">
                              ✓ {testResult.latency_ms}ms
                            </span>
                          ) : (
                            <span
                              className="text-xs text-red-400 max-w-[160px] truncate"
                              title={testResult.error}
                            >
                              ✗ {testResult.error}
                            </span>
                          ))}
                      </div>
                    </td>
                  </tr>

                  {isEditing && (
                    <EditPanel
                      feature={feature}
                      initial={chain.map((e) => ({
                        provider: e.provider,
                        model: e.model,
                      }))}
                      knownModels={knownModels}
                      onClose={() => setEditingFeature(null)}
                      onSaved={() => router.refresh()}
                    />
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <AiModelsManager models={knownModels} />
    </div>
  );
}
