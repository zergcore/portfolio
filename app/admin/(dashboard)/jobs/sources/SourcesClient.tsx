"use client";

import { Fragment, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiJobPlatform, ApiJobSource } from "@/lib/api";
import {
  createJobSourceAction,
  deleteJobSourceAction,
  SourceTestResult,
  testJobSourceAction,
  updateJobSourceAction,
  forcePollSourcesAction,
} from "@/app/actions/jobs";

const MCP_HTTP_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/api\/v1\/?$/,
  "/api/mcp/",
);

const PLATFORM_HELP: Record<
  string,
  { desc: string; verifyUrl: string; example: string }
> = {
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
  workable: {
    desc: 'Global job board feed (jobs.workable.com). Identifier is a search query (e.g. "python remote", "frontend").',
    verifyUrl: "https://jobs.workable.com/search?query={slug}",
    example: "python remote",
  },
  remoteok: {
    desc: "Tag-based aggregator. Comma-separate multiple tags in one source: react.js,next.js",
    verifyUrl: "https://remoteok.com/remote-{slug}-jobs",
    example: "python",
  },
  remotive: {
    desc: "Remote-only aggregator. Identifier is a category slug.",
    verifyUrl: "https://remotive.com/remote-jobs/{slug}",
    example: "software-dev",
  },
  jobicy: {
    desc: "Remote-only aggregator. Identifier is a job tag (single tag per source).",
    verifyUrl: "https://jobicy.com/?s={slug}",
    example: "python",
  },
  recruitee: {
    desc: "Per-company subdomain board. Only works if the company has the public board enabled (most do).",
    verifyUrl: "https://{slug}.recruitee.com/",
    example: "frisbii",
  },
  smartrecruiters: {
    desc: "Used by Continental, IKEA, Bosch, and thousands of enterprises. Identifier is the company name (case-sensitive).",
    verifyUrl: "https://careers.smartrecruiters.com/{slug}",
    example: "Continental",
  },
  arbeitnow: {
    desc: 'Free EU-leaning aggregator across many ATSes. Identifier is a search query (e.g. "python remote").',
    verifyUrl: "https://www.arbeitnow.com/?search={slug}",
    example: "python remote",
  },
};

const RECOMMENDED: { platform: string; identifier: string; note: string }[] = [
  { platform: "greenhouse", identifier: "stripe", note: "Stripe" },
  { platform: "greenhouse", identifier: "shopify", note: "Shopify" },
  { platform: "greenhouse", identifier: "anthropic", note: "Anthropic" },
  { platform: "greenhouse", identifier: "openai", note: "OpenAI" },
  { platform: "greenhouse", identifier: "cloudflare", note: "Cloudflare" },
  { platform: "greenhouse", identifier: "notion", note: "Notion" },
  { platform: "ashby", identifier: "linear", note: "Linear" },
  { platform: "ashby", identifier: "vercel", note: "Vercel" },
  { platform: "lever", identifier: "plaid", note: "Plaid" },
  { platform: "lever", identifier: "reddit", note: "Reddit" },
  {
    platform: "workable",
    identifier: "python remote",
    note: "Workable: Python remote",
  },
  { platform: "workable", identifier: "frontend", note: "Workable: Frontend" },
  { platform: "remoteok", identifier: "python", note: "Remote Python jobs" },
  { platform: "remoteok", identifier: "ai", note: "Remote AI/ML jobs" },
  {
    platform: "remoteok",
    identifier: "typescript",
    note: "Remote TypeScript jobs",
  },
  {
    platform: "remotive",
    identifier: "software-dev",
    note: "Remotive Software Dev",
  },
  {
    platform: "remotive",
    identifier: "devops-sysadmin",
    note: "Remotive DevOps",
  },
  { platform: "jobicy", identifier: "python", note: "Jobicy Python" },
  { platform: "jobicy", identifier: "react", note: "Jobicy React" },
  {
    platform: "smartrecruiters",
    identifier: "Continental",
    note: "Continental (SR)",
  },
  { platform: "smartrecruiters", identifier: "IKEA", note: "IKEA (SR)" },
];

interface EditState {
  id: string;
  platform: string;
  identifier: string;
}

interface TestState {
  id: string;
  result: SourceTestResult | null;
  error: string;
}

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
  const [editing, setEditing] = useState<EditState | null>(null);
  const [testState, setTestState] = useState<TestState | null>(null);
  const [showMcp, setShowMcp] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const platformInfo = PLATFORM_HELP[platform];
  const existingKeys = new Set(
    sources.map((s) => `${s.platform}/${s.identifier}`),
  );

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    });
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(new Set(sources.map(s => s.id)));
    } else {
      setSelectedIds(new Set());
    }
  }

  function toggleSelect(id: string, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  }

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

  async function addRecommended(p: string, id: string) {
    setBusy(`rec-${p}-${id}`);
    setError(null);
    const res = await createJobSourceAction({
      platform: p,
      identifier: id,
      enabled: true,
    });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
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
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setSources((prev) =>
        prev.map((s) => (s.id === src.id ? (res.data as ApiJobSource) : s)),
      );
      router.refresh();
    }
  }

  function startEdit(src: ApiJobSource) {
    setEditing({
      id: src.id,
      platform: src.platform,
      identifier: src.identifier,
    });
    setError(null);
    setTestState(null);
  }

  function cancelEdit() {
    setEditing(null);
    setError(null);
  }

  async function saveEdit() {
    if (!editing) return;
    const trimmed = editing.identifier.trim();
    if (!editing.platform || !trimmed) return;
    setBusy(`edit-${editing.id}`);
    setError(null);
    const res = await updateJobSourceAction(editing.id, {
      platform: editing.platform,
      identifier: trimmed,
    });
    setBusy(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data) {
      setSources((prev) =>
        prev.map((s) => (s.id === editing.id ? (res.data as ApiJobSource) : s)),
      );
      setEditing(null);
      router.refresh();
    }
  }

  async function onDelete(src: ApiJobSource) {
    if (
      !confirm(
        `Delete source ${src.platform}/${src.identifier}? Its poll history will also be removed.`,
      )
    )
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
    if (editing?.id === src.id) setEditing(null);
    if (testState?.id === src.id) setTestState(null);
    router.refresh();
  }

  async function onTest(src: ApiJobSource) {
    setBusy(`test-${src.id}`);
    setTestState({ id: src.id, result: null, error: "" });
    setError(null);
    const res = await testJobSourceAction(src.id);
    setBusy(null);
    if (res.error) {
      setTestState({ id: src.id, result: null, error: res.error });
      return;
    }
    setTestState({
      id: src.id,
      result: res.data as SourceTestResult,
      error: "",
    });
  }

  const claudeCodeCmd = `claude mcp add zergcore-jobs --transport http \\\n  -H "Authorization: Bearer <MCP_ADMIN_TOKEN>" \\\n  ${MCP_HTTP_URL}`;
  const localStdioCmd = `cd backend\nsource .venv/bin/activate\nMCP_ADMIN_TOKEN=<your-token> python -m app.jobs.mcp`;
  const desktopJson = JSON.stringify(
    {
      mcpServers: {
        "zergcore-jobs": {
          command: "/path/to/backend/.venv/bin/python",
          args: ["-m", "app.jobs.mcp"],
          cwd: "/path/to/portfolio/backend",
          env: {
            DATABASE_URL: "postgresql+asyncpg://...",
            GEMINI_API_KEY: "your-key",
            MCP_ADMIN_TOKEN: "your-token",
          },
        },
      },
    },
    null,
    2,
  );

  return (
    <>
      {/* Help section */}
      <div className="mb-6 rounded-lg border border-(--border-subtle) bg-(--bg-surface) overflow-hidden">
        <button
          onClick={() => setShowHelp((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-(--bg-elevated) transition-colors"
        >
          <span>How sources work</span>
          <span className="text-(--text-secondary)">
            {showHelp ? "▲" : "▼"}
          </span>
        </button>

        {showHelp && (
          <div className="px-4 pb-5 pt-1 space-y-4 border-t border-(--border-subtle)">
            <p className="text-sm text-(--text-secondary)">
              Each source is a{" "}
              <strong className="text-foreground">
                (platform, identifier)
              </strong>{" "}
              pair. The daily poller fetches open job listings from that board
              and scores them against your profile.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(PLATFORM_HELP).map(([code, info]) => {
                const p = platforms.find((pl) => pl.code === code);
                if (!p) return null;
                return (
                  <div
                    key={code}
                    className="rounded-md bg-(--bg-elevated) p-3 text-sm"
                  >
                    <p className="font-semibold text-foreground">
                      {p.display_name}
                    </p>
                    <p className="text-(--text-secondary) text-xs mt-0.5">
                      {info.desc}
                    </p>
                    <p className="text-(--text-secondary) text-xs mt-1">
                      Find the slug in the URL:{" "}
                      <code className="text-(--accent-cyan)">
                        {info.verifyUrl}
                      </code>
                    </p>
                    <p className="text-(--text-secondary) text-xs mt-0.5">
                      Example identifier:{" "}
                      <code className="text-(--accent-violet)">
                        {info.example}
                      </code>
                    </p>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-sm font-medium text-foreground mb-2">
                Recommended sources — click to add
              </p>
              <div className="flex flex-wrap gap-2">
                {RECOMMENDED.map(({ platform: p, identifier: id, note }) => {
                  const key = `${p}/${id}`;
                  const already = existingKeys.has(key);
                  const platformEnabled = platforms.find(
                    (pl) => pl.code === p,
                  )?.enabled;
                  if (!platformEnabled) return null;
                  return (
                    <button
                      key={key}
                      onClick={() => !already && addRecommended(p, id)}
                      disabled={already || busy === `rec-${p}-${id}`}
                      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                        already
                          ? "border-emerald-500/40 text-emerald-300 cursor-default"
                          : "border-(--border-subtle) text-(--text-secondary) hover:border-(--accent-cyan) hover:text-(--accent-cyan)"
                      }`}
                      title={`${p}/${id}`}
                    >
                      {already ? "✓ " : ""}
                      {note}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MCP setup */}
      <div className="mb-6 rounded-lg border border-(--border-subtle) bg-(--bg-surface) overflow-hidden">
        <button
          type="button"
          onClick={() => setShowMcp((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-(--bg-elevated) transition-colors"
        >
          <span>Claude / AI client setup (MCP)</span>
          <span className="text-(--text-secondary)">{showMcp ? "▲" : "▼"}</span>
        </button>

        {showMcp && (
          <div className="px-4 pb-5 pt-1 space-y-5 border-t border-(--border-subtle) text-sm">
            <p className="text-(--text-secondary)">
              The backend exposes all 9 job-pipeline tools over the{" "}
              <strong className="text-foreground">
                Model Context Protocol (MCP)
              </strong>
              . Connect Claude Code or Claude Desktop to drive job search from
              chat — no admin UI needed. Write tools require{" "}
              <code className="text-(--accent-cyan)">MCP_ADMIN_TOKEN</code> (set
              it in Render env vars).
            </p>

            {/* HTTP transport — Claude Code */}
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                Option A — HTTP (deployed backend, Claude Code)
              </p>
              <p className="text-xs text-(--text-secondary)">
                Endpoint:{" "}
                <code className="text-(--accent-cyan)">{MCP_HTTP_URL}</code>
              </p>
              <div className="relative">
                <pre className="rounded-lg bg-(--bg-elevated) px-4 py-3 text-xs text-foreground overflow-x-auto whitespace-pre">
                  {claudeCodeCmd}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText(claudeCodeCmd, "http")}
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background border border-(--border-subtle) text-(--text-secondary) hover:text-foreground transition-colors"
                >
                  {copied === "http" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Stdio — local */}
            <div className="space-y-2">
              <p className="font-medium text-foreground">
                Option B — stdio (local backend, any MCP client)
              </p>
              <div className="relative">
                <pre className="rounded-lg bg-(--bg-elevated) px-4 py-3 text-xs text-foreground overflow-x-auto whitespace-pre">
                  {localStdioCmd}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText(localStdioCmd, "stdio")}
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background border border-(--border-subtle) text-(--text-secondary) hover:text-foreground transition-colors"
                >
                  {copied === "stdio" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-(--text-secondary)">
                Then add to{" "}
                <code className="text-(--accent-cyan)">
                  ~/.config/Claude/claude_desktop_config.json
                </code>{" "}
                (Linux) or{" "}
                <code className="text-(--accent-cyan)">
                  ~/Library/Application
                  Support/Claude/claude_desktop_config.json
                </code>{" "}
                (macOS):
              </p>
              <div className="relative">
                <pre className="rounded-lg bg-(--bg-elevated) px-4 py-3 text-xs text-foreground overflow-x-auto whitespace-pre">
                  {desktopJson}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText(desktopJson, "desktop")}
                  className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-background border border-(--border-subtle) text-(--text-secondary) hover:text-foreground transition-colors"
                >
                  {copied === "desktop" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <p className="text-xs text-(--text-secondary)">
              Generate a secure token:{" "}
              <code className="text-(--accent-cyan)">openssl rand -hex 32</code>{" "}
              — set the same value as{" "}
              <code className="text-(--accent-cyan)">MCP_ADMIN_TOKEN</code> in
              the backend env and in your MCP client config.
            </p>
          </div>
        )}
      </div>

      {/* Add form */}
      <form
        onSubmit={onCreate}
        className="mb-6 flex flex-col md:flex-row gap-3 p-4 rounded-lg border border-(--border-subtle) bg-(--bg-surface)"
      >
        <div className="flex flex-col gap-1 shrink-0">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="px-3 py-2 rounded-md bg-(--bg-elevated) border border-(--border-subtle) text-foreground text-sm"
          >
            {platforms.length === 0 ? (
              <option value="">
                (no platforms — seed job_platforms first)
              </option>
            ) : (
              platforms.map((p) => (
                <option key={p.code} value={p.code} disabled={!p.enabled}>
                  {p.display_name}
                  {p.enabled ? "" : " (disabled)"}
                </option>
              ))
            )}
          </select>
          {platformInfo && (
            <p className="text-xs text-(--text-secondary) px-1">
              e.g.{" "}
              <code className="text-(--accent-violet)">
                {platformInfo.example}
              </code>
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
          className="flex-1 px-3 py-2 rounded-md bg-(--bg-elevated) border border-(--border-subtle) text-foreground text-sm"
        />
        <button
          type="submit"
          disabled={busy === "create" || !platform || !identifier.trim()}
          className="px-4 py-2 rounded-md bg-(--accent-violet) text-white text-sm font-medium hover:bg-(--accent-violet)/90 disabled:opacity-50"
        >
          {busy === "create" ? "Adding…" : "Add source"}
        </button>
      </form>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/40 text-sm text-red-300">
          {error}
        </div>
      )}

      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 bg-(--bg-elevated) border border-(--accent-violet)/30 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{selectedIds.size} selected</span>
          <div className="flex gap-2">
             <button className="px-3 py-1.5 text-xs bg-(--bg-surface) border border-(--border-subtle) rounded-md text-foreground hover:bg-(--bg-elevated)" onClick={async () => {
                 setBusy("bulk");
                 for (const id of selectedIds) {
                     await updateJobSourceAction(id, {enabled: true});
                 }
                 setBusy(null);
                 router.refresh();
             }}>Enable</button>
             <button className="px-3 py-1.5 text-xs bg-(--bg-surface) border border-(--border-subtle) rounded-md text-foreground hover:bg-(--bg-elevated)" onClick={async () => {
                 setBusy("bulk");
                 for (const id of selectedIds) {
                     await updateJobSourceAction(id, {enabled: false});
                 }
                 setBusy(null);
                 router.refresh();
             }}>Disable</button>
             <button className="px-3 py-1.5 text-xs bg-(--accent-violet) text-white rounded-md hover:bg-(--accent-violet)/90" onClick={async () => {
                 const res = await forcePollSourcesAction(Array.from(selectedIds));
                 if (res.error) {
                     alert("Failed to start poll: " + res.error);
                 } else {
                     setSelectedIds(new Set());
                 }
                 setBusy(null);
                 router.refresh();
             }}>Force Re-poll</button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-(--border-subtle) bg-(--bg-surface) overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-(--bg-elevated) text-(--text-secondary) text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-2 w-10"><input type="checkbox" checked={sources.length > 0 && selectedIds.size === sources.length} onChange={(e) => toggleSelectAll(e.target.checked)} className="rounded border-(--border-subtle) bg-(--bg-surface) text-(--accent-violet) focus:ring-(--accent-violet)"/></th>
              <th className="px-4 py-2 text-left">Platform</th>
              <th className="px-4 py-2 text-left">Identifier</th>
              <th className="px-4 py-2 text-left">Enabled</th>
              <th className="px-4 py-2 text-left">Health</th>
              <th className="px-4 py-2 text-right">Jobs (New / Total)</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sources.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-6 text-center text-(--text-secondary) italic"
                >
                  No sources configured yet. Add one above or use the
                  recommended list.
                </td>
              </tr>
            ) : (
              sources.map((s) => {
                const isEditing = editing?.id === s.id;
                const isBusy =
                  busy === s.id ||
                  busy === `edit-${s.id}` ||
                  busy === `test-${s.id}`;
                const isTesting = busy === `test-${s.id}`;
                const testResult = testState?.id === s.id ? testState : null;

                if (isEditing) {
                  return (
                    <tr
                      key={s.id}
                      className="border-t border-(--border-subtle) bg-(--bg-elevated)"
                    >
                      <td className="px-3 py-2"></td>
                      <td className="px-3 py-2">
                        <select
                          value={editing.platform}
                          onChange={(e) =>
                            setEditing({ ...editing, platform: e.target.value })
                          }
                          className="w-full px-2 py-1.5 rounded-md bg-elevated border border-(--accent-violet)/60 text-foreground text-sm"
                        >
                          {platforms.map((p) => (
                            <option
                              key={p.code}
                              value={p.code}
                              disabled={!p.enabled}
                            >
                              {p.display_name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={editing.identifier}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              identifier: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit();
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="w-full px-2 py-1.5 rounded-md bg-elevated border border-(--accent-violet)/60 text-foreground text-sm font-mono"
                        />
                      </td>
                      <td className="px-3 py-2 text-xs text-(--text-secondary)">
                        (saved)
                      </td>
                      <td className="px-3 py-2 text-xs text-(--text-secondary)">
                        —
                      </td>
                      <td className="px-3 py-2 text-xs text-(--text-secondary)">
                        —
                      </td>
                      <td className="px-3 py-2 text-xs text-(--text-secondary)">
                        —
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="inline-flex gap-2">
                          <button
                            onClick={saveEdit}
                            disabled={isBusy || !editing.identifier.trim()}
                            className="text-xs px-3 py-1 rounded-md bg-(--accent-violet) text-white hover:bg-(--accent-violet)/90 disabled:opacity-50 transition-colors"
                          >
                            {isBusy ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={isBusy}
                            className="text-xs px-3 py-1 rounded-md border border-(--border-subtle) text-(--text-secondary) hover:text-foreground disabled:opacity-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </span>
                      </td>
                    </tr>
                  );
                }

                return (
                  <Fragment key={s.id}>
                    <tr className="border-t border-(--border-subtle) hover:bg-(--bg-elevated)/50">
                      <td className="px-4 py-2"><input type="checkbox" checked={selectedIds.has(s.id)} onChange={(e) => toggleSelect(s.id, e.target.checked)} className="rounded border-(--border-subtle) bg-(--bg-surface) text-(--accent-violet) focus:ring-(--accent-violet)"/></td>
                      <td className="px-4 py-2 text-foreground">
                        {s.platform}
                      </td>
                      <td className="px-4 py-2 text-foreground font-mono">
                        {s.identifier}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => toggleEnabled(s)}
                          disabled={isBusy}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            s.enabled
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-red-500/15 text-red-300"
                          } disabled:opacity-50`}
                        >
                          {s.enabled ? "enabled" : "disabled"}
                        </button>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-col gap-0.5">
                          {s.health_status === "dormant" ? (
                            <span
                              className="text-xs text-red-300 font-medium"
                              title={`Dormant since ${s.dormant_since ? new Date(s.dormant_since).toLocaleDateString() : 'unknown'}`}
                            >
                              Dormant (≥14 empty polls)
                            </span>
                          ) : s.health_status === "blocked" ? (
                            <span
                              className="text-xs text-orange-300 font-medium"
                              title={s.last_error || "Blocked"}
                            >
                              Blocked (403/429)
                            </span>
                          ) : s.health?.last_poll_status === "success" ? (
                            <span className="text-xs text-emerald-300">
                              Healthy
                            </span>
                          ) : s.health?.last_poll_status === "error" ? (
                            <span
                              className="text-xs text-red-300"
                              title={s.health.last_error || ""}
                            >
                              Erroring
                            </span>
                          ) : (
                            <span className="text-xs text-(--text-secondary)">
                              Unknown
                            </span>
                          )}

                          {s.health?.last_success_at && (
                            <span className="text-[10px] text-(--text-secondary)">
                              Last OK:{" "}
                              {new Date(
                                s.health.last_success_at,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-sm text-foreground">{s.last_new_count !== null ? `+${s.last_new_count}` : '—'} / {s.health?.total_jobs || 0}</span>
                          {s.consecutive_empty_polls > 0 && <span className="text-[10px] text-(--text-secondary)">{s.consecutive_empty_polls} empty polls</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <span className="inline-flex gap-3">
                          <button
                            onClick={() => onTest(s)}
                            disabled={isBusy || !!editing}
                            className="text-xs text-(--accent-cyan) hover:text-(--accent-cyan)/80 disabled:opacity-40 transition-colors"
                          >
                            {isTesting ? "Testing…" : "Test"}
                          </button>
                          <button
                            onClick={() => startEdit(s)}
                            disabled={isBusy || !!editing}
                            className="text-xs text-(--text-secondary) hover:text-(--accent-cyan) disabled:opacity-40 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(s)}
                            disabled={isBusy || !!editing}
                            className="text-xs text-red-300 hover:text-red-200 disabled:opacity-40 transition-colors"
                          >
                            Delete
                          </button>
                        </span>
                      </td>
                    </tr>
                    {testResult && (
                      <tr className="border-t border-(--border-subtle) bg-(--bg-elevated)/40">
                        <td colSpan={5} className="px-4 py-3">
                          {testResult.error ? (
                            <p className="text-xs text-red-300">
                              Test error: {testResult.error}
                            </p>
                          ) : testResult.result ? (
                            <div className="space-y-1.5">
                              <p className="text-xs text-(--text-secondary)">
                                <span
                                  className={
                                    testResult.result.ok
                                      ? "text-emerald-300"
                                      : "text-red-300"
                                  }
                                >
                                  {testResult.result.ok ? "✓" : "✗"}
                                </span>{" "}
                                {testResult.result.count} job
                                {testResult.result.count !== 1 ? "s" : ""} found
                                {testResult.result.sample.length > 0 &&
                                  " · sample:"}
                              </p>
                              {testResult.result.sample.map((j, i) => (
                                <p
                                  key={i}
                                  className="text-xs text-(--text-secondary) pl-3"
                                >
                                  <a
                                    href={j.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-(--accent-cyan) hover:underline"
                                  >
                                    {j.title}
                                  </a>
                                  {" @ "}
                                  {j.company}
                                </p>
                              ))}
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
