"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJobPlatform, ApiJobSource } from "@/lib/api";
import {
  createJobSourceAction,
  deleteJobSourceAction,
  updateJobSourceAction,
} from "@/app/actions/jobs";

export default function SourcesClient({
  initialSources,
  platforms,
}: {
  initialSources: ApiJobSource[];
  platforms: ApiJobPlatform[];
}) {
  const router = useRouter();
  const [sources, setSources] = useState<ApiJobSource[]>(initialSources);
  const [platform, setPlatform] = useState<string>(platforms[0]?.code ?? "");
  const [identifier, setIdentifier] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!platform || !identifier.trim()) return;
    setBusy("create");
    setError(null);
    const res = await createJobSourceAction({
      platform,
      identifier: identifier.trim(),
      enabled: true,
    });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setSources((prev) => [...prev, res.data as ApiJobSource]);
      setIdentifier("");
      router.refresh();
    }
  }

  async function toggleEnabled(src: ApiJobSource) {
    setBusy(src.id);
    setError(null);
    const res = await updateJobSourceAction(src.id, { enabled: !src.enabled });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setSources((prev) =>
        prev.map((s) => (s.id === src.id ? (res.data as ApiJobSource) : s))
      );
      router.refresh();
    }
  }

  async function onDelete(src: ApiJobSource) {
    if (!confirm(`Delete source ${src.platform}/${src.identifier}? Its poll history will also be removed.`))
      return;
    setBusy(src.id);
    setError(null);
    const res = await deleteJobSourceAction(src.id);
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setSources((prev) => prev.filter((s) => s.id !== src.id));
    router.refresh();
  }

  return (
    <>
      <form
        onSubmit={onCreate}
        className="mb-6 flex flex-col md:flex-row gap-3 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      >
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
        >
          {platforms.length === 0 ? (
            <option value="">(no platforms — seed job_platforms first)</option>
          ) : (
            platforms.map((p) => (
              <option key={p.code} value={p.code} disabled={!p.enabled}>
                {p.display_name}
                {p.enabled ? "" : " (disabled)"}
              </option>
            ))
          )}
        </select>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="board slug or tag (e.g. stripe / python)"
          className="flex-1 px-3 py-2 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-sm"
        />
        <button
          type="submit"
          disabled={busy === "create" || !platform || !identifier.trim()}
          className="px-4 py-2 rounded-md bg-[var(--accent-violet)] text-white text-sm font-medium hover:bg-[var(--accent-violet)]/90 disabled:opacity-50"
        >
          {busy === "create" ? "Adding…" : "Add source"}
        </button>
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 text-left">Platform</th>
              <th className="px-4 py-2 text-left">Identifier</th>
              <th className="px-4 py-2 text-left">Enabled</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-[var(--text-secondary)] italic">
                  No sources configured yet. Add one above to start polling.
                </td>
              </tr>
            ) : (
              sources.map((s) => (
                <tr key={s.id} className="border-t border-[var(--border-subtle)]">
                  <td className="px-4 py-2 text-[var(--text-primary)]">{s.platform}</td>
                  <td className="px-4 py-2 text-[var(--text-primary)] font-mono">{s.identifier}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => toggleEnabled(s)}
                      disabled={busy === s.id}
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        s.enabled
                          ? "bg-emerald-500/15 text-emerald-300"
                          : "bg-red-500/15 text-red-300"
                      } disabled:opacity-50`}
                    >
                      {s.enabled ? "enabled" : "disabled"}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => onDelete(s)}
                      disabled={busy === s.id}
                      className="text-xs text-red-300 hover:text-red-200 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
