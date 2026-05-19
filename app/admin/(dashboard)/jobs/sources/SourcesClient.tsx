"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJobPlatform, ApiJobSource } from "@/lib/api";
import {
  createJobSourceAction,
  deleteJobSourceAction,
  updateJobSourceAction,
} from "@/app/actions/jobs";

const PLATFORM_HELP: Record<string, { desc: string; verifyUrl: string; example: string }> = {
  greenhouse: {
    desc: "Used by Stripe, Shopify, Notion, Discord, Cloudflare, Anthropic, OpenAI, Figma, Brex…",
    verifyUrl: "https://boards.greenhouse.io/{slug}",
    example: "stripe",
  },
  lever: {
    desc: "Used by Netflix, Reddit, Plaid, Linear, Coda…",
    verifyUrl: "https://jobs.lever.co/{slug}",
    example: "netflix",
  },
  ashby: {
    desc: "Used by Linear, Vercel, Notion (new boards), Loom, Retool, Raycast…",
    verifyUrl: "https://jobs.ashbyhq.com/{slug}",
    example: "linear",
  },
  remoteok: {
    desc: "Tag-based aggregator. Identifier is a technology keyword, not a company name.",
    verifyUrl: "https://remoteok.com/remote-{slug}-jobs",
    example: "python",
  },
};

const RECOMMENDED: { platform: string; identifier: string; note: string }[] = [
  { platform: "greenhouse", identifier: "stripe",       note: "Stripe" },
  { platform: "greenhouse", identifier: "shopify",      note: "Shopify" },
  { platform: "greenhouse", identifier: "anthropic",    note: "Anthropic" },
  { platform: "greenhouse", identifier: "openai",       note: "OpenAI" },
  { platform: "greenhouse", identifier: "cloudflare",   note: "Cloudflare" },
  { platform: "greenhouse", identifier: "notion",       note: "Notion" },
  { platform: "ashby",      identifier: "linear",       note: "Linear" },
  { platform: "ashby",      identifier: "vercel",       note: "Vercel" },
  { platform: "lever",      identifier: "plaid",        note: "Plaid" },
  { platform: "lever",      identifier: "reddit",       note: "Reddit" },
  { platform: "remoteok",   identifier: "python",       note: "All remote Python jobs" },
  { platform: "remoteok",   identifier: "ai",           note: "All remote AI/ML jobs" },
  { platform: "remoteok",   identifier: "typescript",   note: "All remote TypeScript jobs" },
];

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
  const [showHelp, setShowHelp] = useState(sources.length === 0);

  const platformInfo = PLATFORM_HELP[platform];
  const existingKeys = new Set(sources.map((s) => `${s.platform}/${s.identifier}`));

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
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      setSources((prev) => [...prev, res.data as ApiJobSource]);
      setIdentifier("");
      router.refresh();
    }
  }

  async function addRecommended(p: string, id: string) {
    setBusy(`rec-${p}-${id}`);
    setError(null);
    const res = await createJobSourceAction({ platform: p, identifier: id, enabled: true });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
    if (res.data) {
      setSources((prev) => [...prev, res.data as ApiJobSource]);
      router.refresh();
    }
  }

  async function toggleEnabled(src: ApiJobSource) {
    setBusy(src.id);
    setError(null);
    const res = await updateJobSourceAction(src.id, { enabled: !src.enabled });
    setBusy(null);
    if (res.error) { setError(res.error); return; }
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
    if (res.error) { setError(res.error); return; }
    setSources((prev) => prev.filter((s) => s.id !== src.id));
    router.refresh();
  }

  return (
    <>
      {/* Help section */}
      <div className="mb-6 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden">
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] transition-colors"
        >
          <span>How sources work</span>
          <span className="text-[var(--text-secondary)]">{showHelp ? "▲" : "▼"}</span>
        </button>

        {showHelp && (
          <div className="px-4 pb-5 pt-1 space-y-4 border-t border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--text-secondary)]">
              Each source is a <strong className="text-[var(--text-primary)]">(platform, identifier)</strong> pair.
              The daily poller fetches open job listings from that board and scores them against your profile.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(PLATFORM_HELP).map(([code, info]) => {
                const p = platforms.find((pl) => pl.code === code);
                if (!p) return null;
                return (
                  <div key={code} className="rounded-md bg-[var(--bg-elevated)] p-3 text-sm">
                    <p className="font-semibold text-[var(--text-primary)]">{p.display_name}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-0.5">{info.desc}</p>
                    <p className="text-[var(--text-secondary)] text-xs mt-1">
                      Find the slug in the URL: <code className="text-[var(--accent-cyan)]">{info.verifyUrl}</code>
                    </p>
                    <p className="text-[var(--text-secondary)] text-xs mt-0.5">
                      Example identifier: <code className="text-[var(--accent-violet)]">{info.example}</code>
                    </p>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--text-primary)] mb-2">Recommended sources — click to add</p>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED.map(({ platform: p, identifier: id, note }) => {
                  const key = `${p}/${id}`;
                  const already = existingKeys.has(key);
                  const platformEnabled = platforms.find((pl) => pl.code === p)?.enabled;
                  if (!platformEnabled) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => !already && addRecommended(p, id)}
                      disabled={already || busy === `rec-${p}-${id}`}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        already
                          ? "border-emerald-500/40 text-emerald-300 cursor-default"
                          : "border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)]"
                      }`}
                      title={`${p}/${id}`}
                    >
                      {already ? "✓ " : ""}{note}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add form */}
      <form
        onSubmit={onCreate}
        className="mb-6 flex flex-col md:flex-row gap-3 p-4 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)]"
      >
        <div className="flex flex-col gap-1 flex-shrink-0">
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
                  {p.display_name}{p.enabled ? "" : " (disabled)"}
                </option>
              ))
            )}
          </select>
          {platformInfo && (
            <p className="text-xs text-[var(--text-secondary)] px-1">
              e.g. <code className="text-[var(--accent-violet)]">{platformInfo.example}</code>
            </p>
          )}
        </div>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder={
            platformInfo
              ? `Board slug or tag (e.g. ${platformInfo.example})`
              : "Board slug or tag"
          }
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
                  No sources configured yet. Add one above or use the recommended list.
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
