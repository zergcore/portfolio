"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { FiUploadCloud, FiAlertTriangle, FiCheckCircle, FiLoader } from "react-icons/fi";
import { previewLinkedInZip, applyLinkedInImport } from "@/app/actions/imports";

// ─── Types ───────────────────────────────────────────────────────────────────

type Action = "create" | "merge" | "skip";

interface MatchCandidate {
  id: string;
  label: string;
}

interface PreviewRow {
  row_id: string;
  parsed: Record<string, unknown>;
  matches: MatchCandidate[];
  default_action: Action;
  parse_error?: string | null;
}

interface PreviewCategory {
  rows: PreviewRow[];
}

interface PreviewResponse {
  import_session_id: string;
  expires_at: string;
  categories: Record<string, PreviewCategory>;
  warnings: string[];
}

interface RowAction {
  row_id: string;
  action: Action;
  target_id?: string;
}

// ─── Category labels ─────────────────────────────────────────────────────────

const CAT_LABELS: Record<string, string> = {
  positions: "Work Positions",
  education: "Education (Degrees)",
  certifications: "Certifications",
  honors: "Honors & Awards",
  skills: "Skills",
  projects: "Projects",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rowLabel(catKey: string, parsed: Record<string, unknown>): string {
  if (catKey === "positions") {
    const role = (parsed.role as Record<string, string> | undefined)?.en ?? "";
    return `${role} @ ${parsed.company ?? "?"}`;
  }
  if (catKey === "education" || catKey === "certifications" || catKey === "honors") {
    const degree = (parsed.degree as Record<string, string> | undefined)?.en ?? "";
    return `${degree} — ${parsed.institution ?? "?"}`;
  }
  if (catKey === "skills") return String(parsed.name ?? "?");
  if (catKey === "projects") {
    const title = (parsed.title as Record<string, string> | undefined)?.en ?? "";
    return title || String(parsed.slug ?? "?");
  }
  return JSON.stringify(parsed).slice(0, 60);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LinkedInImportClient() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Upload phase
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview phase
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [enabledCats, setEnabledCats] = useState<Set<string>>(new Set());
  const [rowActions, setRowActions] = useState<Map<string, RowAction>>(new Map());

  // Apply phase
  const [applyResult, setApplyResult] = useState<{
    created: number;
    merged: number;
    skipped: number;
    errors: string[];
  } | null>(null);

  // ─── Upload handler ────────────────────────────────────────────────────────

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploadError(null);
    setPreview(null);
    setApplyResult(null);

    const fd = new FormData();
    fd.append("file", file);

    startTransition(async () => {
      try {
        const data: PreviewResponse = await previewLinkedInZip(fd);
        setPreview(data);

        // Enable all categories that have at least one row
        const cats = new Set(
          Object.entries(data.categories)
            .filter(([, cat]) => cat.rows.length > 0)
            .map(([k]) => k)
        );
        setEnabledCats(cats);

        // Initialise row actions from defaults
        const actions = new Map<string, RowAction>();
        for (const [, cat] of Object.entries(data.categories)) {
          for (const row of cat.rows) {
            actions.set(row.row_id, {
              row_id: row.row_id,
              action: row.default_action,
              target_id: row.matches[0]?.id,
            });
          }
        }
        setRowActions(actions);
      } catch (e: unknown) {
        setUploadError(e instanceof Error ? e.message : "Upload failed.");
      }
    });
  }

  // ─── Apply handler ─────────────────────────────────────────────────────────

  function handleApply() {
    if (!preview) return;

    // Collect only actions for enabled categories
    const actions: RowAction[] = [];
    for (const [catKey, cat] of Object.entries(preview.categories)) {
      if (!enabledCats.has(catKey)) continue;
      for (const row of cat.rows) {
        const a = rowActions.get(row.row_id);
        if (a) actions.push(a);
      }
    }

    startTransition(async () => {
      try {
        const result = await applyLinkedInImport({
          import_session_id: preview.import_session_id,
          actions,
        });
        setApplyResult(result);
        setPreview(null);
      } catch (e: unknown) {
        setUploadError(e instanceof Error ? e.message : "Apply failed.");
      }
    });
  }

  // ─── Row action helpers ────────────────────────────────────────────────────

  function setAction(rowId: string, action: Action) {
    setRowActions((prev) => {
      const next = new Map(prev);
      const existing = next.get(rowId);
      next.set(rowId, { ...existing!, row_id: rowId, action });
      return next;
    });
  }

  function setTarget(rowId: string, targetId: string) {
    setRowActions((prev) => {
      const next = new Map(prev);
      const existing = next.get(rowId);
      next.set(rowId, { ...existing!, row_id: rowId, target_id: targetId });
      return next;
    });
  }

  function toggleCat(cat: string) {
    setEnabledCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  // Apply result
  if (applyResult) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-4">
        <div className="flex items-center gap-3 text-[var(--color-success)]">
          <FiCheckCircle className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Import complete</h2>
        </div>
        <ul className="text-sm text-[var(--text-secondary)] space-y-1">
          <li>
            <span className="font-medium text-[var(--text-primary)]">{applyResult.created}</span>{" "}
            records created
          </li>
          <li>
            <span className="font-medium text-[var(--text-primary)]">{applyResult.merged}</span>{" "}
            records merged
          </li>
          <li>
            <span className="font-medium text-[var(--text-primary)]">{applyResult.skipped}</span>{" "}
            skipped
          </li>
        </ul>
        {applyResult.errors.length > 0 && (
          <div className="rounded-lg bg-[var(--color-error)]/10 border border-[var(--color-error)]/30 px-4 py-3 space-y-1">
            <p className="text-xs font-semibold text-[var(--color-error)]">Errors</p>
            {applyResult.errors.map((e, i) => (
              <p key={i} className="text-xs text-[var(--color-error)]">
                {e}
              </p>
            ))}
          </div>
        )}
        <p className="text-xs text-[var(--text-muted)]">
          ES translations for imported EN content will appear in the{" "}
          <Link href="/admin/translations" className="underline text-[var(--accent-cyan)]">
            Translation Queue
          </Link>{" "}
          once you run{" "}
          <code className="text-[var(--accent-cyan)]">python -m app.tools.translate_seed</code>.
        </p>
        <button
          onClick={() => {
            setApplyResult(null);
            if (fileRef.current) fileRef.current.value = "";
          }}
          className="text-sm text-[var(--accent-violet)] underline"
        >
          Import another ZIP
        </button>
      </div>
    );
  }

  // Preview phase
  if (preview) {
    const totalRows = Object.values(preview.categories).reduce(
      (s, c) => s + c.rows.length,
      0
    );
    return (
      <div className="space-y-6">
        {/* Warnings */}
        {preview.warnings.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-amber-500 text-sm font-semibold">
              <FiAlertTriangle className="w-4 h-4" />
              Parse warnings
            </div>
            {preview.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-400">
                {w}
              </p>
            ))}
          </div>
        )}

        {/* Summary + category toggles */}
        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {totalRows} rows parsed — choose categories to import
            </h2>
            <span className="text-xs text-[var(--text-muted)]">
              Expires{" "}
              {new Date(preview.expires_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            {Object.entries(preview.categories)
              .filter(([, cat]) => cat.rows.length > 0)
              .map(([key, cat]) => (
                <label
                  key={key}
                  className="flex items-center gap-2 cursor-pointer select-none text-sm"
                >
                  <input
                    type="checkbox"
                    checked={enabledCats.has(key)}
                    onChange={() => toggleCat(key)}
                    className="accent-[var(--accent-violet)]"
                  />
                  <span className="text-[var(--text-secondary)]">
                    {CAT_LABELS[key] ?? key}{" "}
                    <span className="text-[var(--text-muted)]">({cat.rows.length})</span>
                  </span>
                </label>
              ))}
          </div>
        </div>

        {/* Per-category rows */}
        {Object.entries(preview.categories).map(([catKey, cat]) => {
          if (cat.rows.length === 0) return null;
          const isEnabled = enabledCats.has(catKey);
          return (
            <div
              key={catKey}
              className={`rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden transition-opacity ${
                isEnabled ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                  {CAT_LABELS[catKey] ?? catKey}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">{cat.rows.length} rows</span>
              </div>

              <div className="divide-y divide-[var(--border-subtle)]">
                {cat.rows.map((row) => {
                  const act = rowActions.get(row.row_id);
                  return (
                    <div key={row.row_id} className="px-5 py-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                      {/* Label + parse error */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[var(--text-primary)] truncate">
                          {row.parse_error ? (
                            <span className="text-amber-400">
                              ⚠ {row.parse_error}
                            </span>
                          ) : (
                            rowLabel(catKey, row.parsed)
                          )}
                        </p>
                        {row.matches.length > 0 && (
                          <p className="text-xs text-[var(--text-muted)] mt-0.5">
                            Existing match: {row.matches[0].label}
                          </p>
                        )}
                      </div>

                      {/* Action selector */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {(["create", "merge", "skip"] as Action[]).map((a) => (
                          <button
                            key={a}
                            disabled={!isEnabled || !!row.parse_error}
                            onClick={() => setAction(row.row_id, a)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              act?.action === a
                                ? a === "create"
                                  ? "bg-[var(--accent-violet)]/20 text-[var(--accent-violet)] ring-1 ring-[var(--accent-violet)]/40"
                                  : a === "merge"
                                  ? "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] ring-1 ring-[var(--accent-cyan)]/40"
                                  : "bg-[var(--bg-elevated)] text-[var(--text-muted)] ring-1 ring-[var(--border-subtle)]"
                                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)]"
                            }`}
                          >
                            {a === "create" ? "✚ Create" : a === "merge" ? "↻ Merge" : "— Skip"}
                          </button>
                        ))}

                        {/* Target selector for merge */}
                        {act?.action === "merge" && row.matches.length > 1 && (
                          <select
                            value={act.target_id ?? ""}
                            onChange={(e) => setTarget(row.row_id, e.target.value)}
                            className="text-xs rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-1"
                          >
                            {row.matches.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Apply / cancel buttons */}
        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handleApply}
            disabled={isPending || enabledCats.size === 0}
            className="px-5 py-2.5 rounded-lg bg-[var(--accent-violet)] text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {isPending && <FiLoader className="w-4 h-4 animate-spin" />}
            Apply changes
          </button>
          <button
            onClick={() => {
              setPreview(null);
              if (fileRef.current) fileRef.current.value = "";
            }}
            className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Upload phase
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 space-y-5">
      <h2 className="text-base font-semibold text-[var(--text-primary)]">Upload ZIP file</h2>

      {/* Export instructions */}
      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-3 space-y-2 text-sm text-[var(--text-secondary)]">
        <p className="font-medium text-[var(--text-primary)]">How to get the correct ZIP from LinkedIn</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Go to <strong>LinkedIn → Settings &amp; Privacy → Data Privacy → Get a copy of your data</strong></li>
          <li>Choose the <strong>first option</strong>: <em>&quot;Download larger data archive…&quot;</em></li>
          <li>Click <strong>Request archive</strong> and verify your password</li>
          <li>LinkedIn emails the ZIP &mdash; small accounts in 10&ndash;60 minutes, up to 24 hours officially</li>
        </ol>
        <p className="text-xs text-[var(--text-muted)] pt-1">
          Don&apos;t use <em>&quot;Want something in particular?&quot;</em> &mdash; it no longer offers Positions, Education, Skills, Projects, Certifications, or Honors. Those CSVs only ship with the larger archive.
        </p>
        <p className="text-xs text-amber-400 flex items-start gap-1.5 pt-1">
          <FiAlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          LinkedIn rate-limits export requests. After requesting, you must wait <strong>2&ndash;4 hours</strong> before you can request another.
        </p>
      </div>

      <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-10 cursor-pointer hover:border-[var(--accent-violet)]/50 transition-colors group">
        <FiUploadCloud className="w-10 h-10 text-[var(--text-muted)] group-hover:text-[var(--accent-violet)] transition-colors" />
        <span className="text-sm text-[var(--text-secondary)] text-center">
          Click to select your LinkedIn export <strong>.zip</strong>
          <br />
          <span className="text-xs text-[var(--text-muted)]">Max 50 MB</span>
        </span>
        <input
          ref={fileRef}
          type="file"
          accept=".zip,application/zip"
          className="sr-only"
          onChange={handleUpload}
        />
      </label>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <FiLoader className="w-4 h-4 animate-spin text-[var(--accent-violet)]" />
          Parsing ZIP — this usually takes a few seconds…
        </div>
      )}

      {uploadError && (
        <div className="rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 px-4 py-3 text-sm text-[var(--color-error)]">
          {uploadError}
        </div>
      )}
    </div>
  );
}
